# Quick Start - Deploy to Solana in 5 Minutes

## Option 1: Automated Setup (Windows)

1. **Run the setup script** (as Administrator):
```powershell
cd c:\Users\david\Documents\HTML\solana-idle-game
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

2. **Request devnet SOL**:
```bash
solana airdrop 2
```

3. **Build and deploy**:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

Done! Your program is now live on Solana devnet! 🎉

---

## Option 2: Manual Setup (Step-by-Step)

### Step 1: Install Solana CLI

**Windows:**
Download from: https://github.com/solana-labs/solana/releases/latest

Or use installer:
```powershell
# Download and run
https://github.com/solana-labs/solana/releases/download/v1.18.22/solana-install-init-x86_64-pc-windows-msvc.exe
```

**Mac/Linux:**
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.22/install)"
```

Add to PATH and verify:
```bash
solana --version
```

### Step 2: Install Rust

**All platforms:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Or download from: https://rustup.rs/

### Step 3: Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

Verify:
```bash
anchor --version
```

### Step 4: Setup Solana

```bash
# Generate keypair
solana-keygen new

# Configure for devnet
solana config set --url https://api.devnet.solana.com

# Check your address
solana address

# Request airdrop (free test SOL)
solana airdrop 2
```

### Step 5: Deploy

```bash
cd c:\Users\david\Documents\HTML\solana-idle-game

# Build
anchor build

# Get program ID
anchor keys list

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Step 6: Update Program ID

After first build, copy the program ID from `anchor keys list` and update:

1. **Anchor.toml**:
```toml
[programs.devnet]
idle_game = "YOUR_PROGRAM_ID_HERE"
```

2. **programs/idle-game/src/lib.rs**:
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

Then rebuild and deploy:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

---

## Verify Deployment

Check your program on Solana Explorer:
```
https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet
```

View program details:
```bash
solana program show YOUR_PROGRAM_ID
```

View logs:
```bash
solana logs YOUR_PROGRAM_ID
```

---

## Test the Game Locally

```bash
npm start
```

Open http://localhost:8000 and connect your wallet!

---

## Troubleshooting

### "Command not found" errors
- Make sure tools are in your PATH
- Restart your terminal after installation
- On Windows, you may need to restart your computer

### "Insufficient funds" error
- Request more SOL: `solana airdrop 2`
- Use the web faucet: https://faucet.solana.com/
- Wait a few minutes between airdrops (rate limited)

### Airdrop limit reached
- Use the web faucet: https://faucet.solana.com/
- Use a different RPC: `solana config set --url https://api.devnet.solana.com`
- Try again later (daily limits)

### Build errors
- Update Rust: `rustup update`
- Clean and rebuild: `anchor clean && anchor build`
- Check Anchor version: `anchor --version` (should be 0.31+)

### "Program already deployed"
Use upgrade instead:
```bash
anchor upgrade target/deploy/idle_game.so --program-id YOUR_PROGRAM_ID --provider.cluster devnet
```

---

## What's Next?

1. ✅ Program deployed to devnet
2. 📝 Create SPL token for rewards
3. 🎮 Initialize the game state
4. 🌐 Integrate real wallet in frontend
5. 🧪 Test all game functions
6. 📊 Monitor with Solana Explorer
7. 🚀 Deploy to mainnet (optional, costs real SOL)

---

## Important Notes

- **Devnet is free** - All SOL is test tokens with no value
- **Save your keypair** - Store ~/.config/solana/id.json securely
- **Save seed phrase** - Write it down during `solana-keygen new`
- **Test thoroughly** - Test on devnet before mainnet
- **Mainnet costs money** - Deploying to mainnet costs ~0.5-2 SOL

---

## Need Help?

- 📖 Full guide: See `DEPLOYMENT_GUIDE.md`
- 🤝 Solana Discord: https://discord.gg/solana
- 📚 Anchor Docs: https://www.anchor-lang.com/
- 🔍 Solana Cookbook: https://solanacookbook.com/

---

**Ready to deploy?** Start with Step 1! 🚀
