<div align="center">

# Altude Dynamic Gas Station Demo

**Gasless Solana Transactions with Dynamic Wallet Integration**

***Connect any wallet. Sign transactions. Altude covers the gas.***

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)

[Website](https://altude.so) • [Documentation](https://docs.altude.so) • [Discord](https://discord.gg/9gPsQeZD7x) • [Twitter](https://x.com/altudeso)

</div>

---

## Overview

A reference demo showing how [Dynamic](https://dynamic.xyz) embedded wallets integrate with [Altude's](https://altude.so) gasless relay service on Solana. Users sign in with email, get an embedded wallet, sign a transaction, and Altude relays it to the blockchain — covering all gas fees.

## Features

- **Dynamic Embedded Wallets** — Users sign in with email and get a Solana wallet automatically
- **Gasless Transactions** — Altude covers transaction fees so users never need SOL for gas
- **Create Account Flow** — Demonstrates `SystemProgram.createAccount` with Altude as fee payer
- **Transaction History** — Persistent history with Solscan explorer links
- **Mock Fallback** — Works without an Altude API key using simulated responses

---

## Setup — Step by Step

### 1. Clone and install

```bash
git clone https://github.com/AltudePlatform/altude-dynamic-gas-station-demo.git
cd altude-dynamic-gas-station-demo
npm install
```

### 2. Get your Dynamic Environment ID

You need a **Dynamic Environment ID** to power the wallet and authentication.

1. Go to [**app.dynamic.xyz**](https://app.dynamic.xyz) and sign up or log in
2. Create a new project (or use an existing one)
3. In the left sidebar, go to **Developer** → **SDK & API Keys**
4. Copy your **Environment ID** — it looks like `1ff61056-b242-40e6-88be-a85a1ce4549b`

> **Important:** Make sure Solana is enabled for your project. In your Dynamic dashboard, go to **Chains and Networks** and turn on **Solana**.

### 3. Get your Altude API Keys

You need **Altude API Keys** to relay transactions gaslessly. You can configure separate keys for Devnet and Mainnet.

1. Go to [**app.altude.so**](https://app.altude.so) and sign up or log in
2. Navigate to **API Keys** in your dashboard
3. Create an API key for **Devnet** and/or **Mainnet**
4. Copy each key — they look like `ak_6B0v1aH5B2QNEvg3VHZ-PJGWFLAT7TYhKIiqKIwNiS8`

> **No API key yet?** The demo will still run in **mock mode** for any network without a key — it simulates the API responses so you can test the full wallet → sign → relay flow. You just won't see real on-chain transactions.
>
> The network dropdown will show **(no key)** next to any network that isn't configured, and those networks will be disabled.

### 4. Create your `.env` file

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

Open `.env` and paste your credentials:

```bash
# Required — Get this from https://app.dynamic.xyz
VITE_DYNAMIC_ENVIRONMENT_ID=your-environment-id-here

# Altude API Keys — Get these from https://app.altude.so
# Set one or both depending on which networks you want to use
VITE_ALTUDE_API_KEY_DEVNET=your-devnet-api-key-here
VITE_ALTUDE_API_KEY_MAINNET=your-mainnet-api-key-here

# Optional — SPL token mint address
# Enables ATA creation in the transaction and the Send button
VITE_TOKEN_MINT=
```

**The Dynamic Environment ID is required** — without it the app won't load. The Altude API keys are optional per-network — any network without a key runs in mock mode and is disabled in the dropdown. If `VITE_TOKEN_MINT` is set, the Create Transaction step will also create an Associated Token Account (ATA) for that mint, and the Send Transaction button will be enabled.

### 5. Run the app

```bash
npm run dev
```

Open [**http://localhost:5000**](http://localhost:5000) in your browser.

---

## How It Works

```
Email Sign-in → Embedded Wallet → Sign Transaction → Altude Relay → Solana Blockchain
```

The demo walks through a 4-step flow:

| Step | What happens | Who pays |
|------|-------------|----------|
| **1. Create Transaction** | A `SystemProgram.createAccount` transaction is built with Altude as the fee payer | — |
| **2. Sign with Wallet** | Dynamic prompts the embedded wallet to sign the transaction | — |
| **3. Register Account** | The signed transaction is sent to Altude's `/api/Account/create` endpoint | **Altude** |
| **4. Send Transaction** | The signed transaction is relayed through Altude's `/api/Transaction/send` endpoint | **Altude** |

**Key concept:** Altude does _not_ replace your wallet — it complements it. Dynamic handles wallet creation and signing; Altude handles relay and gas fees.

## Architecture

```
┌──────────────────────────────────────┐
│          React Frontend              │
│  (Dynamic SDK + Solana Web3.js)      │
└──────────────┬───────────────────────┘
               │
       ┌───────▼────────┐
       │  Dynamic SDK   │
       │  (Embedded     │
       │   Wallet +     │
       │   Signing)     │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Altude Relay  │
       │  (Gas Station) │
       └───────┬────────┘
               │
        ┌──────▼───────┐
        │    Solana     │
        │  Blockchain   │
        └──────────────┘
```

## Integration

See **[INTEGRATION.md](./INTEGRATION.md)** for detailed API documentation, code examples, and integration patterns for using Altude in your own app.

## Tech Stack

- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** — UI framework
- **[Dynamic SDK](https://docs.dynamic.xyz/)** — Embedded wallets and authentication
- **[Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)** — Transaction creation
- **[Vite](https://vite.dev/)** — Build tooling
- **[Tailwind CSS](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** — Styling

## Project Structure

```
src/
├── App.tsx                     # Main app — Dynamic integration + 4-step flow
├── components/
│   ├── TransactionHistory.tsx  # Transaction history display
│   └── ui/                    # shadcn/ui components
└── lib/
    ├── solana.ts              # Transaction creation + Altude relay
    ├── types.ts               # TypeScript interfaces
    └── utils.ts               # Utilities
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Wallet widget not showing | Verify `VITE_DYNAMIC_ENVIRONMENT_ID` is set correctly in `.env` |
| "Environment ID not found" | Create `.env` file — run `cp .env.example .env` and add your Dynamic ID |
| Transaction signing fails | Make sure your Dynamic project has **Solana** enabled under Chains and Networks |
| API returns 401 | Check that `VITE_ALTUDE_API_KEY_DEVNET` or `VITE_ALTUDE_API_KEY_MAINNET` is correct and active |
| Network shows "(no key)" | That network has no API key configured — add the matching `VITE_ALTUDE_API_KEY_*` to `.env` |
| App shows mock mode | You're missing the API key for the selected network — check your `.env` |
| Send button disabled | Set `VITE_TOKEN_MINT` to an SPL token mint address in `.env` |
| Port 5000 in use | The dev server runs on port 5000 by default. Stop other processes or change the port in `vite.config.ts` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## Support

- **Documentation**: [docs.altude.so](https://docs.altude.so)
- **Discord**: [Join our community](https://discord.gg/9gPsQeZD7x)
- **Email**: [andrew@altude.so](mailto:andrew@altude.so)
- **Twitter**: [@altudeso](https://x.com/altudeso)

---

<div align="center">

**Built with ❤️ by the [Altude](https://altude.so) Team**

</div>

