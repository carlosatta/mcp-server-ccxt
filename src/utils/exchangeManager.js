/**
 * Module for managing CCXT exchanges
 */

import ccxt from "ccxt";
import { DEFAULT_EXCHANGE, SUPPORTED_EXCHANGES } from "../config/config.js";

/**
 * Cache for already initialized exchanges
 */
const exchangeCache = new Map();

/**
 * Gets a CCXT exchange instance
 * @param {string} exchangeName - Exchange name
 * @param {object} credentials - Optional credentials (apiKey, secret)
 * @returns {object} CCXT exchange instance
 */
export function getExchange(exchangeName = DEFAULT_EXCHANGE, credentials = null) {
  const name = exchangeName.toLowerCase();

  if (!SUPPORTED_EXCHANGES.includes(name)) {
    throw new Error(
      `Exchange not supported: ${name}. Supported: ${SUPPORTED_EXCHANGES.join(", ")}`
    );
  }

  // If credentials provided, don't use cache
  if (credentials) {
    return createExchangeInstance(name, credentials);
  }

  // Use cache for public exchanges
  if (!exchangeCache.has(name)) {
    exchangeCache.set(name, createExchangeInstance(name, null));
  }

  return exchangeCache.get(name);
}

/**
 * Creates a new exchange instance
 * @param {string} name - Exchange name
 * @param {object} credentials - Optional credentials
 * @returns {object} Exchange instance
 */
function createExchangeInstance(name, credentials) {
  const config = credentials
    ? {
        apiKey: credentials.apiKey,
        secret: credentials.secret,
        password: credentials.password, // For some exchanges like OKX
      }
    : {};

  switch (name) {
    case "coinbase":
      return new ccxt.coinbase(config);
    case "kraken":
      return new ccxt.kraken(config);
    case "bitfinex":
      return new ccxt.bitfinex(config);
    case "bybit":
      return new ccxt.bybit(config);
    case "binance":
    default:
      return new ccxt.binance(config);
  }
}

/**
 * Clears the exchange cache
 */
export function clearExchangeCache() {
  exchangeCache.clear();
}

/**
 * Checks if an exchange is supported
 * @param {string} exchangeName - Exchange name
 * @returns {boolean}
 */
export function isExchangeSupported(exchangeName) {
  return SUPPORTED_EXCHANGES.includes(exchangeName.toLowerCase());
}
