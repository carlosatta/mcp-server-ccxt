# Guida alla Gestione della Concorrenza - MCP WebServer CCXT

## Architettura delle Sessioni

### Isolamento delle Sessioni ✅

Il server MCP **supporta sessioni isolate** con elaborazione concorrente:

```javascript
// index.js - Gestione sessioni
const transports = new Map(); // Map<sessionId, StreamableHTTPServerTransport>

app.all('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  const transport = transports.get(sessionId);

  // Ogni sessionId ha il proprio transport
  await transport.handleRequest(req, res, req.body);
});
```

**Comportamento**:
- Ogni `sessionId` ha un `StreamableHTTPServerTransport` dedicato
- Richieste con **sessionId diversi** si elaborano **in parallelo**
- Richieste con lo **stesso sessionId** si elaborano **sequenzialmente**

## Exchange Cache e Thread-Safety

### Cache degli Exchange

```javascript
// exchangeManager.js
const exchangeCache = new Map();

export function getExchange(exchangeName, credentials) {
  // Con credenziali: SEMPRE nuova istanza (nessuna cache)
  if (credentials) {
    return createExchangeInstance(name, credentials);
  }

  // Senza credenziali: usa cache per exchange pubblici
  if (!exchangeCache.has(name)) {
    exchangeCache.set(name, createExchangeInstance(name, null));
  }
  return exchangeCache.get(name);
}
```

**Sicurezza Concorrenza**:
- ✅ Map JavaScript è **thread-safe** in Node.js (single-thread event loop)
- ✅ Con credenziali API: ogni chiamata crea **istanza dedicata**
- ✅ Senza credenziali: cache condivisa ma operazioni READ-ONLY su exchange pubblici
- ✅ CCXT operations protette da `withTimeout(15s)` per prevenire blocchi

## Best Practices per Workflow Paralleli

### ✅ CORRETTO: Sessioni Separate per Workflow Paralleli

```javascript
// Workflow A - Monitoring ordini
const sessionA = 'workflow-orders-monitoring';
fetch('http://192.168.1.140:3000/mcp', {
  method: 'POST',
  headers: {
    'Mcp-Session-Id': sessionA,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: 'get_open_orders' }
  })
});

// Workflow B - Monitoring balance (IN PARALLELO)
const sessionB = 'workflow-balance-monitoring';
fetch('http://192.168.1.140:3000/mcp', {
  method: 'POST',
  headers: {
    'Mcp-Session-Id': sessionB,  // ← SessionId DIVERSO
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: 'account_balance' }
  })
});

// ✅ A e B si eseguono in PARALLELO senza bloccarsi
```

### ❌ SBAGLIATO: Stesso SessionId per Workflow Diversi

```javascript
// Workflow A
const sessionId = 'shared-session'; // ← Problema!
fetch('http://192.168.1.140:3000/mcp', {
  headers: { 'Mcp-Session-Id': sessionId },
  body: JSON.stringify({
    method: 'tools/call',
    params: { name: 'get_open_orders' } // Richiesta lunga (3s)
  })
});

// Workflow B
fetch('http://192.168.1.140:3000/mcp', {
  headers: { 'Mcp-Session-Id': sessionId }, // ← Stesso sessionId!
  body: JSON.stringify({
    method: 'tools/call',
    params: { name: 'account_balance' }
  })
});

// ❌ B deve aspettare che A finisca (elaborazione SEQUENZIALE)
```

## Strategie di Concorrenza

### 1. Session-Per-Workflow (Consigliato)

Ogni workflow usa un sessionId univoco:

```javascript
const workflows = [
  { id: 'orders-btc', sessionId: `wf-${crypto.randomUUID()}` },
  { id: 'orders-eth', sessionId: `wf-${crypto.randomUUID()}` },
  { id: 'balance', sessionId: `wf-${crypto.randomUUID()}` }
];

// Tutti i workflow si eseguono in parallelo
await Promise.all(workflows.map(wf =>
  mcpCall(wf.sessionId, 'get_open_orders', { symbol: wf.id })
));
```

**Pro**:
- ✅ Massima concorrenza
- ✅ Nessun blocco tra workflow
- ✅ Semplice da implementare

**Contro**:
- ⚠️ Più connessioni al server (una per sessione)
- ⚠️ Più overhead di inizializzazione

### 2. Request-Level Parallelism

Singola sessione con batch paralleli:

```javascript
const sessionId = 'main-session';

// Batch 1: Ordini per più simboli
const orderPromises = ['BTC/USD', 'ETH/USD', 'XRP/USD'].map(symbol =>
  mcpCall(sessionId, 'get_open_orders', { symbol })
);

// ❌ Si eseguono SEQUENZIALMENTE (stesso sessionId)
const results = await Promise.all(orderPromises);
```

**Limitazione**: Con `StreamableHTTPServerTransport`, richieste sulla stessa sessione si elaborano sequenzialmente.

### 3. Session Pool

Pool di sessioni riutilizzabili:

