/**
 * Modular MCP Server
 * Handles Model Context Protocol server logic
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SERVER_CONFIG } from "./config/config.js";
import { publicToolsDefinitions, publicToolsHandlers } from "./tools/publicTools.js";
import { privateToolsDefinitions, privateToolsHandlers } from "./tools/privateTools.js";

/**
 * Creates and configures the MCP server
 * @returns {object} MCP server instance
 */
export function createMCPServer() {
  // Create MCP server
  const server = new Server(
    {
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Combine all tools (public and private)
  const allTools = [...publicToolsDefinitions, ...privateToolsDefinitions];
  const allHandlers = { ...publicToolsHandlers, ...privateToolsHandlers };

  // Handler to list available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log("📋 List tools request received");
    console.log(`   Returning ${allTools.length} tools (${publicToolsDefinitions.length} public, ${privateToolsDefinitions.length} private)`);
    return {
      tools: allTools,
    };
  });

  // Handler for tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.log(`🔧 Tool execution request: ${name}`);
    console.log(`   Arguments:`, JSON.stringify(args, null, 2));
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    try {
      // Find the correct handler
      if (!allHandlers[name]) {
        console.error(`❌ Unknown tool: ${name}`);
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
      }

      console.log(`⏳ Executing handler for ${name}...`);
      // Execute the handler
      const startTime = Date.now();
      const result = await allHandlers[name](args);
      const executionTime = Date.now() - startTime;

      console.log(`✅ Tool ${name} executed successfully in ${executionTime}ms`);
      console.log(`   Response size: ${JSON.stringify(result).length} bytes`);
      return result;
    } catch (error) {
      console.error(`❌ Error executing tool ${name}:`, error);
      console.error(`   Error type: ${error.constructor.name}`);
      console.error(`   Error message: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack trace: ${error.stack}`);
      }

      // Return error to client, don't crash server
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${error.message}\n\nType: ${error.constructor.name}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Gets server statistics
 * @returns {object} Server statistics
 */
export function getServerStats() {
  return {
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
    description: SERVER_CONFIG.description,
    toolsCount: publicToolsDefinitions.length + privateToolsDefinitions.length,
    publicToolsCount: publicToolsDefinitions.length,
    privateToolsCount: privateToolsDefinitions.length,
    uptime: process.uptime(),
  };
}
