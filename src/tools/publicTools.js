/**
 * Public tools - Do not require authentication
 * These tools can be used without API keys
 */

import { getExchange } from "../utils/exchangeManager.js";
import { SUPPORTED_EXCHANGES, TIMEFRAMES, LIMITS, DEFAULT_EXCHANGE, getExchangeCredentials } from "../config/config.js";
import ccxt from "ccxt";

/**
 * Public tools definitions for MCP
 */
export const publicToolsDefinitions = [
  {
    name: "list_exchanges",
    description: "List all available cryptocurrency exchanges supported by CCXT",
    inputSchema: {
      type: "object",
      properties: {
        certified: {
          type: "boolean",
          description: "Filter for CCXT certified exchanges only",
        },
      },
      required: [],
    },
  },
  {
    name: "get_ticker",
    description: "Get current ticker information for a trading pair",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT, ETH/USDT)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "batch_get_tickers",
    description: "Get ticker information for multiple trading pairs at once",
    inputSchema: {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Array of trading symbols (e.g. ['BTC/USDT', 'ETH/USDT'])",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbols"],
    },
  },
  {
    name: "get_orderbook",
    description: "Get market order book for a trading pair",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        limit: {
          type: "number",
          description: `Number of orders to retrieve (default: ${LIMITS.orderbook})`,
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_ohlcv",
    description: "Get OHLCV candlestick data for a trading pair",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        timeframe: {
          type: "string",
          description: "Timeframe (e.g. 1m, 5m, 1h, 1d)",
          enum: TIMEFRAMES,
        },
        limit: {
          type: "number",
          description: `Number of candles to retrieve (default: ${LIMITS.ohlcv})`,
        },
        since: {
          type: "number",
          description: "Timestamp in milliseconds to fetch from",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "timeframe"],
    },
  },
  {
    name: "get_trades",
    description: "Get recent trades for a trading pair",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        limit: {
          type: "number",
          description: "Number of trades to retrieve (default: 50)",
        },
        since: {
          type: "number",
          description: "Timestamp in milliseconds to fetch from",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_markets",
    description: "Get all available markets for an exchange",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
        search: {
          type: "string",
          description: "Filter markets by symbol (optional)",
        },
        type: {
          type: "string",
          description: "Market type filter (spot, future, swap, option)",
          enum: ["spot", "future", "swap", "option"],
        },
      },
      required: [],
    },
  },
  {
    name: "get_exchange_info",
    description: "Get exchange information and status",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: "Exchange to query (optional, default from env)",
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_leverage_tiers",
    description: "Get futures leverage tiers for a symbol",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_funding_rates",
    description: "Get current funding rates for perpetual futures",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT, optional for all symbols)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_positions",
    description: "Get open positions information (public data)",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (optional)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_open_orders",
    description: "Get all open orders (public data if available)",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (optional)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_order_history",
    description: "Get order history (public data if available)",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (optional)",
        },
        since: {
          type: "number",
          description: "Timestamp in milliseconds",
        },
        limit: {
          type: "number",
          description: "Number of orders to retrieve",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
];

/**
 * Public tools handlers
 */
