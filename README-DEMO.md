# Gasless Transaction Demo

A production-ready demonstration of Dynamic wallet integration with Altude's gasless relay service for Solana transactions.

## ✨ Features

- 🔐 **Real Dynamic Wallet Integration** - Connect with Phantom, Solflare, and other Solana wallets
- ⚡ **Gasless Transactions** - Altude covers transaction fees
- 🎯 **Production Ready** - Real Dynamic SDK + Real Altude API integration with automatic fallback
- 📱 **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, developer-focused interface with JetBrains Mono font

## 🚀 Quick Start

### 1. Get Your Dynamic Environment ID

1. Visit [Dynamic Dashboard](https://app.dynamic.xyz)
2. Create an account or sign in
3. Create a new project or select an existing one
4. Enable **Solana** in your wallet settings
5. Copy your **Environment ID** from project settings

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Dynamic environment ID
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id-here
```

### 3. Run the App

The app should already be running in your development environment. If not:

```bash
npm install
npm run dev
```

## 📖 How It Works

### The Flow

```
Dynamic Wallet → Sign Transaction → Altude Relay → Solana Blockchain
```

### Step-by-Step

1. **Connect Wallet** - Use Dynamic's widget to connect your Solana wallet
2. **Create Transaction** - Generate a simple memo transaction on Solana devnet
3. **Sign Transaction** - Dynamic prompts your wallet to sign the transaction
4. **Send Gasless** - Transaction is relayed via Altude (currently mocked)

## 🔧 Integration with Altude API

The demo includes **real Altude API integration** that automatically activates when you provide an API key.

### Quick Setup

1. Get your Altude API key from [Altude Dashboard](https://altude.io)
2. Add it to your `.env`:
   ```bash
   VITE_ALTUDE_API_KEY=your-altude-api-key
   ```
3. Restart the dev server - real API calls are now active!

### Testing Without API Key

No API key? No problem! The app automatically falls back to a mock relay service so you can test the entire flow without an Altude account. Just configure your Dynamic environment ID and you're ready to go.

See **[INTEGRATION.md](./INTEGRATION.md)** for detailed API documentation.

## 📚 Documentation

- **[INTEGRATION.md](./INTEGRATION.md)** - Detailed integration guide
- **[PRD.md](./PRD.md)** - Product requirements and design decisions
- **[Dynamic Docs](https://docs.dynamic.xyz)** - Dynamic wallet documentation
- **[Altude Docs](https://docs.altude.io)** - Altude relay documentation

## 🎯 Key Technologies

- **React 19** with TypeScript
- **Dynamic SDK** for wallet connections
- **Solana Web3.js** for blockchain interactions
- **Shadcn UI** components with Tailwind CSS
- **Vite** for fast development

## 🛠️ Project Structure

```
src/
├── App.tsx              # Main application with Dynamic integration
├── lib/
│   ├── solana.ts        # Solana transaction utilities
│   └── dynamic-wallet.ts # Wallet type definitions
└── components/ui/       # Shadcn UI components
```

## 🐛 Troubleshooting

### Wallet widget not showing

- Make sure you've set `VITE_DYNAMIC_ENVIRONMENT_ID` in your `.env`
- Verify Solana is enabled in your Dynamic project settings
- Check the browser console for errors

### Transaction signing fails

- Ensure your wallet is connected
- Make sure you're on Solana devnet
- Check that your wallet has a small SOL balance (for wallet approval, not fees)

### "Environment ID not found"

Create a `.env` file with your Dynamic environment ID:
```bash
VITE_DYNAMIC_ENVIRONMENT_ID=your-actual-id-here
```

## 📝 License

MIT

## 🤝 Contributing

This is a demonstration project. Feel free to fork and adapt for your needs!

## 🔗 Links

- [Dynamic](https://dynamic.xyz) - Wallet infrastructure
- [Altude](https://altude.io) - Gasless relay service
- [Solana](https://solana.com) - Blockchain platform
