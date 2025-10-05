#!/bin/bash
# Create SPL Token for Solana Idle Game

echo "🪙 Creating SPL Token for Solana Idle Game on Devnet"
echo "=================================================="
echo ""

# Make sure we're on devnet
solana config set --url https://api.devnet.solana.com

# Check balance
echo "📍 Your wallet:"
solana address
echo ""
echo "💰 Your balance:"
solana balance
echo ""

# Request airdrop if needed
BALANCE=$(solana balance | awk '{print $1}')
if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2
    sleep 2
fi

# Create token mint
echo "🏭 Creating token mint..."
TOKEN_MINT=$(spl-token create-token --decimals 9 | grep "Creating token" | awk '{print $3}')

if [ -z "$TOKEN_MINT" ]; then
    echo "❌ Failed to create token"
    exit 1
fi

echo "✅ Token created: $TOKEN_MINT"
echo ""

# Create token account
echo "📦 Creating token account..."
spl-token create-account $TOKEN_MINT

# Mint initial supply (1 billion tokens)
echo "💵 Minting initial supply (1,000,000,000 tokens)..."
spl-token mint $TOKEN_MINT 1000000000

echo ""
echo "=================================================="
echo "✅ Token Setup Complete!"
echo ""
echo "📋 Token Details:"
echo "   Mint Address: $TOKEN_MINT"
echo "   Decimals: 9"
echo "   Initial Supply: 1,000,000,000"
echo ""
echo "🔗 View on Explorer:"
echo "   https://explorer.solana.com/address/$TOKEN_MINT?cluster=devnet"
echo ""
echo "📝 Next Steps:"
echo "   1. Update Anchor.toml with this token mint"
echo "   2. Update lib.rs declare_id with your program ID"
echo "   3. Rebuild and redeploy: anchor build && anchor deploy"
echo "   4. Initialize the program with this token mint"
echo ""
echo "💾 Save this token address: $TOKEN_MINT"
echo ""
