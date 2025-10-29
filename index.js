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
      // MCP Standard: -32000 for Bad Request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000, // MCP Standard: Bad Request
          message: 'Invalid Request: Session ID required for non-initialize requests'
        },
        id: req.body?.id || null
      });
      return;
    } else if (SERVER_CONFIG.allowAutoSessionRecreate) {
      // NON-STANDARD: Auto-recreate session for legacy clients (disabled by default)
      console.warn(`⚠️ COMPATIBILITY MODE: Session ${sessionId} not found, auto-recreating (non-standard behavior)`);
      console.warn(`⚠️ Set ALLOW_AUTO_SESSION_RECREATE=false to use strict MCP standard (404 response)`);

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
      // STANDARD MCP: Session not found - return 404 with -32004
      // This is the correct behavior per MCP specification
      console.log(`❌ Session ${sessionId} not found - returning 404 (strict MCP mode)`);
      res.status(404).json({
        jsonrpc: '2.0',
        error: {
          code: -32004, // MCP Standard: Session not found
          message: `Session not found: ${sessionId}. Client must reinitialize.`
        },
        id: req.body?.id || null
      });
      return;
    }

    // ⚠️ NO GLOBAL TIMEOUT - Handled at tool level
    // Each tool implements its own timeout (default: 20s for CCXT operations)
    // This prevents session blocking and allows immediate error responses
    
    try {
      // Handle request directly without global timeout wrapper
      await transport.handleRequest(req, res, req.body);
      
    } catch (error) {
      // Log errors but let tools handle their own error responses
      console.error(`❌ Request error for session ${sessionId}:`, error.message);
      
      // If the error wasn't already handled by the tool, return internal error
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603, // MCP Standard: Internal error
            message: `Internal error: ${error.message}`
          },
          id: req.body?.id || null
        });
      }
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
