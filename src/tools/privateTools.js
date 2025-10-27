/**
 * Private tools - Require authentication
 * These tools need valid API credentials configured in .env
 */

import { getExchange } from "../utils/exchangeManager.js";
import {
  getExchangeCredentials,
  SUPPORTED_EXCHANGES,
  DEFAULT_EXCHANGE,
} from "../config/config.js";

/**
 * Private tools definitions for MCP
 */
export const privateToolsDefinitions = [
  {
    name: "account_balance",
    description: "Retrieve your complete account balance across all assets. Shows available, locked, and total balances for each currency you hold.",
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
    name: "list_accounts",
    description: "List all individual wallets/accounts in your exchange profile. Particularly useful for Coinbase which maintains separate wallets per currency.",
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
    name: "place_market_order",
    description: "Execute a market order immediately at the best available price. WARNING: Market orders have slippage risk. For Coinbase BUY orders, 'amount' specifies how much quote currency to spend (e.g., amount=10 means spend 10 USDC). For SELL orders, 'amount' is the quantity of base currency to sell. Minimum order size varies by exchange (typically ~$1-10 USD equivalent).",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair in format BASE/QUOTE (e.g., 'BTC/USDT')",
        },
        side: {
          type: "string",
          description: "'buy' to purchase the base currency, 'sell' to sell it",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "For Coinbase BUY: amount of quote currency to spend (min ~$1). For SELL or other exchanges: quantity of base currency to trade.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount"],
    },
  },
  {
    name: "place_limit_order",
    description: "Place a limit order that will only execute at your specified price or better. Use this to avoid slippage and control exact entry/exit prices. Order remains open until filled, canceled, or expired.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair in format BASE/QUOTE (e.g., 'BTC/USDT')",
        },
        side: {
          type: "string",
          description: "'buy' to purchase at or below limit price, 'sell' to sell at or above limit price",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "Quantity of base currency to buy or sell",
        },
        price: {
          type: "number",
          description: "Maximum price for buy orders, minimum price for sell orders",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount", "price"],
    },
  },
  {
    name: "cancel_order",
    description: "Cancel a specific pending order using its unique order ID. Note: Cannot cancel already filled or expired orders.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "Unique identifier of the order to cancel (obtained from order placement or order history)",
        },
        symbol: {
          type: "string",
          description: "Trading pair (required by some exchanges, e.g., 'BTC/USDT')",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["orderId"],
    },
  },
  {
    name: "cancel_all_orders",
    description: "Cancel all pending orders for a specific trading pair or across your entire account. Use with caution - this action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading pair to cancel orders for (e.g., 'BTC/USDT'). Omit to cancel ALL orders across all pairs.",
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
    name: "set_leverage",
    description: "Configure leverage multiplier for futures trading. Higher leverage increases both potential profits and losses. WARNING: Use leverage responsibly - liquidation risk increases with leverage.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Futures trading pair (e.g., 'BTC/USDT')",
        },
        leverage: {
          type: "number",
          description: "Leverage multiplier (common values: 1, 2, 5, 10, 20, 50, 100). Maximum leverage varies by exchange and symbol.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "leverage"],
    },
  },
  {
    name: "set_margin_mode",
    description: "Switch between isolated and cross margin modes for futures trading. ISOLATED: Each position has separate margin. CROSS: All positions share account margin. WARNING: Cross margin risks your entire account balance.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Futures trading pair (e.g., 'BTC/USDT')",
        },
        marginMode: {
          type: "string",
          description: "'isolated' = separate margin per position (recommended for risk management), 'cross' = shared margin across all positions",
          enum: ["isolated", "cross"],
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "marginMode"],
    },
  },
  {
    name: "place_futures_market_order",
    description: "Execute a futures market order immediately at current market price. Use 'reduceOnly' to close existing positions without opening new ones.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Futures trading pair (e.g., 'BTC/USDT')",
        },
        side: {
          type: "string",
          description: "'buy' to go long (profit from price increases), 'sell' to go short (profit from price decreases)",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "Contract quantity to trade (in base currency units)",
        },
        reduceOnly: {
          type: "boolean",
          description: "If true, order will only reduce existing position size (cannot open new positions or increase size)",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount"],
    },
  },
  {
    name: "place_futures_limit_order",
    description: "Place a futures limit order at specified price. Use 'postOnly' for maker-only orders (guaranteed no taker fees). Use 'reduceOnly' to close positions only.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Futures trading pair (e.g., 'BTC/USDT')",
        },
        side: {
          type: "string",
          description: "'buy' for long entry, 'sell' for short entry",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "Contract quantity to trade (in base currency units)",
        },
        price: {
          type: "number",
          description: "Limit price for order execution",
        },
        reduceOnly: {
          type: "boolean",
          description: "If true, can only reduce position size (useful for take-profit/stop-loss)",
        },
        postOnly: {
          type: "boolean",
          description: "If true, order will only act as maker (cancelled if would take liquidity). Typically pays lower fees.",
        },
        exchange: {
          type: "string",
          description: `Exchange name (defaults to '${DEFAULT_EXCHANGE}' if not specified)`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount", "price"],
    },
  },
  {
    name: "transfer_funds",
    description: "Transfer funds between different account types (e.g., spot wallet to futures wallet, or vice versa). Required before trading in different markets.",
    inputSchema: {
      type: "object",
      properties: {
        currency: {
          type: "string",
          description: "Currency code to transfer (e.g., 'USDT', 'BTC', 'ETH')",
        },
        amount: {
          type: "number",
          description: "Amount of currency to transfer",
        },
        fromAccount: {
          type: "string",
          description: "Source account",
          enum: ["spot", "futures", "margin", "swap"],
        },
        toAccount: {
          type: "string",
          description: "Destination account",
          enum: ["spot", "futures", "margin", "swap"],
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["currency", "amount", "fromAccount", "toAccount"],
    },
  },
  {
    name: "get_portfolios",
    description: "List all portfolios in your Coinbase account. Coinbase-specific feature for managing multiple portfolios. Each portfolio can contain different assets and trading strategies.",
    inputSchema: {
      type: "object",
      properties: {
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
    name: "get_portfolio_details",
    description: "Get detailed information about a specific portfolio including breakdown of holdings, allocations, and performance. Coinbase-specific feature.",
    inputSchema: {
      type: "object",
      properties: {
        portfolioId: {
          type: "string",
          description: "Portfolio UUID to fetch details for",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["portfolioId"],
    },
  },
  {
    name: "edit_order",
    description: "Modify an existing open order (typically changes price and/or quantity). Not all exchanges support this - some require cancel and recreate. Use this to adjust limit orders without losing queue position.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "Order ID to modify",
        },
        symbol: {
          type: "string",
          description: "Trading pair (e.g., 'BTC/USDT')",
        },
        side: {
          type: "string",
          description: "'buy' or 'sell'",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "New order quantity (optional - keep existing if not provided)",
        },
        price: {
          type: "number",
          description: "New limit price (optional - keep existing if not provided)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["orderId", "symbol"],
    },
  },
];

/**
 * Private tools handlers
 */
export const privateToolsHandlers = {
  /**
   * Handler for account_balance
   */
  account_balance: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    const balance = await exchange.fetchBalance();

    // Filter out zero balances
    const nonZeroBalances = {};
    for (const [currency, data] of Object.entries(balance)) {
      if (
        typeof data === "object" &&
        data.total !== undefined &&
        data.total > 0
      ) {
        nonZeroBalances[currency] = {
          free: data.free,
          used: data.used,
          total: data.total,
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
              timestamp: Date.now(),
              balances: nonZeroBalances,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for list_accounts
   */
  list_accounts: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    let accounts = [];

    // Try to fetch accounts if the exchange supports it
    if (exchange.has["fetchAccounts"]) {
      accounts = await exchange.fetchAccounts();
    } else if (exchange.has["fetchBalance"]) {
      // Fallback: get balance and try to extract account information
      const balance = await exchange.fetchBalance();

      // For some exchanges, balance.info might contain account details
      if (balance.info && Array.isArray(balance.info)) {
        accounts = balance.info;
      } else if (balance.info && typeof balance.info === "object") {
        // Try to extract account/wallet structure from info
        accounts = [balance.info];
      } else {
        // Create a single "default" account entry
        accounts = [
          {
            id: "default",
            type: "spot",
            currency: null,
            info: balance,
          },
        ];
      }
    } else {
      throw new Error(
        `Exchange ${exchangeName} does not support account listing`
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              timestamp: Date.now(),
              accounts: accounts,
              count: accounts.length,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for place_market_order
   */
  place_market_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    let order;

    // Special handling for Coinbase market buy orders
    if (exchangeName === 'coinbase' && args.side === 'buy') {
      // Coinbase requires "quoteOrderQty" parameter for market buy orders (spend X USDC to buy BTC)
      // The amount represents how much quote currency (e.g. USDC) to spend
      order = await exchange.createMarketBuyOrderWithCost(
        args.symbol,
        args.amount
      );
    } else {
      // Standard market order for other exchanges or sell orders
      order = await exchange.createMarketOrder(
        args.symbol,
        args.side,
        args.amount
      );
    }

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
   * Handler for place_limit_order
   */
  place_limit_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    const order = await exchange.createLimitOrder(
      args.symbol,
      args.side,
      args.amount,
      args.price
    );

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
   * Handler for cancel_order
   */
  cancel_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    const result = await exchange.cancelOrder(args.orderId, args.symbol);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              result: result,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for cancel_all_orders
   */
  cancel_all_orders: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.cancelAllOrders) {
      // Fallback: fetch open orders and cancel individually
      const openOrders = await exchange.fetchOpenOrders(args.symbol);
      const results = [];

      for (const order of openOrders) {
        try {
          const result = await exchange.cancelOrder(order.id, order.symbol);
          results.push(result);
        } catch (error) {
          results.push({ error: error.message, orderId: order.id });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                exchange: exchangeName,
                symbol: args.symbol || "all",
                canceled: results.length,
                results: results,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const result = await exchange.cancelAllOrders(args.symbol);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol || "all",
              result: result,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for set_leverage
   */
  set_leverage: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.setLeverage) {
      throw new Error(`${exchangeName} does not support setLeverage`);
    }

    const result = await exchange.setLeverage(args.leverage, args.symbol);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              leverage: args.leverage,
              result: result,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for set_margin_mode
   */
  set_margin_mode: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.setMarginMode) {
      throw new Error(`${exchangeName} does not support setMarginMode`);
    }

    const result = await exchange.setMarginMode(args.marginMode, args.symbol);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              symbol: args.symbol,
              marginMode: args.marginMode,
              result: result,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for place_futures_market_order
   */
  place_futures_market_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    const params = {};
    if (args.reduceOnly !== undefined) {
      params.reduceOnly = args.reduceOnly;
    }

    const order = await exchange.createMarketOrder(
      args.symbol,
      args.side,
      args.amount,
      params
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              type: "futures",
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
   * Handler for place_futures_limit_order
   */
  place_futures_limit_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    const params = {};
    if (args.reduceOnly !== undefined) {
      params.reduceOnly = args.reduceOnly;
    }
    if (args.postOnly !== undefined) {
      params.postOnly = args.postOnly;
    }

    const order = await exchange.createLimitOrder(
      args.symbol,
      args.side,
      args.amount,
      args.price,
      params
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              type: "futures",
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
   * Handler for transfer_funds
   */
  transfer_funds: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.transfer) {
      throw new Error(`${exchangeName} does not support fund transfers`);
    }

    const result = await exchange.transfer(
      args.currency,
      args.amount,
      args.fromAccount,
      args.toAccount
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              transfer: {
                currency: args.currency,
                amount: args.amount,
                from: args.fromAccount,
                to: args.toAccount,
              },
              result: result,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_portfolios
   */
  get_portfolios: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    if (exchangeName !== 'coinbase') {
      throw new Error('Portfolios are a Coinbase-specific feature. This tool only works with Coinbase exchange.');
    }

    const exchange = getExchange(exchangeName, credentials);

    if (!exchange.has.fetchPortfolios) {
      throw new Error(`${exchangeName} does not support fetchPortfolios`);
    }

    const portfolios = await exchange.fetchPortfolios();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              count: portfolios ? portfolios.length : 0,
              portfolios: portfolios,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for get_portfolio_details
   */
  get_portfolio_details: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    if (exchangeName !== 'coinbase') {
      throw new Error('Portfolio details are a Coinbase-specific feature. This tool only works with Coinbase exchange.');
    }

    const exchange = getExchange(exchangeName, credentials);

    // Coinbase uses a custom method for portfolio breakdown
    // This may require direct API calls or custom implementation
    if (!exchange.has.fetchPortfolio && !exchange.has.fetchPortfolios) {
      throw new Error(`${exchangeName} does not support portfolio details`);
    }

    // Try to fetch specific portfolio details
    // Note: This might need adjustment based on actual Coinbase API structure
    let portfolio;

    if (exchange.has.fetchPortfolio) {
      portfolio = await exchange.fetchPortfolio(args.portfolioId);
    } else {
      // Fallback: fetch all portfolios and filter
      const portfolios = await exchange.fetchPortfolios();
      portfolio = portfolios.find(p => p.id === args.portfolioId);

      if (!portfolio) {
        throw new Error(`Portfolio ${args.portfolioId} not found`);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              portfolioId: args.portfolioId,
              portfolio: portfolio,
            },
            null,
            2
          ),
        },
      ],
    };
  },

  /**
   * Handler for edit_order
   */
  edit_order: async (args) => {
    const exchangeName = args.exchange || DEFAULT_EXCHANGE;
    const credentials = getExchangeCredentials(exchangeName);

    if (!credentials) {
      throw new Error(
        `No credentials configured for ${exchangeName}. Please set ${exchangeName.toUpperCase()}_API_KEY and ${exchangeName.toUpperCase()}_SECRET in .env file.`
      );
    }

    const exchange = getExchange(exchangeName, credentials);
    await exchange.loadMarkets();

    if (!exchange.has.editOrder) {
      throw new Error(
        `${exchangeName} does not support editOrder. Consider using cancel_order + place_limit_order instead.`
      );
    }

    // Build params object with only provided values
    const params = {};
    if (args.amount !== undefined) {
      params.amount = args.amount;
    }
    if (args.price !== undefined) {
      params.price = args.price;
    }

    const order = await exchange.editOrder(
      args.orderId,
      args.symbol,
      undefined, // type (keep existing)
      args.side,
      args.amount,
      args.price,
      params
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              exchange: exchangeName,
              orderId: args.orderId,
              editedOrder: order,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
