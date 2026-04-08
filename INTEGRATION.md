# Gasless Transaction Demo - Altude Integration

A minimal demonstration of how third-party wallet providers (like Dynamic) work alongside Altude's gasless relay service for Solana transactions.

## Overview

This demo showcases the complete flow of a gasless Solana transaction:

```
Wallet Provider → Signed Transaction → Altude Relay → Blockchain
```

### Key Concepts

- **Altude does NOT replace your wallet** - it complements it
- **Wallet providers handle signing** - user authentication and transaction signing
- **Altude handles relay and gas** - submits transactions and covers fees
- This enables gasless user experiences while preserving user control

## Architecture

### 1. Transaction Creation
- Application creates an unsigned Solana transaction
- Can be any transaction type (transfer, program interaction, etc.)
- This demo uses a simple memo transaction for clarity

### 2. Transaction Signing (Wallet Provider Role)
**Production:** A third-party wallet provider like Dynamic handles this step
- User authenticates through the wallet provider
- User approves the transaction
- Wallet provider signs the transaction
- Returns base64-encoded signed transaction

**Demo:** We simulate signing with a generated keypair for demonstration purposes

### 3. Gasless Relay (Altude Role)
- Application sends signed transaction to Altude relay
- Altude submits transaction to Solana blockchain
- Altude covers gas fees
- Returns transaction signature

## Code Structure

```
src/
├── App.tsx              # Main demo interface with 3-button flow
└── lib/
    └── solana.ts        # Transaction utilities and relay functions
```

### Key Functions

#### `createMemoTransaction()`
Creates a simple memo transaction on Solana devnet.

```typescript
const { transaction, feePayer } = await createMemoTransaction()
```

#### `signTransaction(transaction)`
**Note:** In production, replace this with your wallet provider's signing method (e.g., Dynamic).

```typescript
// Demo (simulated):
const { base64Transaction } = await signTransaction(transaction)

// Production with Dynamic (example):
const signedTx = await dynamicWallet.signTransaction(transaction)
const base64Transaction = signedTx.serialize().toString('base64')
```

#### `relayViaAltude(base64Tx)`
Sends signed transaction to Altude relay service.

**Current:** Mock implementation
**Production:** Replace with actual Altude API endpoint

```typescript
// Mock (current):
const response = await relayViaAltude(base64Tx)

// Production (replace with):
const response = await fetch('https://api.altude.io/relay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ signedTransaction: base64Tx })
})
```

## Integration Guide

### Integrating with Dynamic (or other wallet providers)

Replace the `signTransaction` call in `src/App.tsx`:

```typescript
// Current demo code:
const handleSignTransaction = async () => {
  if (!transaction) return
  const result = await signTransaction(transaction.transaction)
  setSignedTxBase64(result.base64Transaction)
}

// Replace with Dynamic:
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

const { primaryWallet } = useDynamicContext()

const handleSignTransaction = async () => {
  if (!transaction || !primaryWallet) return
  
  const signer = await primaryWallet.connector.getSigner()
  const signedTx = await signer.signTransaction(transaction.transaction)
  const base64 = signedTx.serialize().toString('base64')
  
  setSignedTxBase64(base64)
}
```

### Integrating with Altude API

Replace the mock in `src/lib/solana.ts`:

```typescript
export async function relayViaAltude(base64Tx: string): Promise<RelayResponse> {
  const response = await fetch('https://api.altude.io/v1/relay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ALTUDE_API_KEY}`
    },
    body: JSON.stringify({
      signedTransaction: base64Tx,
      network: 'devnet' // or 'mainnet-beta'
    })
  })
  
  const data = await response.json()
  
  return {
    success: data.success,
    signature: data.signature,
    explorerUrl: `https://solscan.io/tx/${data.signature}?cluster=devnet`,
    message: data.message || 'Transaction relayed successfully'
  }
}
```

## Running the Demo

The demo runs automatically when you open the application. Follow the three-step flow:

1. **Create Transaction** - Generates a Solana memo transaction
2. **Sign Transaction** - Simulates wallet signing (replace with real wallet in production)
3. **Send Gasless** - Relays through Altude (mocked, replace with real API)

## Next Steps

- [ ] Integrate with actual wallet provider (Dynamic, Phantom, etc.)
- [ ] Connect to real Altude API endpoint
- [ ] Add real transaction types (transfers, program interactions)
- [ ] Implement error handling and retry logic
- [ ] Add transaction status polling
- [ ] Support multiple networks (devnet, mainnet)

## Learn More

- [Altude Documentation](https://docs.altude.io)
- [Dynamic Wallet Documentation](https://docs.dynamic.xyz)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
