# Token & Deposit/Withdraw Setup Guide

## 🎮 New Features Added

1. **Deposit SOL** - Deposit 0.2 SOL to get 1000 game tokens
2. **Withdraw Tokens** - Convert game tokens back to real tokens in wallet
3. **SPL Token Integration** - Real token visible in Phantom wallet

## 📋 Setup Steps

### Step 1: Create SPL Token (in WSL Ubuntu)

```bash
cd /mnt/c/Users/david/Documents/HTML/solana-idle-game

# Make script executable
chmod +x scripts/create-token.sh

# Run the script
./scripts/create-token.sh
```

**Save the Token Mint Address!** You'll need it for the next steps.

### Step 2: Rebuild and Redeploy Program

```bash
# Clean and rebuild
anchor clean
anchor build

# Deploy updated program
anchor deploy --provider.cluster devnet
```

### Step 3: Initialize Program with Token

```bash
# Replace TOKEN_MINT_HERE with your actual token mint address
npx ts-node scripts/initialize-game.ts TOKEN_MINT_HERE
```

Example:
```bash
npx ts-node scripts/initialize-game.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## 💰 How It Works

### Deposit Flow:
1. Player clicks "Deposit 0.2 SOL"
2. 0.2 SOL transferred from wallet → game vault
3. Player receives 1,000 game tokens (200,000,000,000 with 9 decimals)
4. Can now play and buy generators

### Withdraw Flow:
1. Player earns tokens by claiming rewards
2. Click "Withdraw to Wallet"
3. Game tokens deducted
4. SPL tokens minted to player's wallet
5. Tokens appear in Phantom wallet

## 🔧 Exchange Rate

- **1 SOL = 5,000 game tokens**
- **0.2 SOL = 1,000 game tokens** (entry fee)
- **0.1 SOL = 500 game tokens**

## 🎯 Program Instructions

### New Instructions Added:

1. **`deposit_sol(amount: u64)`**
   - Transfers SOL to game vault
   - Credits game tokens to player
   - Rate: amount × 5000 tokens

2. **`withdraw_tokens(amount: u64)`**
   - Deducts game tokens
   - Mints SPL tokens to wallet
   - Visible in Phantom

## 📊 Testing

### Test Deposit:
```bash
# Get devnet SOL first
solana airdrop 2

# In your frontend, click "Deposit 0.2 SOL"
# Check balance increased by 1000 tokens
```

### Test Withdraw:
```bash
# Earn some tokens by claiming
# Click "Withdraw to Wallet"
# Check Phantom wallet for SPL tokens
```

## 🔗 View Your Token

**Solana Explorer:**
```
https://explorer.solana.com/address/YOUR_TOKEN_MINT?cluster=devnet
```

**In Phantom Wallet:**
1. Open Phantom
2. Go to "Tokens" tab
3. Your game token should appear
4. Can send/receive like any SPL token

## 🚀 Next Steps

1. ✅ Create SPL token
2. ✅ Rebuild & redeploy program
3. ✅ Initialize with token mint
4. 🔄 Update frontend to call deposit/withdraw
5. 🎮 Test full flow

## 📝 Notes

- Deposits go to a PDA vault (can't be stolen)
- Withdrawals mint real SPL tokens
- All on Solana devnet (test tokens, no real value)
- Mainnet deployment requires real SOL

---

**Program ID:** `5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4`
