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
    description: "List all cryptocurrency exchanges supported by the CCXT library. Optionally filter for CCXT-certified exchanges only.",
    inputSchema: {
      type: "object",
      properties: {
        certified: {
          type: "boolean",
          description: "If true, returns only CCXT-certified exchanges with guaranteed API stability",
        },
      },
      required: [],
    },
  },
  {
    name: "get_ticker",
    description: "Retrieve real-time ticker data for a specific trading pair, including current price, 24h volume, bid/ask spreads, and price changes.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair in format BASE/QUOTE (e.g., 'BTC/USDT', 'ETH/USD')",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "batch_get_tickers",
    description: "Efficiently retrieve ticker data for multiple trading pairs in a single request. Ideal for monitoring portfolios or comparing prices across pairs.",
    inputSchema: {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Array of trading pairs (e.g., ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbols"],
    },
  },
  {
    name: "get_orderbook",
    description: "Fetch the current order book depth showing all active buy and sell orders. Use this to analyze market liquidity and support/resistance levels.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair in format BASE/QUOTE (e.g., 'BTC/USDT')",
        },
        limit: {
          type: "number",
          description: `Maximum number of price levels to return per side (default: ${LIMITS.orderbook}). Higher values provide deeper market insight.`,
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_ohlcv",
    description: "Retrieve historical candlestick (OHLCV) data for technical analysis. Each candle contains Open, High, Low, Close prices and trading Volume.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair in format BASE/QUOTE (e.g., 'BTC/USDT')",
        },
        timeframe: {
          type: "string",
          description: "Candlestick interval (e.g., '1m' for 1 minute, '5m', '15m', '1h', '4h', '1d' for daily)",
          enum: TIMEFRAMES,
        },
        limit: {
          type: "number",
          description: `Maximum number of candles to return (default: ${LIMITS.ohlcv}). Note: more candles require longer processing time.`,
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching data from. If omitted, returns most recent candles.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "timeframe"],
    },
  },
  {
    name: "get_trades",
    description: "Fetch recent executed trades for a trading pair. Useful for analyzing real-time market activity, trade flow, and price discovery.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair in format BASE/QUOTE (e.g., 'BTC/USDT')",
        },
        limit: {
          type: "number",
          description: "Maximum number of recent trades to return (default: 50)",
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching trades from. If omitted, returns most recent trades.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "load_markets",
    description: "Load and cache all available spot markets from exchange. Returns only SPOT trading pairs (filters out futures/swap/options). Fast operation as data is cached after first call.",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
        reload: {
          type: "boolean",
          description: "Force reload markets from exchange (default: false, uses cache)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_markets",
    description: "Retrieve comprehensive list of all trading pairs (markets) available on an exchange using fetchMarkets. Returns detailed market information including symbols, types (spot/futures/swap), status, limits, precision, and fees. Filter by symbol or market type.",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
        search: {
          type: "string",
          description: "Filter markets by partial symbol match (e.g., 'BTC' returns all BTC pairs, 'USDT' returns all USDT quote pairs)",
        },
        type: {
          type: "string",
          description: "Filter by market type: 'spot' for regular trading, 'future' for futures contracts, 'swap' for perpetual swaps, 'option' for options",
          enum: ["spot", "future", "swap", "option"],
        },
        active: {
          type: "boolean",
          description: "Filter by active status. true = only active markets, false = only inactive markets, undefined = all markets",
        },
        limit: {
          type: "number",
          description: "Maximum number of markets to return (default: 100)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_exchange_info",
    description: "Retrieve detailed information about an exchange, including supported features, trading fees, API rate limits, and operational status.",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_leverage_tiers",
    description: "Get maximum leverage limits and position size tiers for futures trading. Essential for risk management and position sizing.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Futures trading pair (e.g., 'BTC/USDT')",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_funding_rates",
    description: "Retrieve current and historical funding rates for perpetual futures contracts. Funding rates determine periodic payments between long and short positions.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Perpetual futures symbol (e.g., 'BTC/USDT'). Omit to get rates for all available symbols.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_open_orders",
    description: "Retrieve all pending (unfilled) orders. Note: Most exchanges require authentication for this endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to filter orders (optional). Omit to get all open orders across all pairs.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_order_history",
    description: "Retrieve historical orders (filled, canceled, or expired). Note: Most exchanges require authentication for this endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to filter order history (optional). Omit to get all historical orders.",
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching orders from. Useful for paginated queries.",
        },
        limit: {
          type: "number",
          description: "Maximum number of orders to return (default varies by exchange, typically 100)",
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
    name: "get_server_time",
    description: "Fetch the current server time from the exchange. Useful for synchronization and checking exchange connectivity.",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: `Exchange to query (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_currencies",
    description: "Retrieve list of all supported currencies/assets on the exchange, including currency metadata (name, precision, deposit/withdrawal status).",
    inputSchema: {
      type: "object",
      properties: {
        exchange: {
          type: "string",
          description: `Exchange to query (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_bids_asks",
    description: "Fetch best bid and ask prices for multiple trading pairs simultaneously. Efficient for monitoring price spreads across markets.",
    inputSchema: {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Array of trading pairs (e.g., ['BTC/USDT', 'ETH/USDT']). Omit to get all available pairs.",
        },
        exchange: {
          type: "string",
          description: `Exchange to query (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_trading_fees",
    description: "Retrieve trading fee structure for the exchange. Shows maker/taker fees by tier and symbol. Note: Some exchanges require authentication to see account-specific fees.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to get fees for (optional). Omit to get general fee structure.",
        },
        exchange: {
          type: "string",
          description: `Exchange to query (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: [],
    },
  },
  {
    name: "get_my_trades",
    description: "Fetch your personal trade history (executed trades). Requires authentication. Useful for tracking profit/loss and trade performance.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to filter trades (e.g., 'BTC/USDT'). Omit to get all trades.",
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching from",
        },
        limit: {
          type: "number",
          description: "Maximum number of trades to return (default varies by exchange)",
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
    name: "get_order",
    description: "Fetch details of a specific order by ID. Requires authentication. Shows current status, filled amount, fees, and timestamps.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "Order ID to fetch",
        },
        symbol: {
          type: "string",
          description: "Trading pair (e.g., 'BTC/USDT'). Required by some exchanges.",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["orderId"],
    },
  },
  {
    name: "get_all_orders",
    description: "Retrieve all orders (open, closed, canceled) for a trading pair. Requires authentication. Comprehensive view of order history.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair (e.g., 'BTC/USDT'). Required by most exchanges.",
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching from",
        },
        limit: {
          type: "number",
          description: "Maximum number of orders to return",
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
    name: "get_closed_orders",
    description: "Fetch all closed (filled) orders. Requires authentication. Shows completed trades with final execution details.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to filter orders (optional)",
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching from",
        },
        limit: {
          type: "number",
          description: "Maximum number of orders to return",
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
    name: "get_canceled_orders",
    description: "Retrieve all canceled orders. Requires authentication. Useful for analyzing unsuccessful trades and market conditions.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to filter orders (optional)",
        },
        since: {
          type: "number",
          description: "Unix timestamp in milliseconds to start fetching from",
        },
        limit: {
          type: "number",
          description: "Maximum number of orders to return",
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
   * Handler for load_markets
   */
  load_markets: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    
    // Load markets (with cache unless reload=true)
    await exchange.loadMarkets(args.reload);
    
    // Get all markets and filter for SPOT only
    let markets = Object.values(exchange.markets);
    markets = markets.filter((market) => market.spot === true || market.type === 'spot');
    
    // Map to simplified format
    const spotMarkets = markets.map((market) => ({
      symbol: market.symbol,
      id: market.id,
      base: market.base,
      quote: market.quote,
      baseId: market.baseId,
      quoteId: market.quoteId,
      active: market.active,
      precision: {
        amount: market.precision?.amount,
        price: market.precision?.price,
      },
      limits: {
        amount: market.limits?.amount,
        price: market.limits?.price,
        cost: market.limits?.cost,
      },
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              type: "spot",
              count: spotMarkets.length,
              cached: !args.reload,
              symbols: spotMarkets,
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

    // Use fetchMarkets if available, otherwise fall back to loadMarkets
    let markets;
    if (exchange.has.fetchMarkets) {
      markets = await exchange.fetchMarkets();
    } else {
      await exchange.loadMarkets();
      markets = Object.values(exchange.markets);
    }

    // Filter by search term (symbol, base, or quote)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      markets = markets.filter((market) =>
        market.symbol?.toLowerCase().includes(searchLower) ||
        market.base?.toLowerCase().includes(searchLower) ||
        market.quote?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (args.type) {
      markets = markets.filter((market) => market.type === args.type);
    }

    // Filter by active status
    if (args.active !== undefined) {
      markets = markets.filter((market) => market.active === args.active);
    }

    // Apply limit
    const limit = args.limit || 100;
    const totalMatched = markets.length;
    markets = markets.slice(0, limit);

    // Map to detailed market info
    const marketList = markets.map((market) => ({
      symbol: market.symbol,
      id: market.id,
      base: market.base,
      quote: market.quote,
      baseId: market.baseId,
      quoteId: market.quoteId,
      active: market.active,
      type: market.type,
      spot: market.spot,
      margin: market.margin,
      future: market.future,
      swap: market.swap,
      option: market.option,
      contract: market.contract,
      linear: market.linear,
      inverse: market.inverse,
      // Precision info
      precision: market.precision,
      // Limits (min/max amounts)
      limits: market.limits,
      // Fee info (if available)
      maker: market.maker,
      taker: market.taker,
      // Additional info
      info: market.info ? '(raw exchange data available)' : undefined,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              count: marketList.length,
              totalMatched: totalMatched,
              totalAvailable: exchange.symbols?.length || 'unknown',
              filters: {
                search: args.search || 'none',
                type: args.type || 'all',
                active: args.active !== undefined ? args.active : 'all',
              },
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

  /**
   * Handler for get_server_time
   */
  get_server_time: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);

    if (!exchange.has.fetchTime) {
      throw new Error(`${exchangeName} does not support fetchTime`);
    }

    const serverTime = await exchange.fetchTime();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              serverTime: serverTime,
              serverTimeISO: new Date(serverTime).toISOString(),
              localTime: Date.now(),
              localTimeISO: new Date().toISOString(),
              timeDifference: serverTime - Date.now(),
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_currencies
   */
  get_currencies: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);

    if (!exchange.has.fetchCurrencies) {
      throw new Error(`${exchangeName} does not support fetchCurrencies`);
    }

    await exchange.loadMarkets();
    const currencies = await exchange.fetchCurrencies();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              count: Object.keys(currencies).length,
              currencies: currencies,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_bids_asks
   */
  get_bids_asks: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const exchange = getExchange(exchangeName);
    await exchange.loadMarkets();

    if (!exchange.has.fetchBidsAsks) {
      throw new Error(`${exchangeName} does not support fetchBidsAsks`);
    }

    const bidsAsks = await exchange.fetchBidsAsks(args.symbols);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              count: Object.keys(bidsAsks).length,
              bidsAsks: bidsAsks,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_trading_fees
   */
  get_trading_fees: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);
    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchTradingFees && !exchange.has.fetchTradingFee) {
      throw new Error(`${exchangeName} does not support trading fees query`);
    }

    let fees;
    if (args.symbol && exchange.has.fetchTradingFee) {
      fees = await exchange.fetchTradingFee(args.symbol);
    } else if (exchange.has.fetchTradingFees) {
      fees = await exchange.fetchTradingFees();
    } else {
      throw new Error(`${exchangeName} cannot fetch fees for the requested parameters`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol || "all",
              fees: fees,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_my_trades
   */
  get_my_trades: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchMyTrades) {
      throw new Error(`${exchangeName} does not support fetchMyTrades`);
    }

    const limit = args.limit || 50;
    const trades = await exchange.fetchMyTrades(args.symbol, args.since, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol || "all",
              count: trades.length,
              trades: trades,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_order
   */
  get_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchOrder) {
      throw new Error(`${exchangeName} does not support fetchOrder`);
    }

    const order = await exchange.fetchOrder(args.orderId, args.symbol);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              order: order,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_all_orders
   */
  get_all_orders: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchOrders) {
      throw new Error(`${exchangeName} does not support fetchOrders`);
    }

    const limit = args.limit || 100;
    const orders = await exchange.fetchOrders(args.symbol, args.since, limit);

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
  },

  /**
   * Handler for get_closed_orders
   */
  get_closed_orders: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchClosedOrders) {
      throw new Error(`${exchangeName} does not support fetchClosedOrders`);
    }

    const limit = args.limit || 100;
    const orders = await exchange.fetchClosedOrders(args.symbol, args.since, limit);

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
  },

  /**
   * Handler for get_canceled_orders
   */
  get_canceled_orders: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.fetchCanceledOrders && !exchange.has.fetchOrders) {
      throw new Error(`${exchangeName} does not support fetchCanceledOrders`);
    }

    const limit = args.limit || 100;
    let orders;

    if (exchange.has.fetchCanceledOrders) {
      orders = await exchange.fetchCanceledOrders(args.symbol, args.since, limit);
    } else {
      // Fallback: fetch all orders and filter canceled ones
      const allOrders = await exchange.fetchOrders(args.symbol, args.since, limit);
      orders = allOrders.filter(order => order.status === 'canceled');
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
  },
};
