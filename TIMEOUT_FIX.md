# Risoluzione Timeout MCP -32001

## Problema
Il server MCP-CCXT restituiva errori `-32001: Request timed out` per operazioni come `list_accounts` e le chiamate che usano `fetchOpenOrders`. Il problema derivava dal timeout globale di 30 secondi configurato nel server, che causava:
- Timeout HTTP 504 quando le chiamate CCXT impiegavano troppo tempo
- Blocco della sessione di trasporto per tutte le richieste successive
- Errori a cascata su tutte le operazioni

## Soluzione Implementata

### 1. Utility withTimeout (`src/utils/withTimeout.js`)
Creata una funzione utility che incapsula le chiamate async con un timeout personalizzato:
- **Timeout predefinito**: 15 secondi (inferiore al timeout globale di 30s)
- **Funzionalità**: Interrompe la promise se supera il tempo limite
- **Gestione errori**: Restituisce un messaggio chiaro indicando quale operazione è andata in timeout

```javascript
export async function withTimeout(promise, timeoutMs, operationName = 'Operation')
export const DEFAULT_CCXT_TIMEOUT = 15000; // 15 secondi
```

### 2. Modifiche a privateTools.js
Aggiunte protezioni timeout alle seguenti operazioni:
- ✅ `fetchBalance` in `account_balance`
- ✅ `fetchAccounts` in `list_accounts`
- ✅ `fetchBalance` (fallback) in `list_accounts`
- ✅ `fetchOpenOrders` in `cancel_all_orders`

### 3. Modifiche a publicTools.js
Aggiunte protezioni timeout alle seguenti operazioni:
- ✅ `fetchOpenOrders` in `get_open_orders`
- ✅ `fetchMyTrades` in `get_my_trades`
- ✅ `fetchOrder` in `get_order`
- ✅ `fetchOrders` in `get_all_orders`
- ✅ `fetchClosedOrders` in `get_order_history`
- ✅ `fetchOrders` (fallback) in `get_order_history`

## Vantaggi della Soluzione

1. **Errori descrittivi**: Invece di un generico `-32001`, l'utente riceve un messaggio chiaro come "fetchOpenOrders timed out after 15s"

2. **Sessione non bloccata**: Le richieste successive sulla stessa sessione non vanno più in timeout a cascata

3. **Timeout anticipato**: Con 15s invece di 30s, il server risponde più velocemente liberando le risorse

4. **Configurazione esistente preservata**: 
   - `requestTimeout` in `config.js` può rimanere a 30s (o essere disabilitato con `null`)
   - `toolTimeout` di 20s può essere usato per regolare il comportamento globale
   - Il timeout di 15s per CCXT opera a un livello inferiore

## Test Consigliati

1. **Test list_accounts**:
   ```bash
   # Verificare che la risposta arrivi entro 15s o restituisca un errore chiaro
   ```

2. **Test get_open_orders con exchange lento**:
   ```bash
   # Verificare che il timeout funzioni correttamente
   ```

3. **Test sessione dopo timeout**:
   ```bash
   # Verificare che le richieste successive non vadano in timeout a cascata
   ```

## Configurazione Opzionale

### Aumentare il timeout globale (non raccomandato)
Se si preferisce aumentare il timeout globale invece di gestirlo a livello di chiamata:

```javascript
// src/config/config.js
requestTimeout: parseInt(process.env.REQUEST_TIMEOUT_MS) || 60000, // 60 secondi
```

**⚠️ Attenzione**: Questo approccio prolunga il blocco di sessione in caso di chiamate che non terminano.

### Disabilitare il timeout globale
```javascript
// src/config/config.js
requestTimeout: null, // disabilitato
```

**⚠️ Attenzione**: Senza timeout globale, le sessioni possono rimanere bloccate indefinitamente.

## Prossimi Passi

1. ✅ Riavviare il server con le nuove modifiche
2. ✅ Testare `list_accounts` e `get_open_orders` con exchange reali
3. ⏳ Monitorare i log per eventuali timeout e regolare `DEFAULT_CCXT_TIMEOUT` se necessario
4. ⏳ Considerare l'aggiunta di timeout ad altre operazioni CCXT potenzialmente lente

## File Modificati

- ✅ `src/utils/withTimeout.js` (nuovo)
- ✅ `src/tools/privateTools.js` (modificato)
- ✅ `src/tools/publicTools.js` (modificato)

## Note Aggiuntive

- Il timeout di 15 secondi è un buon compromesso tra dare tempo all'exchange di rispondere e non bloccare la sessione troppo a lungo
- Se necessario, il timeout può essere regolato modificando `DEFAULT_CCXT_TIMEOUT` in `withTimeout.js`
- Le operazioni che non usano `withTimeout` continueranno a dipendere dal timeout globale del server
