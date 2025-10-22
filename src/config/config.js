/**
 * Central MCP CCXT server configuration
 * Uses environment variables when available, otherwise uses default values
 */

export const SERVER_CONFIG = {
  name: "mcp-webserver-ccxt",
  version: "1.0.0",
  description: "Model Context Protocol server for crypto data via CCXT",
  host: process.env.HOST || "0.0.0.0",
  port: parseInt(process.env.PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || "info",
};

export const SUPPORTED_EXCHANGES = [
  "binance",
  "coinbase",
  "kraken",
  "bitfinex",
  "bybit",
];

export const DEFAULT_EXCHANGE = process.env.DEFAULT_EXCHANGE || "binance";

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
