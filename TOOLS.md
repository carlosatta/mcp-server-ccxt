# MCP CCXT Tool Reference

Complete reference for all 23 tools available in the MCP CCXT Web Server.

---

## Public Tools (13)

These tools do not require API credentials and can be used by anyone.

### 1. list_exchanges

**Description**: List all available cryptocurrency exchanges supported by CCXT.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| certified | boolean | No | Filter for CCXT certified exchanges only |

**Example**:
```json
{
  "name": "list_exchanges",
  "arguments": {
    "certified": false
  }
}
```

**Response**:
```json
{
  "count": 105,
  "exchanges": ["binance", "coinbase", "kraken", ...],
  "configured": ["binance", "coinbase", "kraken", "bitfinex", "bybit"]
}
```

---

### 2. get_ticker

**Description**: Get current ticker information for a trading pair.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol (e.g. "BTC/USDT") |
| exchange | string | No | Exchange to use (default from env) |

**Example**:
```json
{
  "name": "get_ticker",
  "arguments": {
    "symbol": "BTC/USDT",
    "exchange": "binance"
  }
}
```

**Response**:
```json
{
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "timestamp": 1707820800000,
  "datetime": "2025-10-22T14:00:00.000Z",
  "last": 108295.31,
  "bid": 108295.31,
  "ask": 108295.32,
  "high": 114000,
  "low": 106708.18,
  "baseVolume": 39502.53,
  "quoteVolume": 4291234567.89
}
```

---

### 3. batch_get_tickers

**Description**: Get ticker information for multiple trading pairs at once.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbols | array | Yes | Array of trading symbols |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "batch_get_tickers",
  "arguments": {
    "symbols": ["BTC/USDT", "ETH/USDT", "BNB/USDT"]
  }
}
```

**Response**:
```json
{
  "exchange": "binance",
  "count": 3,
  "tickers": {
    "BTC/USDT": {
      "last": 108442.61,
      "bid": 108442.60,
      "ask": 108442.62,
      "high": 114000,
      "low": 106708.18,
      "volume": 39502.53,
      "timestamp": 1707820800000
    },
    "ETH/USDT": { ... },
    "BNB/USDT": { ... }
  }
}
```

---

### 4. get_orderbook

**Description**: Get market order book (bids and asks) for a trading pair.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| limit | number | No | Number of orders (default: 20) |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "get_orderbook",
  "arguments": {
    "symbol": "BTC/USDT",
    "limit": 5
  }
}
```

**Response**:
```json
{
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "timestamp": 1707820800000,
  "bids": [
    [108421.93, 0.5],
    [108421.86, 1.2],
    ...
  ],
  "asks": [
    [108421.94, 0.8],
    [108421.95, 2.1],
    ...
  ]
}
```

---

### 5. get_ohlcv

**Description**: Get OHLCV (Open, High, Low, Close, Volume) candlestick data.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| timeframe | string | Yes | Timeframe ("1m", "5m", "1h", "1d", etc.) |
| limit | number | No | Number of candles (default: 100) |
| since | number | No | Timestamp in ms to fetch from |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "get_ohlcv",
  "arguments": {
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "limit": 24
  }
}
```

**Response**:
```json
{
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "timeframe": "1h",
  "count": 24,
  "data": [
    {
      "timestamp": 1707820800000,
      "datetime": "2025-10-22T14:00:00.000Z",
      "open": 108000,
      "high": 108500,
      "low": 107800,
      "close": 108295,
      "volume": 123.45
    },
    ...
  ]
}
```

---

### 6. get_trades

**Description**: Get recent trades for a trading pair.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| limit | number | No | Number of trades (default: 50) |
| since | number | No | Timestamp in ms |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "get_trades",
  "arguments": {
    "symbol": "BTC/USDT",
    "limit": 10
  }
}
```

**Response**:
```json
{
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "count": 10,
  "trades": [
    {
      "id": "12345678",
      "timestamp": 1707820800000,
      "datetime": "2025-10-22T14:00:00.000Z",
      "symbol": "BTC/USDT",
      "side": "buy",
      "price": 108432,
      "amount": 0.00818,
      "cost": 887.01
    },
    ...
  ]
}
```

---

### 7. get_markets

