# Planning Guide

A minimal demonstration web application that showcases how third-party wallet providers (like Dynamic) can work alongside Altude's gasless relay service for Solana transactions.

**Experience Qualities**:
1. **Educational** - Clearly demonstrates the separation of concerns between wallet signing and gasless relay
2. **Transparent** - Shows each step of the transaction flow with visible feedback
3. **Developer-focused** - Simple, readable code that serves as a reference implementation

**Complexity Level**: Micro Tool (single-purpose application)
This is a focused demonstration tool designed to illustrate a specific technical flow with three discrete steps.

## Essential Features

### Create Transaction Button
- **Functionality**: Generates a simple Solana devnet transaction (memo instruction)
- **Purpose**: Demonstrates transaction creation separate from signing and relaying
- **Trigger**: User clicks "Create Transaction" button
- **Progression**: Click → Generate transaction with memo → Display confirmation → Enable sign button
- **Success criteria**: Transaction object created and status displayed

### Sign Transaction Button
- **Functionality**: Signs the transaction using a simulated keypair (representing third-party wallet behavior)
- **Purpose**: Shows where wallet providers like Dynamic fit into the flow
- **Trigger**: User clicks "Sign Transaction" button (enabled after transaction creation)
- **Progression**: Click → Simulate wallet signing → Serialize to base64 → Display truncated signed transaction → Enable send button
- **Success criteria**: Base64 signed transaction displayed with clear comment about production wallet integration

### Send Gasless Button
- **Functionality**: Relays the signed transaction through Altude's gasless service (mocked)
- **Purpose**: Demonstrates the final relay step that Altude provides
- **Trigger**: User clicks "Send Gasless" button (enabled after signing)
- **Progression**: Click → Call relay function → Mock API response → Display transaction signature → Show explorer link
- **Success criteria**: Mock relay response displayed with transaction signature and Solscan link

### Flow Diagram
- **Functionality**: Visual representation of the architecture
- **Purpose**: Clarifies role separation between components
- **Trigger**: Always visible at top of interface
- **Progression**: Static display showing: Wallet → Signed Transaction → Altude → Blockchain
- **Success criteria**: Clear visual distinction between wallet provider and Altude roles

## Edge Case Handling
- **Sequential Flow Enforcement**: Buttons disabled until previous steps complete
- **Reset Capability**: Clear way to restart the flow
- **Missing Transaction**: Prevent signing if no transaction exists
- **Missing Signature**: Prevent relay if transaction not signed

## Design Direction
The design should feel technical and developer-focused while remaining clean and approachable. It should evoke clarity, precision, and educational value - like reading well-documented code or a technical diagram.

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
  
- **States**:
  - Buttons: Vibrant cyan for enabled, muted gray for disabled, slight scale on hover
  - Transaction displays: Light code-block background with syntax-like highlighting
  - Status indicators: Green for success, blue for in-progress, gray for pending
  
- **Icon Selection**:
  - ArrowRight: Flow progression in diagram
  - CheckCircle: Completed steps
  - Wallet: Wallet provider representation
  - Lightning: Gasless/relay indicator
  - Globe: Blockchain representation
  
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
