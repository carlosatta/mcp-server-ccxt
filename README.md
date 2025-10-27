# MCP Server CCXT

> ⚠️ **Work in Progress**: This project is currently under active development. Features and APIs may change without notice. Use in production environments at your own risk.

MCP (Model Context Protocol) server that exposes CCXT cryptocurrency exchange APIs via Server-Sent Events (SSE). This server provides 24 comprehensive tools for interacting with multiple cryptocurrency exchanges.

## 🔒 Security First

**IMPORTANT**: This server includes **multiple layers of security** to prevent accidental or malicious trading operations:

- 🛡️ **SAFE_MODE**: Disable all trading operations, only read-only access
- ⏱️ **Rate Limiting**: Prevent burst of orders (max 10 orders/minute per session)
- 📝 **Enhanced Logging**: Full audit trail of all trading operations
- 🔍 **Tool Classification**: Clear separation between safe vs dangerous tools
- 🚨 **Security Checks**: Multiple validation layers before executing trades

**See [SECURITY.md](SECURITY.md) for complete security documentation.**

### Quick Start - Safe Mode

For maximum security (recommended for production):

```env
# .env
SAFE_MODE=true  # Disables ALL trading operations
```

With SAFE_MODE enabled:
- ✅ Can read: balances, markets, prices, orders, history
- ❌ Cannot: place orders, cancel orders, transfer funds

## Features

- 🌐 **Web-based MCP server** using SSE transport
- 💱 **Multiple exchange support**: Binance, Coinbase, Kraken, Bitfinex, Bybit
- 🔧 **24 comprehensive tools** (13 public + 11 private)
- 🔐 **Environment-based credentials** management
- 🛡️ **Advanced security features** (SAFE_MODE, rate limiting, audit logs)
- 📊 **Public APIs**: Market data, tickers, orderbooks, OHLCV, trades, funding rates
- 💰 **Private APIs**: Account balance, order management, futures trading, fund transfers
- 🔄 **Session-based transport** with UUID tracking
- 📝 **Detailed logging** for debugging

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# ==========================================
# Security Configuration
# ==========================================
# SAFE_MODE: Disable ALL trading operations
# Recommended: true for production
SAFE_MODE=false

# ==========================================
# Server Configuration
# ==========================================
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
DEFAULT_EXCHANGE=coinbase

# ==========================================
# Exchange API Credentials
# ==========================================
# Only needed for private tools (balance, orders, etc)
# Leave empty to use public tools only

BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET=your_binance_secret

COINBASE_API_KEY=your_coinbase_api_key
COINBASE_SECRET=your_coinbase_secret

KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_SECRET=your_kraken_secret

# Add credentials for other exchanges as needed
```

**Security Recommendations**:
1. **Always enable SAFE_MODE** unless trading is explicitly required
2. Use **separate API keys** for read-only vs trading operations
3. Enable **IP restrictions** on exchange API keys
4. **Never commit** `.env` file to version control
5. See [SECURITY.md](SECURITY.md) for complete security guide

## Running the Server

```bash
npm start
```

The server will start on `http://0.0.0.0:3000` (or your configured HOST/PORT).

### Available Endpoints

- **SSE Stream**: `GET http://localhost:3000/sse` - Establishes SSE connection
- **Messages**: `POST http://localhost:3000/message?sessionId=<uuid>` - Handles MCP messages
- **Health Check**: `GET http://localhost:3000/health` - Server health status
- **Info**: `GET http://localhost:3000/` - Server information
- **Stats**: `GET http://localhost:3000/stats` - Server statistics

## Available Tools

### Public Tools (13 tools - No authentication required)

1. **list_exchanges** - List all available exchanges
2. **get_ticker** - Get current ticker for a trading pair
3. **batch_get_tickers** - Get multiple tickers at once
4. **get_orderbook** - Get market order book
5. **get_ohlcv** - Get candlestick data
6. **get_trades** - Get recent trades
7. **get_markets** - List all available markets
8. **get_exchange_info** - Get exchange information
9. **get_leverage_tiers** - Get futures leverage tiers
10. **get_funding_rates** - Get perpetual futures funding rates
11. **get_positions** - Get open positions (public data)
12. **get_open_orders** - Get open orders (public data)
13. **get_order_history** - Get order history (public data)

### Private Tools (10 tools - Require API credentials)

14. **account_balance** - Get account balance
15. **place_market_order** - Place market order ⚠️
16. **place_limit_order** - Place limit order ⚠️
17. **cancel_order** - Cancel specific order
18. **cancel_all_orders** - Cancel all orders
19. **set_leverage** - Set futures leverage
20. **set_margin_mode** - Set margin mode (isolated/cross)
21. **place_futures_market_order** - Place futures market order ⚠️
22. **place_futures_limit_order** - Place futures limit order ⚠️
23. **transfer_funds** - Transfer funds between accounts

⚠️ **Warning**: Trading tools execute real operations with real money!

## Testing

### Basic Test
```bash
npm test
```

### Extended Test
```bash
node test-extended.js
```

## Tool Examples

### Get Ticker
```json
{
  "name": "get_ticker",
  "arguments": {
    "symbol": "BTC/USDT",
    "exchange": "binance"
  }
}
```

### Batch Get Tickers
```json
{
  "name": "batch_get_tickers",
  "arguments": {
    "symbols": ["BTC/USDT", "ETH/USDT", "BNB/USDT"]
  }
}
```

### List Exchanges
```json
{
  "name": "list_exchanges",
  "arguments": {
    "certified": false
  }
}
```

### Get Account Balance (requires credentials)
```json
{
  "name": "account_balance",
  "arguments": {
    "exchange": "binance"
  }
}
```

### Place Limit Order (requires credentials) ⚠️
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

## Architecture

```
mcp-server-ccxt/
├── index.js                    # Main server
├── src/
│   ├── mcpServer.js           # MCP server
│   ├── config/
│   │   └── config.js          # Configuration
│   ├── tools/
│   │   ├── publicTools.js     # 13 public tools
│   │   └── privateTools.js    # 10 private tools
│   └── utils/
│       └── exchangeManager.js # Exchange manager
├── test-mcp-client.js         # Basic tests
├── test-extended.js           # Extended tests
└── .env                       # Environment variables
```

## MCP Integration

### Using with n8n

1. Install MCP connector in n8n
2. Configure server URL: `http://your-server:3000`
3. Use tools in workflows

### Custom Integration

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const client = new Client({
  name: "my-client",
  version: "1.0.0",
}, { capabilities: {} });

const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);

await client.connect(transport);

const result = await client.callTool({
  name: "get_ticker",
  arguments: { symbol: "BTC/USDT" },
});

console.log(result.content[0].text);
```

## Security

⚠️ **Important Security Notes:**

1. **Never commit `.env` file** to version control
2. **Trading tools execute real trades** with real money
3. **Use HTTPS** in production
4. **Restrict access** with firewall rules
5. **Be aware of rate limits** on exchanges

## Supported Exchanges

- Coinbase (default)
- Binance
- Kraken
- Bitfinex
- Bybit

CCXT supports 100+ exchanges. Add credentials in `.env` to enable more.

## Troubleshooting

### Server won't start
- Check port 3000 is not in use
- Verify `.env` file exists
- Check logs for errors

### Tools not showing
- Restart server after code changes
- Check tool definitions
- Review server logs

### Authentication errors
- Verify API keys in `.env`
- Check exchange name (lowercase)
- Ensure proper API permissions

## License

MIT

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request