**Description**: Get all available markets for an exchange.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| exchange | string | No | Exchange to use |
| search | string | No | Filter markets by symbol |
| type | string | No | Market type ("spot", "future", "swap", "option") |

**Example**:
```json
{
  "name": "get_markets",
  "arguments": {
    "search": "BTC",
    "type": "spot"
  }
}
```

**Response**:
```json
{
  "exchange": "binance",
  "count": 50,
  "total": 50,
  "markets": [
    {
      "symbol": "ETH/BTC",
      "base": "ETH",
      "quote": "BTC",
      "active": true,
      "type": "spot",
      "spot": true,
      "future": false,
      "swap": false,
      "option": false
    },
    ...
  ]
}
```

---

### 8. get_exchange_info

**Description**: Get exchange information, capabilities, and status.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| exchange | string | No | Exchange to query |

**Example**:
```json
{
  "name": "get_exchange_info",
  "arguments": {}
}
```

**Response**:
```json
{
  "id": "binance",
  "name": "Binance",
  "countries": [],
  "version": "1",
  "certified": true,
  "pro": true,
  "has": {
    "fetchTicker": true,
    "fetchTickers": true,
    "fetchOrderBook": true,
    "fetchOHLCV": true,
    "fetchBalance": true,
    "createOrder": true,
    "cancelOrder": true,
    ...
  },
  "timeframes": ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"],
  "urls": { ... }
}
```

---

### 9. get_leverage_tiers

**Description**: Get futures leverage tiers for a symbol (shows max leverage by position size).

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "get_leverage_tiers",
  "arguments": {
    "symbol": "BTC/USDT"
  }
}
```

**Note**: Not all exchanges support this feature.

---

### 10. get_funding_rates

**Description**: Get current funding rates for perpetual futures contracts.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | No | Trading symbol (omit for all) |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "get_funding_rates",
  "arguments": {
    "symbol": "BTC/USDT"
  }
}
```

**Note**: Requires exchange with perpetual futures support.

---

### 11. get_positions

**Description**: Get open positions information.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | No | Trading symbol |
| exchange | string | No | Exchange to use |

**Note**: Typically requires authentication even though it's in public tools. Use with configured API keys.

---

### 12. get_open_orders

**Description**: Get all open orders.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | No | Trading symbol |
| exchange | string | No | Exchange to use |

**Note**: Typically requires authentication. Use with configured API keys.

---

### 13. get_order_history

**Description**: Get order history (closed orders).

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | No | Trading symbol |
| since | number | No | Timestamp in ms |
| limit | number | No | Number of orders |
| exchange | string | No | Exchange to use |

**Note**: Typically requires authentication. Use with configured API keys.

---

## Private Tools (10)

These tools require API credentials configured in `.env` file.

### 14. account_balance

**Description**: Get account balance for all assets.

**Requires**: API credentials in `.env`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "account_balance",
  "arguments": {}
}
```

**Response**:
```json
{
  "exchange": "binance",
  "timestamp": 1707820800000,
  "balances": {
    "USDT": {
      "free": 10000.50,
      "used": 500.25,
      "total": 10500.75
    },
    "BTC": {
      "free": 0.5,
      "used": 0.1,
      "total": 0.6
    }
  }
}
```

---

### 15. place_market_order

**Description**: Place a market order (immediate execution at current price).

**⚠️ WARNING**: This executes real trades with real money!

**Requires**: API credentials with trading permissions

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| side | string | Yes | "buy" or "sell" |
| amount | number | Yes | Amount to trade |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "place_market_order",
  "arguments": {
    "symbol": "BTC/USDT",
    "side": "buy",
    "amount": 0.001
  }
}
```

---

### 16. place_limit_order

**Description**: Place a limit order at a specific price.

**⚠️ WARNING**: This executes real trades with real money!

**Requires**: API credentials with trading permissions

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| side | string | Yes | "buy" or "sell" |
| amount | number | Yes | Amount to trade |
| price | number | Yes | Limit price |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "place_limit_order",
  "arguments": {
    "symbol": "BTC/USDT",
    "side": "buy",
    "amount": 0.001,
    "price": 50000
  }
}
```

---

### 17. cancel_order

**Description**: Cancel a specific order by ID.

**Requires**: API credentials

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| orderId | string | Yes | Order ID to cancel |
| symbol | string | No | Trading symbol (required by some exchanges) |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "cancel_order",
  "arguments": {
    "orderId": "12345678",
    "symbol": "BTC/USDT"
  }
}
```

