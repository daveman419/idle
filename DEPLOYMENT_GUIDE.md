# Solana Idle Game - Deployment Guide

This guide will help you deploy your idle game to the Solana blockchain.

## Prerequisites Installation

### 1. Install Rust

Open PowerShell as Administrator and run:

```powershell
# Download and install Rust
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
.\rustup-init.exe
```

After installation, restart your terminal and verify:
```bash
rustc --version
cargo --version
```

### 2. Install Solana CLI

In PowerShell:

```powershell
# Download Solana installer
Invoke-WebRequest -Uri "https://github.com/solana-labs/solana/releases/download/v1.18.22/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "solana-install-init.exe"

# Run installer
.\solana-install-init.exe v1.18.22
```

Add to PATH (in PowerShell):
```powershell
$env:Path += ";$env:USERPROFILE\.local\share\solana\install\active_release\bin"
```

Verify:
```bash
solana --version
```

### 3. Install Anchor

```bash
# Install avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor
avm install latest
avm use latest
```

Verify:
```bash
anchor --version
```

### 4. Install Node.js Dependencies

```bash
cd c:\Users\david\Documents\HTML\solana-idle-game
npm install
```

## Deployment Steps

### Step 1: Generate a Solana Keypair

```bash
# Create a new keypair for deployment
solana-keygen new --outfile ~/.config/solana/id.json

# Or use existing keypair if you have one
# Save your seed phrase securely!
```

### Step 2: Configure Solana for Devnet

```bash
# Set cluster to devnet (free testnet)
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get
```

### Step 3: Request Airdrop (Devnet SOL)

```bash
# Check your address
solana address

# Request 2 SOL airdrop (devnet tokens, not real)
solana airdrop 2

# Check balance
solana balance
```

**Note:** If airdrop fails, use the [Solana Faucet](https://faucet.solana.com/)

### Step 4: Build the Program

```bash
cd c:\Users\david\Documents\HTML\solana-idle-game

# Build the Anchor program
anchor build
```

This will:
- Compile the Rust program
- Generate IDL (Interface Definition Language)
- Create the program binary

### Step 5: Get Program ID

```bash
# Get the program ID from the build
anchor keys list
```

Copy the program ID and update it in:
1. `Anchor.toml` - Update both `[programs.localnet]` and `[programs.devnet]`
2. `programs/idle-game/src/lib.rs` - Update the `declare_id!` macro

### Step 6: Rebuild After Program ID Update

```bash
# Rebuild with correct program ID
anchor build
```

### Step 7: Deploy to Devnet

```bash
# Deploy the program to Solana devnet
anchor deploy --provider.cluster devnet
```

**Expected Output:**
```
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: <your-wallet-address>
Deploying program "idle_game"...
Program Id: <program-id>
Deploy success
```

### Step 8: Initialize the Program

You'll need to create a script to initialize the global state. Create `scripts/initialize.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IdleGame } from "../target/types/idle_game";
import { PublicKey } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.IdleGame as Program<IdleGame>;

  // Derive global state PDA
  const [globalState] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  console.log("Initializing program...");
  console.log("Global State:", globalState.toString());

  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        globalState: globalState,
        tokenMint: new PublicKey("YOUR_TOKEN_MINT_ADDRESS"), // Create SPL token first
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✅ Initialized! Transaction:", tx);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
```

Run it:
```bash
anchor run initialize
```

## Creating an SPL Token (Required)

Before initializing, create an SPL token for the game:

```bash
# Create token mint
spl-token create-token

# Save the token address, then create an account for it
spl-token create-account <TOKEN_ADDRESS>

# Mint some initial supply (optional)
spl-token mint <TOKEN_ADDRESS> 1000000
```

## Frontend Integration

After deployment, update the frontend to use real blockchain:

### Install Frontend Dependencies

```bash
npm install @solana/web3.js @coral-xyz/anchor @solana/wallet-adapter-wallets @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
```

### Update game.js

Replace the simulated wallet connection with real Solana wallet adapter (see INTEGRATION_GUIDE.md for details).

## Verification

### Check Program Deployment

```bash
# View program details
solana program show <PROGRAM_ID>

# Check program balance
solana balance <PROGRAM_ID>
```

### Test Instructions

```bash
# Run Anchor tests
anchor test --skip-local-validator
```

## Troubleshooting

### "Insufficient funds" Error
- Request more SOL: `solana airdrop 2`
- Or use faucet: https://faucet.solana.com/

### "Program already deployed" Error
- Use `anchor upgrade` instead: `anchor upgrade --provider.cluster devnet target/deploy/idle_game.so --program-id <PROGRAM_ID>`

### Build Errors
- Ensure Rust is updated: `rustup update`
- Clean build: `anchor clean && anchor build`

### Airdrop Fails
- Devnet sometimes has rate limits
- Use the web faucet: https://faucet.solana.com/
- Or wait a few minutes and try again

## Mainnet Deployment (Real SOL Required)

**WARNING: Only deploy to mainnet after thorough testing!**

```bash
# Configure for mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Deploy (costs real SOL)
anchor deploy --provider.cluster mainnet
```

**Cost:** Deploying to mainnet costs approximately 0.5-2 SOL depending on program size.

## Next Steps

1. ✅ Deploy program to devnet
2. ✅ Create SPL token mint
3. ✅ Initialize global state
4. ✅ Update frontend with program ID
5. ✅ Test with real Phantom wallet
6. 📊 Add monitoring and analytics
7. 🚀 Deploy to mainnet (optional)

## Useful Commands

```bash
# View logs
solana logs <PROGRAM_ID>

# Get cluster info
solana cluster-version

# View recent transactions
solana transaction-history <YOUR_ADDRESS>
```

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [SPL Token Guide](https://spl.solana.com/token)
- [Solana Discord](https://discord.gg/solana)

---

**Ready to deploy?** Start with Step 1 above! 🚀
