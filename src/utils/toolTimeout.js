/**
 * Tool-level timeout wrapper for CCXT operations
 *
 * This utility provides timeout protection at the tool level instead of
 * using a global timeout. Each tool can specify its own timeout or use
 * the default (20 seconds for CCXT operations).
 *
 * Benefits:
 * - Prevents session blocking from long-running operations
 * - Returns immediate error responses instead of gateway timeouts
 * - Allows different timeouts for different operation types
 * - Keeps MCP transport responsive
 */

import { SERVER_CONFIG } from '../config/config.js';

/**
 * Wraps an async operation with a timeout
 *
 * @param {Function} operation - Async function to execute
 * @param {number} timeout - Timeout in milliseconds (default: SERVER_CONFIG.toolTimeout)
 * @param {string} operationName - Name for logging
 * @returns {Promise} Result of operation or timeout error
 */
export async function withToolTimeout(operation, timeout = null, operationName = 'Operation') {
  const effectiveTimeout = timeout || SERVER_CONFIG.toolTimeout || 20000;

  return Promise.race([
    operation(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operationName} timeout after ${effectiveTimeout}ms`)),
        effectiveTimeout
      )
    )
  ]);
}

/**
 * Wraps a tool handler with automatic timeout and error handling
 *
 * Usage in tool definitions:
 * ```javascript
 * {
 *   name: 'my_tool',
 *   handler: wrapToolHandler(async (args) => {
 *     // Your tool logic here
 *     return result;
 *   }, 'my_tool', 15000) // Optional: custom timeout
 * }
 * ```
 *
 * @param {Function} handler - Tool handler function
 * @param {string} toolName - Tool name for logging
 * @param {number} timeout - Optional custom timeout
 * @returns {Function} Wrapped handler with timeout and error handling
 */
export function wrapToolHandler(handler, toolName, timeout = null) {
  return async (args) => {
    try {
      // Execute handler with timeout
      const result = await withToolTimeout(
        () => handler(args),
        timeout,
        toolName
      );

      return result;

    } catch (error) {
      console.error(`❌ Tool ${toolName} error:`, error.message);

      // Return structured error response instead of throwing
      // This prevents propagating to global error handler
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error in ${toolName}: ${error.message}`
          }
        ]
      };
    }
  };
}

/**
 * Timeout configurations for different operation types
 * Can be extended as needed
 */
export const TOOL_TIMEOUTS = {
  // Market data operations (usually fast)
  MARKET_DATA: 10000,      // 10 seconds

  // Trading operations (may need more time)
  TRADING: 20000,          // 20 seconds

  // Account operations
  ACCOUNT: 15000,          // 15 seconds

  // Heavy operations (historical data, etc.)
  HEAVY: 30000,            // 30 seconds

  // Quick operations
  QUICK: 5000,             // 5 seconds
};
