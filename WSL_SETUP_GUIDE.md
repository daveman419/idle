# WSL Ubuntu Setup Guide for Solana Development

## Step 1: Open WSL Ubuntu Terminal

You are currently in Git Bash (MINGW). You need to switch to WSL Ubuntu.

### Option A: Open Ubuntu from Windows Search
1. Press `Windows Key`
2. Type "Ubuntu"
3. Click on "Ubuntu" app

### Option B: Open from Windows Terminal
1. Press `Windows Key`
2. Type "Terminal"
3. Click on "Terminal"
4. Click the dropdown arrow (∨) at the top
5. Select "Ubuntu"

### Option C: Open from Command Line
1. Open PowerShell or CMD
2. Type: `wsl`
3. Press Enter

You should see a prompt like:
```
username@DESKTOP-XXXXX:~$
```

## Step 2: Navigate to Your Project in WSL

Your Windows `C:\` drive is accessible in WSL at `/mnt/c/`

```bash
cd /mnt/c/Users/david/Documents/HTML/solana-idle-game
```

## Step 3: Run the Quick Install Script

Copy and paste this command in your WSL Ubuntu terminal:

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

This will install:
- ✅ Rust
- ✅ Solana CLI
- ✅ Anchor Framework
- ✅ Node.js
- ✅ Yarn

The installation takes about 5-10 minutes.

## Step 4: Reload Your Shell

After installation completes, run:

```bash
source ~/.bashrc
```

Or close and reopen your Ubuntu terminal.

## Step 5: Verify Installation

Check that everything installed correctly:

```bash
rustc --version && solana --version && anchor --version && node --version && yarn --version
```

You should see output like:
```
rustc 1.86.0
solana-cli 2.2.12
anchor-cli 0.31.1
v23.11.0
1.22.1
```

## Step 6: Configure Solana

```bash
# Set to devnet
solana config set --url https://api.devnet.solana.com

# Generate a keypair (SAVE YOUR SEED PHRASE!)
solana-keygen new

# Check your address
solana address

# Request free test SOL
solana airdrop 2
```

## Step 7: Build and Deploy

```bash
# Navigate to project
cd /mnt/c/Users/david/Documents/HTML/solana-idle-game

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Troubleshooting

### "Command not found" after installation
Run: `source ~/.bashrc` or restart your terminal

### Cannot access Windows files
Your `C:\` drive is at `/mnt/c/` in WSL
Example: `C:\Users\david\Documents` = `/mnt/c/Users/david/Documents`

### Airdrop fails
- Try again: `solana airdrop 2`
- Use web faucet: https://faucet.solana.com/
- Wait 5 minutes between attempts

### Permission denied errors
Add execute permissions: `chmod +x filename`

### Slow installation
This is normal. The installation can take 5-10 minutes depending on your internet connection.

## VS Code Integration

If you use VS Code:

1. Install "WSL" extension in VS Code
2. Press `Ctrl+Shift+P`
3. Type "WSL: Connect to WSL"
4. Open folder: `/mnt/c/Users/david/Documents/HTML/solana-idle-game`

Now you can edit files in VS Code and run commands in the integrated WSL terminal!

## Next Steps After Setup

1. ✅ All tools installed
2. ✅ Solana configured for devnet
3. ✅ Keypair generated
4. ✅ Devnet SOL obtained
5. 🔨 Build program: `anchor build`
6. 🚀 Deploy: `anchor deploy`
7. 🎮 Test the game!

---

**Important:** Always use WSL Ubuntu terminal for Solana development, NOT Git Bash or PowerShell!

**Ready?** Open your WSL Ubuntu terminal and start from Step 3! 🚀
