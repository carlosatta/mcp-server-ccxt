#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import { createMCPServer } from "./src/mcpServer.js";
import {
  SERVER_CONFIG,
  SUPPORTED_EXCHANGES,
  CORS_CONFIG
} from "./src/config/config.js";

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
    } else if (!sessionId && req.method === 'POST' && req.body?.method === 'initialize') {
      // Create new transport for initialization
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
          sessionMetadata.set(newSessionId, {
            connectedAt: new Date(),
            lastActivity: new Date(),
            clientIp: req.ip,
            userAgent: req.get('user-agent')
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
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('❌ MCP Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
});

// Cleanup inactive sessions every 10 seconds (60s timeout)
const INACTIVE_TIMEOUT_MS = 60 * 1000;
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
}, 10000);

app.listen(PORT, HOST, () => {
  console.log("=".repeat(60));
  console.log(`🚀 MCP CCXT Server`);
  console.log("=".repeat(60));
  console.log(`🌐 ${HOST}:${PORT}/mcp`);
  console.log(`� Protocol: Streamable HTTP (2025-03-26)`);
  console.log(`💱 Exchanges: ${SUPPORTED_EXCHANGES.join(", ")}`);
  console.log("=".repeat(60));
});
