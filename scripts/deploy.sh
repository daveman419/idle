#!/bin/bash

# Solana Idle Game - Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Solana Idle Game - Deployment Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if required commands exist
command -v solana >/dev/null 2>&1 || { echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo -e "${RED}❌ Anchor not found. Please install it first.${NC}"; exit 1; }

# Get cluster argument (default: devnet)
CLUSTER=${1:-devnet}

echo -e "${YELLOW}📍 Deploying to: ${CLUSTER}${NC}"
echo ""

# Configure Solana
echo -e "${YELLOW}⚙️  Configuring Solana CLI...${NC}"
if [ "$CLUSTER" = "mainnet" ]; then
    solana config set --url https://api.mainnet-beta.solana.com
elif [ "$CLUSTER" = "devnet" ]; then
    solana config set --url https://api.devnet.solana.com
else
    solana config set --url http://localhost:8899
fi

# Show current configuration
echo -e "${CYAN}Current configuration:${NC}"
solana config get
echo ""

# Show wallet address and balance
echo -e "${CYAN}Wallet address:${NC}"
solana address
echo ""
echo -e "${CYAN}Current balance:${NC}"
solana balance
echo ""

# Check if sufficient balance
BALANCE=$(solana balance | awk '{print $1}')
if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${RED}⚠️  Insufficient balance. You need at least 2 SOL.${NC}"
    if [ "$CLUSTER" = "devnet" ]; then
        echo -e "${YELLOW}Requesting airdrop...${NC}"
        solana airdrop 2 || echo -e "${YELLOW}Airdrop failed. Try manually: solana airdrop 2${NC}"
        sleep 2
    else
        echo -e "${RED}Please fund your wallet before deploying to ${CLUSTER}.${NC}"
        exit 1
    fi
fi

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
anchor clean

# Build the program
echo -e "${YELLOW}🔨 Building the program...${NC}"
anchor build

# Get program ID
echo ""
echo -e "${CYAN}Program IDs:${NC}"
anchor keys list

# Ask for confirmation
echo ""
echo -e "${YELLOW}⚠️  Ready to deploy to ${CLUSTER}.${NC}"
if [ "$CLUSTER" = "mainnet" ]; then
    echo -e "${RED}WARNING: Deploying to mainnet will cost real SOL!${NC}"
fi
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Deploy
echo -e "${YELLOW}🚀 Deploying to ${CLUSTER}...${NC}"
anchor deploy --provider.cluster $CLUSTER

# Show program info
PROGRAM_ID=$(anchor keys list | grep "idle_game" | awk '{print $2}')
echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "${CYAN}Program ID: ${PROGRAM_ID}${NC}"
echo -e "${CYAN}Cluster: ${CLUSTER}${NC}"
echo ""

# Show program details
echo -e "${YELLOW}📊 Program details:${NC}"
solana program show $PROGRAM_ID

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your frontend with Program ID: $PROGRAM_ID"
echo "2. Initialize the program: npm run initialize"
echo "3. Test the game: npm start"
echo ""
echo -e "${CYAN}View transactions: https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${CLUSTER}${NC}"
echo ""
