# Integration Guide

Technical reference for integrating Dynamic wallet signing with Altude's gasless relay on Solana.

## Architecture

```
Dynamic Wallet → Signed Transaction → Altude API → Solana Blockchain
```

- **Dynamic SDK** handles wallet connection, authentication, and transaction signing
- **Altude API** accepts signed transactions via `/api/Account/create` and `/api/Transaction/send`, covering gas fees
- **Your app** creates the transaction and orchestrates the flow

## Setup

### Dynamic SDK

Wrap your app with `DynamicContextProvider` and register the Solana wallet connectors:

```tsx
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core'
import { SolanaWalletConnectors } from '@dynamic-labs/solana'

<DynamicContextProvider
  settings={{
    environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
    walletConnectors: [SolanaWalletConnectors],
  }}
>
  <YourApp />
</DynamicContextProvider>
```

### Wallet Access

Use `useDynamicContext` to access the connected wallet:

```tsx
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isSolanaWallet } from '@dynamic-labs/solana'

const { primaryWallet } = useDynamicContext()

const isConnected = !!primaryWallet
const walletAddress = primaryWallet?.address
```

## Signing Transactions

Use Dynamic's `isSolanaWallet` type guard and `getSigner()` API:

```tsx
import { isSolanaWallet } from '@dynamic-labs/solana'

if (!primaryWallet || !isSolanaWallet(primaryWallet)) return

const signer = await primaryWallet.getSigner()
const signedTx = await signer.signTransaction(transaction)
const serialized = signedTx.serialize()
const base64Transaction = Buffer.from(serialized).toString('base64')
```

> **Important:** Always use `isSolanaWallet()` to verify the wallet type before calling `getSigner()`. This is the official Dynamic SDK pattern — do not cast `primaryWallet.connector` directly.

## Altude API

Base URL: `https://api.altude.so`

All requests require the `X-API-Key` header for authentication.

### Create Account

Registers a gas station account for the wallet.

```
POST /api/Account/create
```

**Headers:**

```
Content-Type: application/json
X-API-Key: {your-api-key}
```

**Request body:**

```json
{
  "SignedTransaction": "base64-encoded-signed-transaction"
}
```

### Send Transaction

Relays a signed transaction through Altude to the Solana blockchain (gasless).

```
POST /api/Transaction/send
```

**Headers:**

```
Content-Type: application/json
X-API-Key: {your-api-key}
```

**Request body:**

```json
{
  "SignedTransaction": "base64-encoded-signed-transaction"
}
```

> **Note:** Property names use PascalCase (`SignedTransaction`, not `signedTransaction`).

### Example

```typescript
const apiKey = import.meta.env.VITE_ALTUDE_API_KEY

// Create account
const createRes = await fetch('https://api.altude.so/api/Account/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  },
  body: JSON.stringify({ SignedTransaction: base64Transaction }),
})

// Send transaction
const sendRes = await fetch('https://api.altude.so/api/Transaction/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  },
  body: JSON.stringify({ SignedTransaction: base64Transaction }),
})
```

### Mock Fallback

When no API key is set for a network, the demo automatically falls back to a mock relay that simulates the API response. This lets you test the full wallet → sign → relay flow without an Altude account.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_DYNAMIC_ENVIRONMENT_ID` | Yes | Your Dynamic project environment ID |
| `VITE_ALTUDE_API_KEY_DEVNET` | No | Altude API key for Devnet (falls back to mock if omitted) |
| `VITE_ALTUDE_API_KEY_MAINNET` | No | Altude API key for Mainnet (falls back to mock if omitted) |
| `VITE_TOKEN_MINT` | No | SPL token mint address — enables ATA creation and Send Transaction |

## Further Reading

- [Dynamic Documentation](https://docs.dynamic.xyz)
- [Altude Documentation](https://docs.altude.so)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