```javascript
const sessionPool = [
  'pool-session-1',
  'pool-session-2',
  'pool-session-3'
];

let nextSession = 0;

async function mcpCallRoundRobin(toolName, params) {
  const sessionId = sessionPool[nextSession % sessionPool.length];
  nextSession++;

  return mcpCall(sessionId, toolName, params);
}

// Distribuisce carico su 3 sessioni
await Promise.all([
  mcpCallRoundRobin('get_open_orders', { symbol: 'BTC/USD' }),
  mcpCallRoundRobin('get_open_orders', { symbol: 'ETH/USD' }),
  mcpCallRoundRobin('account_balance', {})
]);
```

**Pro**:
- ✅ Bilanciamento del carico
- ✅ Riutilizzo connessioni
- ✅ Controllo su numero massimo sessioni

## Timeout e Resilienza

### Protezione Multi-Livello

```javascript
// 1. CCXT Exchange Timeout (10s)
const exchange = new ccxt.coinbase({
  timeout: 10000  // ← Primo livello
});

// 2. withTimeout Tool-Level (15s)
const result = await withTimeout(
  exchange.fetchOpenOrders(),
  DEFAULT_CCXT_TIMEOUT,  // 15000ms ← Secondo livello
  'fetchOpenOrders'
);

// 3. NO Global Timeout
// ❌ RIMOSSO per evitare blocco sessione:
// setTimeout(() => { throw new Error(); }, 30000);
```

**Comportamento**:
- Se CCXT timeout (10s): errore CCXT specifico
- Se withTimeout (15s): `Error: fetchOpenOrders operation timed out after 15000ms`
- Sessione **NON bloccata**: pronta per prossima richiesta

## Monitoraggio Sessioni

### API REST per Diagnostica

```bash
# Lista tutte le sessioni attive
curl http://192.168.1.140:3000/health

# Output
{
  "status": "healthy",
  "activeSessions": 3,
  "sessions": [
    {
      "sessionId": "workflow-orders-abc",
      "connectedAt": "2025-01-10T10:30:00Z",
      "lastActivity": "2025-01-10T10:35:22Z",
      "clientIp": "192.168.1.100"
    }
  ]
}
```

## Domande Frequenti

### Q: Perché i miei workflow si bloccano?

**R**: Probabilmente usano lo stesso `sessionId`. Soluzione:

```javascript
// Prima (bloccato)
const sessionId = 'shared';

// Dopo (parallelo)
const sessionId = `wf-${Date.now()}-${Math.random()}`;
```

### Q: Quante sessioni posso avere in parallelo?

**R**: Teoricamente illimitate, ma:
- Ogni sessione consuma memoria (transport + metadata)
- Troppe connessioni HTTP simultanee possono saturare il server
- **Consigliato**: 10-50 sessioni per traffico normale

### Q: Exchange cache causa problemi di concorrenza?

**R**: No, perché:
- Con credenziali API: ogni chiamata crea istanza **dedicata**
- Senza credenziali: cache condivisa ma operazioni **read-only**
- Map JavaScript è thread-safe in Node.js single-thread

### Q: Posso usare Node.js cluster per scalare?

**R**: Sì, ma considera:

```javascript
// Cluster con shared state
import cluster from 'cluster';
import { cpus } from 'os';

if (cluster.isPrimary) {
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }
} else {
  // Ogni worker ha il proprio transports Map
  // ⚠️ Session affinity necessaria: stesso sessionId → stesso worker
  app.listen(3000);
}
```

**Limitazione**: Sessions non condivise tra worker. Serve sticky session routing.

## Raccomandazioni

### Per Sviluppo

```javascript
// Pattern consigliato
class MCPWorkflow {
  constructor(workflowName) {
    this.sessionId = `wf-${workflowName}-${crypto.randomUUID()}`;
  }

  async execute(operations) {
    return Promise.all(operations.map(op =>
      this.mcpCall(op.tool, op.params)
    ));
  }

  async mcpCall(toolName, params) {
    return fetch('http://192.168.1.140:3000/mcp', {
      method: 'POST',
      headers: {
        'Mcp-Session-Id': this.sessionId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: params }
      })
    });
  }
}

// Uso
const ordersWorkflow = new MCPWorkflow('orders');
const balanceWorkflow = new MCPWorkflow('balance');

// Esecuzione parallela
await Promise.all([
  ordersWorkflow.execute([
    { tool: 'get_open_orders', params: { symbol: 'BTC/USD' } }
  ]),
  balanceWorkflow.execute([
    { tool: 'account_balance', params: {} }
  ])
]);
```

### Per Produzione

1. **Session Management**:
   - Genera sessionId univoci per workflow indipendenti
   - Riutilizza sessioni per operazioni sequenziali correlate
   - Implementa session cleanup per sessioni inattive

2. **Error Handling**:
   - Gestisci timeout (15s) a livello tool
   - Implementa retry logic per operazioni idempotenti
   - Log dettagliato per debugging concurrency issues

3. **Monitoring**:
   - Traccia numero sessioni attive
   - Monitora latenza per sessionId
   - Alert su timeout frequenti

## Conclusione

Il server MCP **supporta già la concorrenza** tramite sessioni isolate:

- ✅ Sessioni diverse → elaborazione **parallela**
- ✅ Stessa sessione → elaborazione **sequenziale** (by design)
- ✅ Exchange cache **thread-safe** per Node.js
- ✅ Timeout protection previene blocchi

**Regola d'oro**: Workflow paralleli = SessionId diversi
