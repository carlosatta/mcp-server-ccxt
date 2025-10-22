#!/usr/bin/env node

/**
 * MCP Client Test Script
 * Tests the MCP server via SSE connection
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000";

console.log("=".repeat(60));
console.log("🧪 MCP Client Test Script");
console.log("=".repeat(60));
console.log(`📡 Connecting to: ${SERVER_URL}`);
console.log("");

async function testMCPServer() {
  try {
    // Create client
    console.log("1️⃣  Creating MCP client...");
    const client = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Create SSE transport
    console.log("2️⃣  Creating SSE transport...");
    const transport = new SSEClientTransport(
      new URL(`${SERVER_URL}/sse`),
      new URL(`${SERVER_URL}/message`)
    );

    // Connect to server
    console.log("3️⃣  Connecting to server...");
    await client.connect(transport);
    console.log("✅ Connected successfully!");
    console.log("");

    // List available tools
    console.log("4️⃣  Requesting list of tools...");
    const toolsResponse = await client.listTools();
    console.log(`✅ Received ${toolsResponse.tools.length} tools:`);
    console.log("");

    toolsResponse.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}`);
      console.log(`      Description: ${tool.description}`);
      console.log(`      Required params: ${tool.inputSchema.required?.join(", ") || "none"}`);
      console.log("");
    });

    // Test a public tool (get_ticker)
    console.log("5️⃣  Testing public tool: get_ticker");
    console.log("   Fetching BTC/USDT ticker from Binance...");
    const tickerResult = await client.callTool({
      name: "get_ticker",
      arguments: {
        symbol: "BTC/USDT",
        exchange: "binance",
      },
    });

    if (tickerResult.isError) {
      console.log("❌ Error:", tickerResult.content[0].text);
    } else {
      console.log("✅ Success!");
      const data = JSON.parse(tickerResult.content[0].text);
      console.log(`   Exchange: ${data.exchange}`);
      console.log(`   Symbol: ${data.symbol}`);
      console.log(`   Last Price: ${data.last}`);
      console.log(`   Bid: ${data.bid}`);
      console.log(`   Ask: ${data.ask}`);
      console.log(`   24h High: ${data.high}`);
      console.log(`   24h Low: ${data.low}`);
      console.log(`   24h Volume: ${data.volume}`);
    }
    console.log("");

    // Test get_markets
    console.log("6️⃣  Testing public tool: get_markets");
    console.log("   Listing markets with 'BTC' in name...");
    const marketsResult = await client.callTool({
      name: "get_markets",
      arguments: {
        exchange: "binance",
        search: "BTC",
      },
    });

    if (marketsResult.isError) {
      console.log("❌ Error:", marketsResult.content[0].text);
    } else {
      console.log("✅ Success!");
      const data = JSON.parse(marketsResult.content[0].text);
      console.log(`   Found ${data.count} markets (showing first 5):`);
      data.markets.slice(0, 5).forEach((market, index) => {
        console.log(`   ${index + 1}. ${market.symbol} (${market.type}, active: ${market.active})`);
      });
    }
    console.log("");

    // Close connection
    console.log("7️⃣  Closing connection...");
    await client.close();
    console.log("✅ Connection closed");
    console.log("");

    console.log("=".repeat(60));
    console.log("🎉 All tests completed successfully!");
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("=".repeat(60));
    console.error("❌ Test failed!");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    console.error("");
    console.error("Stack trace:");
    console.error(error.stack);
    console.error("=".repeat(60));
    process.exit(1);
  }
}

// Run tests
testMCPServer();
