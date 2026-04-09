# Planning Guide

A demonstration web application that showcases how the Dynamic wallet SDK integrates with Altude's gasless relay service for Solana transactions.

**Experience Qualities**:
1. **Educational** - Clearly demonstrates the separation of concerns between wallet signing and gasless relay with real Dynamic SDK integration
2. **Transparent** - Shows each step of the transaction flow with visible feedback and actual wallet connection
3. **Developer-focused** - Production-ready code using real Dynamic SDK that serves as a reference implementation

**Complexity Level**: Micro Tool (single-purpose application)
This is a focused demonstration tool designed to illustrate a specific technical flow using the real Dynamic wallet SDK for Solana, followed by three discrete transaction steps.

## Essential Features

### Dynamic Wallet Connection
- **Functionality**: Connects to real Solana wallets through Dynamic's SDK (Phantom, Solflare, etc.)
- **Purpose**: Demonstrates production wallet authentication with Dynamic
- **Trigger**: User clicks Dynamic's pre-built wallet connection widget
- **Progression**: Click widget → Choose wallet provider → Authenticate → Display wallet address → Enable transaction flow
- **Success criteria**: Real wallet connected state shown with actual address from Dynamic

### Create Transaction Button
- **Functionality**: Generates a simple Solana devnet transaction (memo instruction) using the connected wallet's real public key
- **Purpose**: Demonstrates transaction creation separate from signing and relaying
- **Trigger**: User clicks "Create Transaction" button (enabled after Dynamic wallet connection)
- **Progression**: Click → Generate transaction with memo → Display confirmation → Enable sign button
- **Success criteria**: Transaction object created with real wallet address and status displayed

### Sign Transaction Button
- **Functionality**: Signs the transaction using the real Dynamic wallet connector
- **Purpose**: Shows how Dynamic SDK handles transaction signing in production
- **Trigger**: User clicks "Sign with Dynamic Wallet" button (enabled after transaction creation)
- **Progression**: Click → Dynamic prompts user in their wallet → User approves → Serialize to base64 → Display truncated signed transaction → Enable send button
- **Success criteria**: Base64 signed transaction displayed after real wallet signature with clear Dynamic branding

### Send Gasless Button
- **Functionality**: Relays the signed transaction through Altude's gasless service with real API integration
- **Purpose**: Demonstrates the final relay step that Altude provides using production endpoints
- **Trigger**: User clicks "Send Gasless via Altude" button (enabled after real signing)
- **Progression**: Click → Call real Altude API (or mock if no key) → Display transaction signature → Show explorer link
- **Success criteria**: Transaction signature displayed with Solscan link, automatic fallback to mock if API key not configured

### Flow Diagram
- **Functionality**: Visual representation of the architecture
- **Purpose**: Clarifies role separation between Dynamic and Altude components
- **Trigger**: Visible after wallet connection
- **Progression**: Static display showing: Dynamic → Sign Tx → Altude → Solana
- **Success criteria**: Clear visual distinction between wallet provider (Dynamic) and Altude relay roles

## Edge Case Handling
- **Wallet Not Connected**: All transaction buttons disabled until Dynamic wallet connects
- **Sequential Flow Enforcement**: Buttons disabled until previous steps complete
- **Dynamic Widget Integration**: Uses Dynamic's pre-built widget for connection/disconnect
- **Missing Transaction**: Prevent signing if no transaction exists
- **Missing Signature**: Prevent relay if transaction not signed with real wallet
- **Environment Configuration**: Graceful handling of missing Dynamic environment ID

## Design Direction
The design should feel technical and developer-focused while remaining clean and approachable. It should evoke clarity, precision, and educational value - like reading well-documented code or a technical diagram. The Dynamic wallet integration should feel prominent and clearly branded.

## Color Selection

- **Primary Color**: Deep indigo `oklch(0.45 0.15 270)` - Technical and trustworthy, represents the Solana/blockchain ecosystem
- **Secondary Colors**: 
  - Slate gray `oklch(0.35 0.02 250)` for supportive UI elements
  - Cool blue `oklch(0.55 0.12 240)` for informational states
- **Accent Color**: Vibrant cyan `oklch(0.75 0.15 195)` for actions and CTAs, suggests connectivity and flow
- **Foreground/Background Pairings**:
  - Primary (Deep Indigo oklch(0.45 0.15 270)): White text (oklch(0.98 0 0)) - Ratio 7.2:1 ✓
  - Accent (Vibrant Cyan oklch(0.75 0.15 195)): Dark slate (oklch(0.15 0.02 250)) - Ratio 12.5:1 ✓
  - Background (Light gray oklch(0.98 0 0)): Dark text (oklch(0.15 0.02 250)) - Ratio 14.8:1 ✓
  - Card (White oklch(1 0 0)): Dark text (oklch(0.15 0.02 250)) - Ratio 16.5:1 ✓

## Font Selection
Use JetBrains Mono for the application to reinforce the developer-tool aesthetic, with clear monospaced hierarchy that makes technical content scannable.

- **Typographic Hierarchy**:
  - H1 (Main Title): JetBrains Mono Bold / 32px / tight tracking
  - H2 (Subtitle): JetBrains Mono Medium / 16px / normal tracking / muted color
  - Button Labels: JetBrains Mono Medium / 14px / wide tracking
  - Code/Transaction Data: JetBrains Mono Regular / 13px / monospace
  - Body/Helper Text: JetBrains Mono Regular / 14px / relaxed line-height (1.6)

## Animations
Animations should be minimal and functional, reinforcing state changes rather than decoration. Button states should have subtle hover lifts (2px translate) with 150ms duration. Status transitions should fade in (200ms) to indicate new information. The flow diagram arrows should have a subtle pulse animation (2s duration) to suggest data movement.

## Component Selection

- **Components**:
  - Card: Main container for the demo interface
  - Button: Primary action buttons with clear states (default, hover, disabled)
  - Badge: Display status and step indicators
  - Separator: Visual division between flow sections
  
- **Customizations**:
  - Custom flow diagram component using simple div/spans with connecting arrows
  - Code block styled areas for displaying transaction data with monospace font
  - Step indicator system showing completed/active/pending states
  - Wallet connection state display with address truncation
  
- **States**:
  - Buttons: Vibrant cyan for enabled, muted gray for disabled, slight scale on hover
  - Transaction displays: Light code-block background with syntax-like highlighting
  - Status indicators: Green for success, blue for in-progress, gray for pending
  - Wallet connected: Primary colored badge with address display
  
- **Icon Selection**:
  - ArrowRight: Flow progression in diagram
  - CheckCircle: Completed steps
  - Wallet: Dynamic wallet representation
  - Lightning: Gasless/relay indicator
  - Globe: Blockchain representation
  - Power: Disconnect wallet action
  
- **Spacing**:
  - Card padding: 32px (p-8)
  - Section gaps: 24px (gap-6)
  - Button spacing: 12px (gap-3)
  - Inline elements: 8px (gap-2)
  
- **Mobile**:
  - Stack flow diagram vertically with down arrows
  - Full-width buttons on mobile
  - Reduce card padding to 20px (p-5)
  - Smaller typography scale (H1 to 24px, body to 13px)
