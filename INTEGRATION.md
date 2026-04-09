# Gasless Transaction Demo - Altude Integration

A demonstration of how the Dynamic wallet provider integrates with Altude's gasless relay service for Solana transactions.

## Overview

This demo showcases the complete flow of a gasless Solana transaction:

```
Dynamic Wallet → Signed Transaction → Altude Relay → Blockchain
```

### Key Concepts

- **Altude does NOT replace your wallet** - it complements it
- **Dynamic wallet handles signing** - user authentication and transaction signing
- **Altude handles relay and gas** - submits transactions and covers fees
- This enables gasless user experiences while preserving user control

## Setup

### 1. Get Your Dynamic Environment ID

1. Go to [Dynamic Dashboard](https://app.dynamic.xyz)
2. Create an account or sign in
3. Create a new project or use an existing one
4. Copy your Environment ID from the project settings
5. Enable Solana wallets in your Dynamic project settings

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id-here
```

Or copy from the example:

```bash
cp .env.example .env
# Then edit .env with your actual environment ID
```

## Architecture

### 1. Wallet Connection (Dynamic SDK)
- User connects their Solana wallet through Dynamic's interface
- Dynamic supports multiple wallet providers (Phantom, Solflare, etc.)
- Handles authentication and session management
- Returns wallet address for transaction creation

### 2. Transaction Creation
- Application creates an unsigned Solana transaction
- Can be any transaction type (transfer, program interaction, etc.)
- This demo uses a simple memo transaction for clarity

### 3. Transaction Signing (Dynamic Wallet)
**Production:** Dynamic wallet provider handles this step
- User authenticates through Dynamic
- User approves the transaction in their wallet
- Wallet signs the transaction
- Returns base64-encoded signed transaction

### 4. Gasless Relay (Altude)
- Application sends signed transaction to Altude relay
- Altude submits transaction to Solana blockchain
- Altude covers gas fees
- Returns transaction signature

## Code Structure

```
src/
├── App.tsx              # Main demo interface with Dynamic integration
└── lib/
    ├── solana.ts        # Transaction utilities and relay functions
    └── dynamic-wallet.ts # Type definitions for wallet adapter
```

### Key Components

#### `DynamicContextProvider`
Wraps the entire application and provides Dynamic wallet context.

```typescript
<DynamicContextProvider
  settings={{
    environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
    walletConnectors: [SolanaWalletConnectors],
  }}
>
  <YourApp />
</DynamicContextProvider>
```

#### `useDynamicContext` Hook
Access wallet information and signing capabilities.

```typescript
const { primaryWallet } = useDynamicContext()

// Check if connected
const isConnected = !!primaryWallet
const walletAddress = primaryWallet?.address

// Sign transaction
const solanaConnector = primaryWallet.connector as any
const signedTx = await solanaConnector.signTransaction(transaction)
```

#### `DynamicWidget`
Pre-built UI component for wallet connection.

```typescript
<DynamicWidget />
```

### Key Functions

#### `createMemoTransaction(walletAddress)`
Creates a simple memo transaction on Solana devnet.

```typescript
const { transaction, feePayer } = await createMemoTransaction(walletAddress)
```

#### Signing with Dynamic
The app uses Dynamic's connector to sign transactions:

```typescript
const solanaConnector = primaryWallet.connector as any
const signedTx = await solanaConnector.signTransaction(transaction)
const serialized = signedTx.serialize()
const base64Transaction = serialized.toString('base64')
```

#### `relayViaAltude(base64Tx)`
Sends signed transaction to Altude relay service.

**Implementation:** Real Altude API integration with fallback to mock

The function automatically detects if `VITE_ALTUDE_API_KEY` is configured:
- **With API key:** Calls real Altude API at `https://api.altude.io/v1/relay`
- **Without API key:** Falls back to mock response for testing

```typescript
// With API key configured:
const response = await relayViaAltude(base64Tx)
// Calls: POST https://api.altude.io/v1/relay
// Headers: Authorization: Bearer {VITE_ALTUDE_API_KEY}
// Body: { signedTransaction: base64Tx, network: 'devnet' }

// Without API key:
const response = await relayViaAltude(base64Tx)
// Returns mock signature after 1s delay
```

## Integration with Real Altude API

The app now includes **real Altude API integration** with automatic fallback to mock mode.

### Using Real Altude API

1. **Get your Altude API key** from [Altude Dashboard](https://altude.io)

2. **Add to your `.env` file:**
   ```bash
   VITE_ALTUDE_API_KEY=your-altude-api-key-here
   ```

3. **That's it!** The app automatically uses the real API when the key is present.

### How It Works

The `relayViaAltude` function in `src/lib/solana.ts`:

- **Checks for `VITE_ALTUDE_API_KEY`** in environment variables
- **If present:** Calls `https://api.altude.io/v1/relay` with proper authentication
- **If missing:** Falls back to mock response for testing without an API key

### API Request Format

```typescript
POST https://api.altude.io/v1/relay
Headers:
  Content-Type: application/json
  Authorization: Bearer {your-api-key}
Body:
  {
    "signedTransaction": "base64-encoded-transaction",
    "network": "devnet"
  }
```

### API Response Format

```typescript
{
  "success": true,
  "signature": "transaction-signature-hash",
  "message": "Transaction relayed successfully"
}
```

### Error Handling

The integration includes comprehensive error handling:
- Network errors
- API authentication errors
- Invalid transaction format
- Rate limiting

All errors are caught and displayed to the user with helpful messages.

## Running the Demo

1. Install dependencies (if not already installed):
```bash
npm install
```

2. Set up your environment variables:
```bash
cp .env.example .env
# Edit .env and add your Dynamic environment ID
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and follow the three-step flow:
   - **Connect Wallet** - Use the Dynamic widget to connect a Solana wallet
   - **Create Transaction** - Generates a Solana memo transaction
   - **Sign Transaction** - Dynamic wallet prompts you to sign
   - **Send Gasless** - Relays through Altude (mocked)

## Dynamic Wallet Features

The Dynamic SDK provides:

- **Multi-wallet support**: Phantom, Solflare, Sollet, and more
- **Email/social login**: Optional email or social authentication
- **Session management**: Persistent wallet connections
- **Mobile responsive**: Works on desktop and mobile
- **Customizable UI**: Theme and branding options

For more customization options, see the [Dynamic documentation](https://docs.dynamic.xyz).

## Troubleshooting

### "Environment ID not found" error
Make sure you've created a `.env` file with your Dynamic environment ID:
```bash
VITE_DYNAMIC_ENVIRONMENT_ID=your-actual-id-here
```

### Wallet not appearing in Dynamic widget
1. Check that Solana wallets are enabled in your Dynamic project settings
2. Make sure you have a Solana wallet extension installed (e.g., Phantom)
3. Try refreshing the page

### Transaction signing fails
1. Ensure your wallet is properly connected
2. Check that you have enough SOL for the transaction (though gas is covered by Altude, some wallets require a minimum balance)
3. Make sure you're on the correct network (devnet)

## Learn More

- [Dynamic Documentation](https://docs.dynamic.xyz)
- [Dynamic Solana Guide](https://docs.dynamic.xyz/chains/solana)
- [Altude Documentation](https://docs.altude.io)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)

## Next Steps

- [x] Integrate with real Dynamic wallet SDK
- [x] Connect to real Altude API endpoint with automatic fallback
- [ ] Add real transaction types (transfers, program interactions)
- [ ] Implement error handling and retry logic
- [ ] Add transaction status polling
- [ ] Support multiple networks (devnet, mainnet)
- [ ] Add transaction history
- [ ] Implement rate limiting
