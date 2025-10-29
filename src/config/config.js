/**
 export const SERVER_CONFIG = {
  name: "mcp-server-ccxt",
  version: "1.0.0",
  description: "MCP Server CCXT - Cryptocurrency Exchange API Tools",
  host: process.env.HOST || "0.0.0.0",tral MCP CCXT server configuration
 * Uses environment variables when available, otherwise uses default values
 */

export const SERVER_CONFIG = {
  name: "mcp-webserver-ccxt",
  version: "1.0.0",
  description: "Model Context Protocol server for crypto data via CCXT",
  host: process.env.HOST || "0.0.0.0",
  port: parseInt(process.env.PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || "info",
  requestTimeout: 30000, // 30 seconds timeout for requests
  
  // Session management configuration
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT_MS) || 300000, // 5 minutes
  sessionCleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL_MS) || 30000, // 30 seconds
  allowAutoSessionRecreate: process.env.ALLOW_AUTO_SESSION_RECREATE === 'true', // Default: false (standard compliant)
  maxSessionErrors: parseInt(process.env.MAX_SESSION_ERRORS) || 10, // Disabled if 0
};

export const SUPPORTED_EXCHANGES = [
  "coinbase",
  "binance",
  "kraken",
  "bitfinex",
  "bybit",
];

export const DEFAULT_EXCHANGE = process.env.DEFAULT_EXCHANGE || "coinbase";

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

export const ENDPOINTS = {
  sse: "/sse",
  message: "/message",
  health: "/health",
  root: "/",
};

export const LIMITS = {
  orderbook: parseInt(process.env.ORDERBOOK_LIMIT) || 10,
  ohlcv: parseInt(process.env.OHLCV_LIMIT) || 100,
  markets: parseInt(process.env.MARKETS_LIMIT) || 50,
};

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : '*',
  credentials: true,
};

/**
 * Get API credentials for a specific exchange
 * @param {string} exchangeName - Exchange name
 * @returns {object|null} Credentials or null if not configured
 */
export function getExchangeCredentials(exchangeName) {
  const upperName = exchangeName.toUpperCase();
  const apiKey = process.env[`${upperName}_API_KEY`];
  const secret = process.env[`${upperName}_SECRET`];
  const password = process.env[`${upperName}_PASSWORD`];

  if (!apiKey || !secret) {
    return null;
  }

  return {
    apiKey,
    secret,
    ...(password && { password }),
  };
}
