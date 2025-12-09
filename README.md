# Hyperstitions UX Upgrade Layer

A **UX translation layer** for the Hyperstitions PAMM (Pot-split AMM) that solves the core user experience problems without changing the underlying smart contracts.

## 🎯 Problems Solved

### 1. "Late buyers can lose money"
**Solution:** `LateEntryBanner` component
- Shows EARLY / MID / LATE phase indicators
- Explains pot-share dilution risk clearly
- Sets expectations before users commit

### 2. "UX isn't great, people prefer $1/share"
**Solution:** `BuyPanelEnhanced` component
- Shows **effective price per share** (all-in cost)
- Breaks down AMM cost vs pot contribution
- Displays estimated payout if you win
- Bridges Polymarket mental model

### 3. "How to motivate action vs free riders"
**Solution:** `CoordinatorCTAStrip` component
- Tweet/Quote templates for easy sharing
- Coordinator checklist (gamification)
- Social proof stats (coordinators, shares, mentions)
- Makes the "buy + bet + build" loop visible

## 🧩 Components

| Component | Purpose |
|-----------|---------|
| `MarketClarityHeader` | Market question, odds, pot, time, phase at a glance |
| `BuyPanelEnhanced` | All-in price, cost breakdown, payout preview |
| `LateEntryBanner` | Time-based risk warnings and phase indicators |
| `CrowdingMeter` | Shows which side is crowded (lower upside) |
| `UserPositionCard` | Your shares, pot share %, estimated payouts |
| `CoordinatorCTAStrip` | Actions to help coordinate the outcome |

## 🎨 Design System

**House Style:** Terminal-inspired + Sci-fi HUD + High-contrast Noir

- **Primary accent:** `#ff6b00` (orange)
- **Secondary accent:** `#00ff88` (terminal green)
- **Background:** `#0a0a0a` (near black)
- **Typography:** JetBrains Mono (mono) + Space Grotesk (display)

Effects:
- Scanline overlay (CRT feel)
- Grid background
- Neon glow on accents
- Smooth spring animations

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📦 Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Web3:** Viem (read-only contract calls)

## 🔗 Contract Integration

The app reads from the deployed PAMM contract on Monad Testnet:

```typescript
// Contract addresses
HST:  0x97401d48A80B15bC7291599e24B590Eedcd7cE37
PAMM: 0x97b4a6b501C55cCC7A597E259266E7E28A2d0BE0
ZAMM: 0xe5e5bE029793A4481287Be2BFc37e2D38316c422
```

View functions used:
- `getMarket(marketId)` - Market state
- `getPool(marketId)` - Reserve balances
- `quoteBuyYes/No(marketId, amount)` - Buy quotes
- `balanceOf(user, tokenId)` - User positions

## 📋 What This Fixes (Summary)

| Problem | Component | Key Feature |
|---------|-----------|-------------|
| Late buyer confusion | LateEntryBanner | Phase indicators + risk warnings |
| $1/share preference | BuyPanelEnhanced | Effective price display |
| Free rider problem | CoordinatorCTAStrip | Tweet templates + checklist |
| "What do I own?" | UserPositionCard | Pot share % + payout scenarios |
| "Which side to pick?" | CrowdingMeter | Crowded side = lower upside |

## 🧠 Key Insight

> The mechanism isn't broken. It's a hybrid AMM + pot system that needs a hybrid UX.
> 
> This layer translates "protocol language" into "user language" without changing the economics.

## 📝 License

MIT
