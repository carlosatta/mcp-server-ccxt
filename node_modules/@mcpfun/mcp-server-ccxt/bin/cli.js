#!/usr/bin/env node

/**
 * CCXT MCP Server - Command Line Interface
 * 
 * This file provides a CLI wrapper around the main server functionality,
 * making it easier to start the server from the command line when installed globally.
 */

// Import and run the main server module
import '../build/index.js';

// The server itself is started by the imported module
// No additional code needed here as the imported module sets up process handlers