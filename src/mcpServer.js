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
 * All tools are always available
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

      // Execute the handler
      const result = await allHandlers[name](args);
      console.log(`✅ Tool ${name} executed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Error executing tool ${name}:`, error);

      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
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