---

### 18. cancel_all_orders

**Description**: Cancel all open orders for a symbol or all symbols.

**Requires**: API credentials

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | No | Trading symbol (omit for all) |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "cancel_all_orders",
  "arguments": {
    "symbol": "BTC/USDT"
  }
}
```

---

### 19. set_leverage

**Description**: Set leverage for futures trading.

**Requires**: API credentials with futures permissions

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| leverage | number | Yes | Leverage (e.g. 1, 2, 5, 10, 20, 50, 100, 125) |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "set_leverage",
  "arguments": {
    "symbol": "BTC/USDT",
    "leverage": 10
  }
}
```

---

### 20. set_margin_mode

**Description**: Set margin mode for futures trading.

**Requires**: API credentials with futures permissions

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| marginMode | string | Yes | "isolated" or "cross" |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "set_margin_mode",
  "arguments": {
    "symbol": "BTC/USDT",
    "marginMode": "isolated"
  }
}
```

---

### 21. place_futures_market_order

**Description**: Place a futures market order.

**⚠️ WARNING**: This executes real futures trades!

**Requires**: API credentials with futures trading permissions

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| side | string | Yes | "buy" or "sell" |
| amount | number | Yes | Amount to trade |
| reduceOnly | boolean | No | Close position only |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "place_futures_market_order",
  "arguments": {
    "symbol": "BTC/USDT",
    "side": "buy",
    "amount": 0.1,
    "reduceOnly": false
  }
}
```

---

### 22. place_futures_limit_order

**Description**: Place a futures limit order.

**⚠️ WARNING**: This executes real futures trades!

**Requires**: API credentials with futures trading permissions

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Trading symbol |
| side | string | Yes | "buy" or "sell" |
| amount | number | Yes | Amount to trade |
| price | number | Yes | Limit price |
| reduceOnly | boolean | No | Close position only |
| postOnly | boolean | No | Maker only |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "place_futures_limit_order",
  "arguments": {
    "symbol": "BTC/USDT",
    "side": "buy",
    "amount": 0.1,
    "price": 100000,
    "postOnly": true
  }
}
```

---

### 23. transfer_funds

**Description**: Transfer funds between accounts (e.g. spot to futures).

**Requires**: API credentials

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| currency | string | Yes | Currency to transfer (e.g. "USDT", "BTC") |
| amount | number | Yes | Amount to transfer |
| fromAccount | string | Yes | "spot", "futures", "margin", "swap" |
| toAccount | string | Yes | "spot", "futures", "margin", "swap" |
| exchange | string | No | Exchange to use |

**Example**:
```json
{
  "name": "transfer_funds",
  "arguments": {
    "currency": "USDT",
    "amount": 1000,
    "fromAccount": "spot",
    "toAccount": "futures"
  }
}
```

---

## Error Handling

All tools return errors in the following format:

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "Error message describing what went wrong"
    }
  ]
}
```

Common errors:
- **Missing credentials**: "No credentials configured for {exchange}"
- **Exchange not supported**: "{exchange} does not support {feature}"
- **Authentication required**: "This operation requires authentication"
- **Invalid parameters**: Schema validation errors
- **API errors**: CCXT exception messages

---

## Rate Limits

Be aware of exchange API rate limits:
- **Binance**: 1200 requests/minute
- **Coinbase**: 10 requests/second
- **Kraken**: 15-20 requests/second
- **Bitfinex**: Varies by endpoint
- **Bybit**: 120 requests/minute

Exceeding rate limits will result in temporary bans.

---

## Best Practices

1. **Use batch operations** when possible (e.g. `batch_get_tickers`)
2. **Cache public data** (markets, exchange info)
3. **Implement retry logic** for transient errors
4. **Monitor rate limits** in production
5. **Test with small amounts** before live trading
6. **Use limit orders** for better price control
7. **Set proper leverage** for futures trading
8. **Always check order status** after placement

---

## Support

For issues or questions about specific tools:
1. Check CCXT documentation for exchange-specific details
2. Review MCP SDK documentation for protocol details
3. Open an issue on GitHub with tool name and error message
