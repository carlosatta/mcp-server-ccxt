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
  const requestTimeout = 30000; // 30 seconds timeout per request

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
      // Create new transport for initialization
      // Accept session ID from client if provided, otherwise generate new one
      const useSessionId = sessionId || randomUUID();

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => useSessionId,
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
          sessionMetadata.set(newSessionId, {
            connectedAt: new Date(),
            lastActivity: new Date(),
            clientIp: req.ip,
            userAgent: req.get('user-agent'),
            requestCount: 0,
            errorCount: 0
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
          code: -32000,
          message: 'Bad Request: Session ID required (call initialize first)'
        },
        id: req.body?.id || null
      });
      return;
    } else {
      // Session ID provided but unknown - auto-recreate session (fallback for non-compliant clients)
      console.warn(`⚠️ Session ${sessionId} expired/unknown, auto-recreating (fallback for client compatibility)`);
      
      const useSessionId = sessionId; // Keep client's session ID
      
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => useSessionId,
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
          sessionMetadata.set(newSessionId, {
            connectedAt: new Date(),
            lastActivity: new Date(),
            clientIp: req.ip,
            userAgent: req.get('user-agent'),
            requestCount: 0,
            errorCount: 0,
            autoRecreated: true // Flag per indicare sessione ricreata automaticamente
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
      
      // Auto-initialize the session before processing the actual request
      if (req.body?.method !== 'initialize') {
        // Force initialize internally to make session ready
        try {
          // Trigger session initialization
          transport.sessionId = useSessionId;
          transports.set(useSessionId, transport);
          sessionMetadata.set(useSessionId, {
            connectedAt: new Date(),
            lastActivity: new Date(),
            clientIp: req.ip,
            userAgent: req.get('user-agent'),
            requestCount: 0,
            errorCount: 0,
            autoRecreated: true
          });
        } catch (initError) {
          console.error(`Failed to auto-initialize session ${sessionId}:`, initError.message);
        }
      }
    }

    // Set response timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏰ Request timeout for session ${sessionId}`);
        // Don't close transport, just fail this request
        res.status(504).json({
          jsonrpc: '2.0',
          error: {
            code: -32001,
            message: 'Gateway Timeout: Request exceeded 30 seconds'
          },
          id: req.body?.id || null
        });
      }
    }, requestTimeout);

    // Handle the request with timeout protection
    try {
      await Promise.race([
        transport.handleRequest(req, res, req.body),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), requestTimeout)
        )
      ]);
      clearTimeout(timeoutId);

      // Update metadata on success
      const metadata = sessionMetadata.get(sessionId);
      if (metadata) {
        metadata.requestCount = (metadata.requestCount || 0) + 1;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Update error count but keep session alive
      const metadata = sessionMetadata.get(sessionId);
      if (metadata) {
        metadata.errorCount = (metadata.errorCount || 0) + 1;
      }

      // If too many errors, recreate transport
      if (metadata && metadata.errorCount > 5) {
        console.error(`🔄 Too many errors for session ${sessionId}, recreating transport`);
        try {
          transport.close();
        } catch (e) {
          // Ignore close errors
        }
        transports.delete(sessionId);
        sessionMetadata.delete(sessionId);
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

// Cleanup inactive sessions every 30 seconds (5min timeout)
const INACTIVE_TIMEOUT_MS = 300 * 1000; // 5 minutes (was 60s)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, transport] of transports.entries()) {
    const metadata = sessionMetadata.get(sessionId);
    if (metadata && metadata.lastActivity) {
      const inactiveMs = now - metadata.lastActivity;
      if (inactiveMs > INACTIVE_TIMEOUT_MS) {
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
}, 30000); // Check every 30 seconds (was 10s)

app.listen(PORT, HOST, () => {
  console.log("=".repeat(60));
  console.log(`🚀 MCP CCXT Server v${SERVER_CONFIG.version}`);
  console.log("=".repeat(60));
  console.log(`📡 MCP Endpoint: http://${HOST}:${PORT}/mcp`);
  console.log(`🔌 REST API: http://${HOST}:${PORT}/api/tools`);
  console.log(`📊 Status: http://${HOST}:${PORT}/api/status`);
  console.log(`📖 Documentation: http://${HOST}:${PORT}/`);
  console.log(`💱 Exchanges: ${SUPPORTED_EXCHANGES.join(", ")}`);
  console.log("=".repeat(60));
});
