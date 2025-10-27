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
    description: "Get account balance for all assets (aggregated)",
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
    name: "list_accounts",
    description: "List all accounts/wallets (Coinbase specific - shows individual wallets)",
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
    name: "place_market_order",
    description: "Place a market order (immediate execution at current market price). For Coinbase buy orders, amount represents the cost to spend in quote currency (e.g., amount=10 means spend 10 USDC to buy BTC).",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        side: {
          type: "string",
          description: "Order side",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "For Coinbase buy orders: cost to spend in quote currency. For sell orders and other exchanges: quantity of base currency to trade.",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount"],
    },
  },
  {
    name: "place_limit_order",
    description: "Place a limit order at a specific price",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        side: {
          type: "string",
          description: "Order side",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "Amount to trade",
        },
        price: {
          type: "number",
          description: "Limit price",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount", "price"],
    },
  },
  {
    name: "cancel_order",
    description: "Cancel a specific order by ID",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "Order ID to cancel",
        },
        symbol: {
          type: "string",
          description: "Trading symbol (required by some exchanges)",
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
    name: "cancel_all_orders",
    description: "Cancel all open orders for a symbol or all symbols",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (optional, cancel all if not specified)",
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
    name: "set_leverage",
    description: "Set leverage for futures trading",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        leverage: {
          type: "number",
          description: "Leverage multiplier (e.g. 1, 2, 5, 10, 20, 50, 100, 125)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "leverage"],
    },
  },
  {
    name: "set_margin_mode",
    description: "Set margin mode for futures trading (isolated or cross)",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        marginMode: {
          type: "string",
          description: "Margin mode",
          enum: ["isolated", "cross"],
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "marginMode"],
    },
  },
  {
    name: "place_futures_market_order",
    description: "Place a futures market order",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        side: {
          type: "string",
          description: "Order side",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "Amount to trade",
        },
        reduceOnly: {
          type: "boolean",
          description: "Reduce only flag (closes position only)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount"],
    },
  },
  {
    name: "place_futures_limit_order",
    description: "Place a futures limit order",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Trading symbol (e.g. BTC/USDT)",
        },
        side: {
          type: "string",
          description: "Order side",
          enum: ["buy", "sell"],
        },
        amount: {
          type: "number",
          description: "Amount to trade",
        },
        price: {
          type: "number",
          description: "Limit price",
        },
        reduceOnly: {
          type: "boolean",
          description: "Reduce only flag (closes position only)",
        },
        postOnly: {
          type: "boolean",
          description: "Post only flag (maker only)",
        },
        exchange: {
          type: "string",
          description: `Exchange to use (optional, defaults to ${DEFAULT_EXCHANGE})`,
          enum: SUPPORTED_EXCHANGES,
        },
      },
      required: ["symbol", "side", "amount", "price"],
    },
  },
  {
    name: "transfer_funds",
    description: "Transfer funds between accounts (e.g. spot to futures)",
    inputSchema: {
      type: "object",
      properties: {
        currency: {
          type: "string",
          description: "Currency to transfer (e.g. USDT, BTC)",
        },
        amount: {
          type: "number",
          description: "Amount to transfer",
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
};
