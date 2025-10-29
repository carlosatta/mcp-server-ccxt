#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import { createMCPServer } from "./src/mcpServer.js";
import { setupRestApi } from "./src/restApi.js";
import {
  SERVER_CONFIG,
  SUPPORTED_EXCHANGES,
  CORS_CONFIG
} from "./src/config/config.js";

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('   Stack:', error.stack);
  // Don't exit, keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  console.error('   Promise:', promise);
  // Don't exit, keep server running
});

const app = express();
const HOST = SERVER_CONFIG.host;
const PORT = SERVER_CONFIG.port;

// Configure CORS to expose Mcp-Session-Id header
app.use(cors({
  ...CORS_CONFIG,
  exposedHeaders: ['Mcp-Session-Id', ...(CORS_CONFIG.exposedHeaders || [])]
}));
app.use(express.json());

const server = createMCPServer();

// Store transports by session ID with metadata
const transports = new Map();
const sessionMetadata = new Map();

//=============================================================================
// REST API ENDPOINTS
//=============================================================================
setupRestApi(app, transports, sessionMetadata);

//=============================================================================
// MCP ENDPOINT - Streamable HTTP Transport (Protocol 2025-03-26)
//=============================================================================
app.all('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  try {
    let transport;

    if (sessionId && transports.has(sessionId)) {
      // Reuse existing transport
      transport = transports.get(sessionId);

      // Update last activity
      const metadata = sessionMetadata.get(sessionId);
      if (metadata) {
        metadata.lastActivity = new Date();
      }
    } else if (req.method === 'POST' && req.body?.method === 'initialize') {
      // Create new transport for initialization - STANDARD: generate new UUID
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
          sessionMetadata.set(newSessionId, {
            connectedAt: new Date(),
            lastActivity: new Date(),
            clientIp: req.ip,
            userAgent: req.get('user-agent'),
          });
        }
      });

      // Set up onclose handler
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports.has(sid)) {
          transports.delete(sid);
          sessionMetadata.delete(sid);
        }
      };

      // Connect server to transport
      await server.connect(transport);
    } else if (!sessionId) {
      // Invalid request - no session ID and not initialize
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: Session ID required'
        },
        id: req.body?.id || null
      });
      return;
    } else if (SERVER_CONFIG.allowAutoSessionRecreate) {
      // NON-STANDARD: Auto-recreate session for non-compliant clients (configurable)
      console.warn(`⚠️ Session ${sessionId} not found, auto-recreating (non-standard behavior)`);

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => sessionId,
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
          sessionMetadata.set(newSessionId, {
            connectedAt: new Date(),
            lastActivity: new Date(),
            clientIp: req.ip,
            userAgent: req.get('user-agent'),
            autoRecreated: true
          });
        }
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports.has(sid)) {
          transports.delete(sid);
          sessionMetadata.delete(sid);
        }
      };

      await server.connect(transport);

      // Auto-initialize the session
      if (req.body?.method !== 'initialize') {
        transport.sessionId = sessionId;
        transports.set(sessionId, transport);
        sessionMetadata.set(sessionId, {
          connectedAt: new Date(),
          lastActivity: new Date(),
          clientIp: req.ip,
          userAgent: req.get('user-agent'),
          autoRecreated: true
        });
      }
    } else {
      // STANDARD: Session not found - return 404
      res.status(404).json({
        jsonrpc: '2.0',
        error: {
          code: -32004,
          message: 'Session not found'
        },
        id: req.body?.id || null
      });
      return;
    }

    // Set response timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏰ Request timeout for session ${sessionId}`);
        res.status(504).json({
          jsonrpc: '2.0',
          error: {
            code: -32001,
            message: 'Gateway Timeout: Request exceeded timeout'
          },
          id: req.body?.id || null
        });
      }
    }, SERVER_CONFIG.requestTimeout);

    // Handle the request with timeout protection
    try {
      await Promise.race([
        transport.handleRequest(req, res, req.body),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), SERVER_CONFIG.requestTimeout)
        )
      ]);
      clearTimeout(timeoutId);

    } catch (error) {
      clearTimeout(timeoutId);

      // On timeout, close and cleanup the session to prevent transport blocking
      if (error.message === 'Request timeout') {
        console.error(`⏰ Request timeout for session ${sessionId} - closing transport to prevent blocking`);

        try {
          // Close the transport if it exists
          if (transport && typeof transport.close === 'function') {
            transport.close();
          }

          // Remove session from maps
          if (sessionId) {
            transports.delete(sessionId);
            sessionMetadata.delete(sessionId);
          }

          console.log(`🧹 Session ${sessionId} cleaned up after timeout`);
        } catch (cleanupError) {
          console.error(`❌ Error cleaning up session ${sessionId}:`, cleanupError.message);
        }
      } else {
        // Log other errors but don't modify session metadata
        console.error(`❌ Request error for session ${sessionId}:`, error.message);
      }

      throw error;
    }
  } catch (error) {
    console.error('❌ MCP Error:', error.message);

    // Always respond, never leave request hanging
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message || 'Internal server error'
        },
        id: req.body?.id || null
      });
    }
  }
});

// Session cleanup with configurable intervals
setInterval(() => {
  const now = new Date();
  for (const [sessionId, transport] of transports.entries()) {
    const metadata = sessionMetadata.get(sessionId);
    if (metadata && metadata.lastActivity) {
      const inactiveMs = now - metadata.lastActivity;
      if (inactiveMs > SERVER_CONFIG.sessionTimeout) {
        console.log(`🧹 Cleaning up inactive session ${sessionId} (${inactiveMs}ms inactive)`);
        try {
          transport.close();
          transports.delete(sessionId);
          sessionMetadata.delete(sessionId);
        } catch (error) {
          console.error(`Error closing session ${sessionId}:`, error.message);
        }
      }
    }
  }
}, SERVER_CONFIG.sessionCleanupInterval);

app.listen(PORT, HOST, () => {
  console.log("=".repeat(60));
  console.log(`🚀 MCP CCXT Server v${SERVER_CONFIG.version}`);
  console.log("=".repeat(60));
  console.log(`📡 MCP Endpoint: http://${HOST}:${PORT}/mcp`);
  console.log(`🔌 REST API: http://${HOST}:${PORT}/api/tools`);
  console.log(`📊 Status: http://${HOST}:${PORT}/api/status`);
  console.log(`📖 Documentation: http://${HOST}:${PORT}/`);
  console.log(`💱 Exchanges: ${SUPPORTED_EXCHANGES.join(", ")}`);
  console.log(`⚙️  Compatibility Mode: ${SERVER_CONFIG.allowAutoSessionRecreate ? 'ENABLED' : 'DISABLED (MCP Standard)'}`);
  console.log(`⏱️  Session Timeout: ${SERVER_CONFIG.sessionTimeout/1000}s`);
  console.log(`🧹 Cleanup Interval: ${SERVER_CONFIG.sessionCleanupInterval/1000}s`);
  console.log("=".repeat(60));
});
