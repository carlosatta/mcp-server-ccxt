#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import { createMCPServer, getServerStats } from "./src/mcpServer.js";
import {
  SERVER_CONFIG,
  SUPPORTED_EXCHANGES,
  ENDPOINTS,
  CORS_CONFIG
} from "./src/config/config.js";

const app = express();
const HOST = SERVER_CONFIG.host;
const PORT = SERVER_CONFIG.port;

app.use(cors(CORS_CONFIG));
app.use(express.json());

const server = createMCPServer();

// Store transports by session ID
const transports = new Map();

app.get(ENDPOINTS.sse, async (req, res) => {
  console.log("📡 New SSE connection received");

  try {
    const transport = new SSEServerTransport(ENDPOINTS.message, res);

    // Get session ID from transport
    const sessionId = transport.sessionId;

    // Store transport
    transports.set(sessionId, transport);
    console.log(`✅ Transport created (session: ${sessionId})`);

    // Set up onclose handler
    transport.onclose = () => {
      console.log(`🔌 SSE connection closed (session: ${sessionId})`);
      transports.delete(sessionId);
    };

    // Connect server to transport
    await server.connect(transport);
    console.log(`✅ MCP server connected to transport (session: ${sessionId})`);
  } catch (error) {
    console.error("❌ Error establishing SSE stream:", error);
    if (!res.headersSent) {
      res.status(500).send("Error establishing SSE stream");
    }
  }
});

app.post(ENDPOINTS.message, async (req, res) => {
  console.log("� Message received");

  // Get session ID from query parameter
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    console.error("❌ No session ID provided in request URL");
    res.status(400).send("Missing sessionId parameter");
    return;
  }

  const transport = transports.get(sessionId);

  if (!transport) {
    console.error(`❌ No active transport found for session ID: ${sessionId}`);
    res.status(404).send("Session not found");
    return;
  }

  try {
    console.log(`   Session: ${sessionId}`);
    console.log(`   Method: ${req.body.method}`);

    // Handle the POST message with the transport
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error("❌ Error handling request:", error);
    if (!res.headersSent) {
      res.status(500).send("Error handling request");
    }
  }
});

app.get(ENDPOINTS.health, (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get(ENDPOINTS.root, (req, res) => {
  const stats = getServerStats();
  res.json({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
    description: SERVER_CONFIG.description,
    endpoints: {
      sse: ENDPOINTS.sse,
      message: ENDPOINTS.message,
      health: ENDPOINTS.health,
      stats: "/stats",
    },
    supportedExchanges: SUPPORTED_EXCHANGES,
    tools: {
      total: stats.toolsCount,
      public: stats.publicToolsCount,
      private: stats.privateToolsCount,
    },
  });
});

app.get("/stats", (req, res) => {
  const stats = getServerStats();
  res.json(stats);
});

app.listen(PORT, HOST, () => {
  console.log("=".repeat(60));
  console.log(`🚀 MCP CCXT Server started successfully!`);
  console.log("=".repeat(60));
  console.log(`📦 Name: ${SERVER_CONFIG.name}`);
  console.log(`📋 Version: ${SERVER_CONFIG.version}`);
  console.log(`🌐 Host: ${HOST}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`📝 Log Level: ${SERVER_CONFIG.logLevel}`);
  console.log("");
  console.log("📡 Endpoints:");
  console.log(`   - SSE:     http://${HOST}:${PORT}${ENDPOINTS.sse}`);
  console.log(`   - Message: http://${HOST}:${PORT}${ENDPOINTS.message}`);
  console.log(`   - Health:  http://${HOST}:${PORT}${ENDPOINTS.health}`);
  console.log(`   - Info:    http://${HOST}:${PORT}${ENDPOINTS.root}`);
  console.log(`   - Stats:   http://${HOST}:${PORT}/stats`);
  console.log("");
  console.log(`💱 Supported exchanges: ${SUPPORTED_EXCHANGES.join(", ")}`);
  console.log(`📍 Default exchange: ${process.env.DEFAULT_EXCHANGE || "binance"}`);
  console.log("=".repeat(60));
});
