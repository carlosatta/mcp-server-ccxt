# REST API Examples

Il server MCP CCXT espone tutti i tool anche via REST API per facilitare l'integrazione con applicazioni standard.

## Endpoints Disponibili

### 📖 Documentazione
```bash
GET http://localhost:3000/
```

Restituisce la documentazione completa del server con tutti gli endpoints disponibili.

### 📊 Status del Server
```bash
GET http://localhost:3000/api/status
```

Restituisce lo stato del server, uptime, memoria, sessioni attive e tool disponibili.

### 📋 Lista Tool
```bash
GET http://localhost:3000/api/tools
```

Restituisce la lista completa di tutti i tool disponibili (pubblici e privati).

### 🔧 Esecuzione Tool
```bash
POST http://localhost:3000/api/tools/:toolName
Content-Type: application/json

{
  "arg1": "value1",
  "arg2": "value2"
}
```

## Esempi Pratici

### 1. Get Ticker (Prezzo in tempo reale)
```bash
curl -X POST http://localhost:3000/api/tools/get_ticker \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDT",
    "exchange": "binance"
  }'
```

**Risposta:**
```json
{
  "success": true,
  "tool": "get_ticker",
  "executionTime": "234ms",
  "timestamp": "2025-10-28T10:30:00.000Z",
  "data": {
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "ticker": {
      "symbol": "BTC/USDT",
      "last": 67890.5,
      "bid": 67890.0,
      "ask": 67891.0,
      "volume": 12345.67
    }
  }
}
```

### 2. Get OHLCV (Candele storiche)
```bash
curl -X POST http://localhost:3000/api/tools/get_ohlcv \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETH/USDT",
    "timeframe": "1h",
    "limit": 24,
    "exchange": "binance"
  }'
```

### 3. Batch Get Tickers (Multipli simboli)
```bash
curl -X POST http://localhost:3000/api/tools/batch_get_tickers \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    "exchange": "binance"
  }'
```

### 4. Get Markets (Lista mercati)
```bash
curl -X POST http://localhost:3000/api/tools/get_markets \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "coinbase",
    "type": "spot",
    "active": true,
    "limit": 50
  }'
```

### 5. Load Markets (Solo mercati Spot - cached)
```bash
curl -X POST http://localhost:3000/api/tools/load_markets \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "binance",
    "reload": false
  }'
```

### 6. Get Order Book (Profondità di mercato)
```bash
curl -X POST http://localhost:3000/api/tools/get_orderbook \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDT",
    "limit": 20,
    "exchange": "binance"
  }'
```

## Tool Privati (Richiedono Autenticazione)

Per utilizzare tool privati, è necessario configurare le credenziali API nel file `.env`:

```env
COINBASE_API_KEY=your_api_key
COINBASE_SECRET=your_secret
BINANCE_API_KEY=your_api_key
BINANCE_SECRET=your_secret
```

### 7. Account Balance
```bash
curl -X POST http://localhost:3000/api/tools/account_balance \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "coinbase"
  }'
```

### 8. Place Market Order
```bash
curl -X POST http://localhost:3000/api/tools/place_market_order \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDC",
    "side": "buy",
    "amount": 10,
    "exchange": "coinbase"
  }'
```

### 9. Get Open Orders
```bash
curl -X POST http://localhost:3000/api/tools/get_open_orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDT",
    "exchange": "binance"
  }'
```

### 10. Cancel Order
```bash
curl -X POST http://localhost:3000/api/tools/cancel_order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "12345",
    "symbol": "BTC/USDT",
    "exchange": "binance"
  }'
```

## Gestione Errori

In caso di errore, la risposta includerà:

```json
{
  "success": false,
  "tool": "get_ticker",
  "error": "Exchange binance does not have market symbol BTC/INVALID",
  "type": "ExchangeError",
  "timestamp": "2025-10-28T10:30:00.000Z"
}
```

## JavaScript/TypeScript Example

```javascript
async function getTicker(symbol, exchange = 'binance') {
  const response = await fetch('http://localhost:3000/api/tools/get_ticker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ symbol, exchange })
  });

  const result = await response.json();

  if (result.success) {
    console.log(`${symbol} price:`, result.data.ticker.last);
    return result.data;
  } else {
    console.error('Error:', result.error);
    throw new Error(result.error);
  }
}

// Usage
getTicker('BTC/USDT')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Python Example

```python
import requests

def get_ticker(symbol, exchange='binance'):
    url = 'http://localhost:3000/api/tools/get_ticker'
    payload = {
        'symbol': symbol,
        'exchange': exchange
    }

    response = requests.post(url, json=payload)
    result = response.json()

    if result['success']:
        print(f"{symbol} price: {result['data']['ticker']['last']}")
        return result['data']
    else:
        raise Exception(result['error'])

# Usage
data = get_ticker('BTC/USDT')
print(data)
```

## Note

- Tutti i tool sono disponibili sia tramite protocollo MCP (`/mcp`) che REST API (`/api/tools/:toolName`)
- Il parametro `exchange` è opzionale e usa `coinbase` come default se non specificato
- I tool pubblici non richiedono autenticazione
- I tool privati richiedono credenziali API configurate nel file `.env`
- Limiti di rate delle API dipendono dall'exchange utilizzato
