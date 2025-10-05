# Solana Idle Game

A blockchain-based idle/incremental game built on Solana with automatic token generation and on-chain state management.

## Features

- 🎮 **Idle Gameplay**: Earn tokens automatically over time
- ⚡ **Solana Blockchain**: All game state stored on-chain
- 💰 **5 Generator Types**: Purchase upgrades to increase production
- 🔗 **Wallet Integration**: Connect with Phantom, Solflare, or any Solana wallet
- 📊 **Real-time Stats**: Track balance, production rate, and total earnings
- 🌐 **Web-based**: Play directly in your browser

## Game Mechanics

### Generators

| Generator | Cost | Production | Emoji |
|-----------|------|------------|-------|
| Basic Miner | 10 tokens | 1 token/sec | ⛏️ |
| Advanced Rig | 100 tokens | 15 tokens/sec | 🖥️ |
| Quantum Processor | 1,100 tokens | 180 tokens/sec | ⚛️ |
| Fusion Reactor | 12,000 tokens | 2,400 tokens/sec | ☢️ |
| Singularity Core | 130,000 tokens | 33,000 tokens/sec | 🌌 |

Each purchase increases cost by 15% (multiplier: 1.15)

## Project Structure

```
solana-idle-game/
├── programs/
│   └── idle-game/
│       ├── src/
│       │   ├── lib.rs           # Main program entry
│       │   ├── state.rs         # Account structures
│       │   ├── constants.rs     # Game constants
│       │   ├── errors.rs        # Custom errors
│       │   └── instructions/    # Program instructions
│       │       ├── initialize.rs
│       │       ├── player.rs
│       │       ├── purchase.rs
│       │       └── claim.rs
│       └── Cargo.toml
├── app/
│   ├── index.html              # Game UI
│   └── game.js                 # Frontend logic
├── Anchor.toml
└── Cargo.toml
```

## Tech Stack

### Backend (Solana Program)
- **Rust** - Smart contract language
- **Anchor Framework** - Solana development framework
- **SPL Token** - Token standard

### Frontend
- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - Game logic
- **@solana/web3.js** - Blockchain interaction (to be integrated)

## Setup & Installation

### Prerequisites
- Rust 1.75+
- Solana CLI 1.18+
- Anchor CLI 0.31+
- Node.js 18+

### Installation

1. **Clone the repository**
```bash
cd c:\Users\david\Documents\HTML\solana-idle-game
```

2. **Install Anchor dependencies**
```bash
anchor build
```

3. **Deploy to devnet**
```bash
solana config set --url devnet
anchor deploy
```

4. **Run the frontend**
```bash
cd app
python -m http.server 8000
# Or use any local server
```

5. **Open in browser**
```
http://localhost:8000
```

## Solana Program Instructions

### 1. Initialize
Initializes the global game state with token mint.

### 2. Initialize Player
Creates a player account for a new wallet.

### 3. Purchase Generator
Buys a generator to increase production rate.
- Costs increase exponentially
- Updates production rate automatically

### 4. Claim Rewards
Claims accumulated rewards based on time elapsed and production rate.
- Calculates: `rewards = production_rate × time_elapsed`
- Updates balance and total earned

## Development

### Build the program
```bash
anchor build
```

### Run tests
```bash
anchor test
```

### Deploy
```bash
anchor deploy --provider.cluster devnet
```

## Integration with Real Solana Wallet

The current frontend uses simulated blockchain interaction. To integrate with real Solana:

1. Install dependencies:
```bash
npm install @solana/web3.js @project-serum/anchor @solana/wallet-adapter-wallets
```

2. Replace simulated wallet connection with:
```javascript
const { solana } = window;
await solana.connect();
```

3. Use Anchor client to call program instructions:
```javascript
import * as anchor from '@project-serum/anchor';
// Initialize program, call instructions
```

## Security Considerations

- All arithmetic uses checked operations to prevent overflow
- PDA (Program Derived Addresses) ensure account security
- Authority checks prevent unauthorized actions
- Game can be paused by admin in emergencies

## Roadmap

- [ ] Real wallet integration (Phantom, Solflare)
- [ ] SPL token minting and distribution
- [ ] Leaderboard system
- [ ] NFT rewards for milestones
- [ ] Multiplayer features
- [ ] Mobile-responsive design

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built with [Anchor](https://anchor-lang.com) on [Solana](https://solana.com) 🚀