export const publicToolsHandlers = {
  /**
   * Handler for list_exchanges
   */
  list_exchanges: async (args) => {
    const exchanges = ccxt.exchanges;
    let filteredExchanges = exchanges;

    if (args.certified) {
      const certified = [];
      for (const id of exchanges) {
        const exchange = new ccxt[id]();
        if (exchange.certified) {
          certified.push(id);
        }
      }
      filteredExchanges = certified;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              count: filteredExchanges.length,
              exchanges: filteredExchanges.sort(),
              configured: SUPPORTED_EXCHANGES,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_ticker
   */
  get_ticker: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    const ticker = await exchange.fetchTicker(args.symbol);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              timestamp: ticker.timestamp,
              datetime: ticker.datetime,
              last: ticker.last,
              bid: ticker.bid,
              ask: ticker.ask,
              high: ticker.high,
              low: ticker.low,
              open: ticker.open,
              close: ticker.close,
              baseVolume: ticker.baseVolume,
              quoteVolume: ticker.quoteVolume,
              change: ticker.change,
              percentage: ticker.percentage,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for batch_get_tickers
   */
  batch_get_tickers: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    const tickers = await exchange.fetchTickers(args.symbols);

    const result = {};
    for (const symbol of args.symbols) {
      if (tickers[symbol]) {
        result[symbol] = {
          last: tickers[symbol].last,
          bid: tickers[symbol].bid,
          ask: tickers[symbol].ask,
          high: tickers[symbol].high,
          low: tickers[symbol].low,
          volume: tickers[symbol].baseVolume,
          timestamp: tickers[symbol].timestamp,
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              count: Object.keys(result).length,
              tickers: result,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_orderbook
   */
  get_orderbook: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    const limit = args.limit || LIMITS.orderbook;
    const orderbook = await exchange.fetchOrderBook(args.symbol, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              timestamp: orderbook.timestamp,
              datetime: orderbook.datetime,
              bids: orderbook.bids.slice(0, limit),
              asks: orderbook.asks.slice(0, limit),
              nonce: orderbook.nonce,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_ohlcv
   */
  get_ohlcv: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    const limit = args.limit || LIMITS.ohlcv;
    const ohlcv = await exchange.fetchOHLCV(
      args.symbol,
      args.timeframe,
      args.since,
      limit
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              timeframe: args.timeframe,
              count: ohlcv.length,
              data: ohlcv.map((candle) => ({
                timestamp: candle[0],
                datetime: new Date(candle[0]).toISOString(),
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
                volume: candle[5],
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_trades
   */
  get_trades: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    const limit = args.limit || 50;
    const trades = await exchange.fetchTrades(args.symbol, args.since, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              count: trades.length,
              trades: trades.map((trade) => ({
                id: trade.id,
                timestamp: trade.timestamp,
                datetime: trade.datetime,
                symbol: trade.symbol,
                side: trade.side,
                price: trade.price,
                amount: trade.amount,
                cost: trade.cost,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_markets
   */
  get_markets: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    let markets = Object.values(exchange.markets);

    // Filter by search term
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      markets = markets.filter((market) =>
        market.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (args.type) {
      markets = markets.filter((market) => market.type === args.type);
    }

    const marketList = markets.slice(0, LIMITS.markets).map((market) => ({
      symbol: market.symbol,
      base: market.base,
      quote: market.quote,
      active: market.active,
      type: market.type,
      spot: market.spot,
      future: market.future,
      swap: market.swap,
      option: market.option,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              count: marketList.length,
              total: markets.length,
              markets: marketList,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_exchange_info
   */
  get_exchange_info: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              id: exchange.id,
              name: exchange.name,
              countries: exchange.countries,
              version: exchange.version,
              certified: exchange.certified,
              pro: exchange.pro,
              has: {
                fetchTicker: exchange.has.fetchTicker,
                fetchTickers: exchange.has.fetchTickers,
                fetchOrderBook: exchange.has.fetchOrderBook,
                fetchOHLCV: exchange.has.fetchOHLCV,
                fetchTrades: exchange.has.fetchTrades,
                fetchBalance: exchange.has.fetchBalance,
                createOrder: exchange.has.createOrder,
                cancelOrder: exchange.has.cancelOrder,
                fetchOpenOrders: exchange.has.fetchOpenOrders,
                fetchClosedOrders: exchange.has.fetchClosedOrders,
                fetchMyTrades: exchange.has.fetchMyTrades,
                fetchPositions: exchange.has.fetchPositions,
                fetchFundingRate: exchange.has.fetchFundingRate,
                fetchLeverageTiers: exchange.has.fetchLeverageTiers,
                setLeverage: exchange.has.setLeverage,
                setMarginMode: exchange.has.setMarginMode,
              },
              timeframes: exchange.timeframes,
              urls: exchange.urls,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_leverage_tiers
   */
  get_leverage_tiers: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    if (!exchange.has.fetchLeverageTiers) {
      throw new Error(`${exchangeName} does not support fetchLeverageTiers`);
    }

    const tiers = await exchange.fetchLeverageTiers([args.symbol]);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              tiers: tiers[args.symbol] || [],
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_funding_rates
   */
  get_funding_rates: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    if (!exchange.has.fetchFundingRate && !exchange.has.fetchFundingRates) {
      throw new Error(`${exchangeName} does not support funding rates`);
    }

    let rates;
    if (args.symbol) {
      if (exchange.has.fetchFundingRate) {
        const rate = await exchange.fetchFundingRate(args.symbol);
        rates = { [args.symbol]: rate };
      } else {
        const allRates = await exchange.fetchFundingRates();
        rates = { [args.symbol]: allRates[args.symbol] };
      }
    } else {
      rates = await exchange.fetchFundingRates();
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              timestamp: Date.now(),
              rates: rates,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_positions
   */
  get_positions: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    if (!exchange.has.fetchPositions) {
      throw new Error(`${exchangeName} does not support fetchPositions (requires authentication)`);
    }

    // Note: This typically requires authentication, but we try anyway
    try {
      const positions = await exchange.fetchPositions(args.symbol ? [args.symbol] : undefined);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                exchange: exchangeName,
                count: positions.length,
                positions: positions,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`This operation requires authentication. Please use private tools with configured API keys.`);
    }
  },

  /**
   * Handler for get_open_orders
   */
  get_open_orders: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchOpenOrders) {
      throw new Error(`${exchangeName} does not support fetchOpenOrders`);
    }

    try {
      const orders = await exchange.fetchOpenOrders(args.symbol);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                exchange: exchangeName,
                symbol: args.symbol || "all",
                count: orders.length,
                orders: orders,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Handler for get_order_history
   */
  get_order_history: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchClosedOrders && !exchange.has.fetchOrders) {
      throw new Error(`${exchangeName} does not support order history`);
    }

    try {
      const limit = args.limit || 50;
      let orders;

      if (exchange.has.fetchClosedOrders) {
        orders = await exchange.fetchClosedOrders(args.symbol, args.since, limit);
      } else {
        orders = await exchange.fetchOrders(args.symbol, args.since, limit);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                exchange: exchangeName,
                symbol: args.symbol || "all",
                count: orders.length,
                orders: orders,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw error;
    }
  },
};
