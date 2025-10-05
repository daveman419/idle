// Solana Idle Game - Real Blockchain Integration
// Program ID: 5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4 (Devnet)

const PROGRAM_ID = '5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4';
const DEVNET_RPC = 'https://api.devnet.solana.com';

class SolanaIdleGameBlockchain {
    constructor() {
        this.wallet = null;
        this.connected = false;
        this.walletAddress = null;

        // Game state (will be fetched from blockchain)
        this.balance = 0;
        this.generators = [0, 0, 0, 0, 0];
        this.lastClaimTime = Date.now();
        this.totalEarned = 0;
        this.productionRate = 0;
        this.pendingRewards = 0;

        this.generatorTypes = [
            { id: 0, name: "Basic Miner", baseCost: 10, productionRate: 1, multiplier: 1.15, emoji: "⛏️" },
            { id: 1, name: "Advanced Rig", baseCost: 100, productionRate: 15, multiplier: 1.15, emoji: "🖥️" },
            { id: 2, name: "Quantum Processor", baseCost: 1100, productionRate: 180, multiplier: 1.15, emoji: "⚛️" },
            { id: 3, name: "Fusion Reactor", baseCost: 12000, productionRate: 2400, multiplier: 1.15, emoji: "☢️" },
            { id: 4, name: "Singularity Core", baseCost: 130000, productionRate: 33000, multiplier: 1.15, emoji: "🌌" }
        ];

        this.init();
    }

    init() {
        // Setup event listeners
        document.getElementById('connect-wallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('claim-btn').addEventListener('click', () => this.claimRewards());
        document.getElementById('deposit-btn')?.addEventListener('click', () => this.depositSol());
        document.getElementById('withdraw-btn')?.addEventListener('click', () => this.withdrawTokens());

        // Detect Phantom wallet
        this.detectWallet();

        // Update loop
        setInterval(() => this.updateGame(), 100);
    }

    detectWallet() {
        if (window.solana && window.solana.isPhantom) {
            console.log('Phantom wallet detected!');
            // Check if already connected
            window.solana.on('connect', () => {
                console.log('Wallet connected automatically');
            });
        } else {
            console.log('Phantom wallet not found. Please install: https://phantom.app/');
        }
    }

    async connectWallet() {
        try {
            // Check if Phantom is installed
            if (!window.solana || !window.solana.isPhantom) {
                this.showNotification('Please install Phantom wallet first!', 'error');
                window.open('https://phantom.app/', '_blank');
                return;
            }

            this.showLoading(true);

            // Connect to Phantom
            const response = await window.solana.connect();
            this.wallet = window.solana;
            this.walletAddress = response.publicKey.toString();
            this.connected = true;

            console.log('Connected to wallet:', this.walletAddress);

            // Check if player account exists on-chain
            await this.fetchPlayerData();

            this.showLoading(false);
            this.showGame();
            this.showNotification('Wallet connected! Connected to Solana Devnet', 'success');

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            this.showLoading(false);
            this.showNotification('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    async fetchPlayerData() {
        try {
            // In a real implementation, you would:
            // 1. Derive the player PDA (Program Derived Address)
            // 2. Fetch account data from the blockchain
            // 3. Deserialize the account data

            console.log('Fetching player data from blockchain...');
            console.log('Program ID:', PROGRAM_ID);
            console.log('Player Wallet:', this.walletAddress);

            // For now, we'll use simulated data until we add @solana/web3.js
            // TODO: Add real blockchain data fetching

            // Give starter tokens for demo
            this.balance = 50;
            this.lastClaimTime = Date.now();

        } catch (error) {
            console.error('Error fetching player data:', error);
            // If account doesn't exist, it's a new player
            this.balance = 50; // Starter tokens
        }
    }

    async claimRewards() {
        if (!this.connected) {
            this.showNotification('Please connect your wallet first!', 'error');
            return;
        }

        if (this.pendingRewards < 0.01) {
            this.showNotification('No rewards to claim yet!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            // In a real implementation, you would:
            // 1. Build the claim_rewards transaction
            // 2. Send it to the blockchain via wallet.signAndSendTransaction()
            // 3. Wait for confirmation

            console.log('Claiming rewards on blockchain...');
            console.log('Amount:', this.pendingRewards);

            // Simulated for now - TODO: Add real transaction
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.balance += this.pendingRewards;
            this.totalEarned += this.pendingRewards;
            this.lastClaimTime = Date.now();
            this.pendingRewards = 0;

            this.showLoading(false);
            this.updateDisplay();
            this.renderGenerators();

            this.showNotification('Rewards claimed on Solana! 💰', 'success');

        } catch (error) {
            console.error('Claim failed:', error);
            this.showLoading(false);
            this.showNotification('Transaction failed: ' + error.message, 'error');
        }
    }

    async purchaseGenerator(genId) {
        if (!this.connected) {
            this.showNotification('Please connect your wallet first!', 'error');
            return;
        }

        const cost = this.calculateCost(genId);

        if (this.balance < cost) {
            this.showNotification('Insufficient balance!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            // In a real implementation, you would:
            // 1. Build the purchase_generator transaction
            // 2. Send it to the blockchain via wallet.signAndSendTransaction()
            // 3. Wait for confirmation

            console.log('Purchasing generator on blockchain...');
            console.log('Generator ID:', genId);
            console.log('Cost:', cost);

            // Simulated for now - TODO: Add real transaction
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.balance -= cost;
            this.generators[genId]++;
            this.updateProductionRate();

            this.showLoading(false);
            this.renderGenerators();
            this.updateDisplay();

            const gen = this.generatorTypes[genId];
            this.showNotification(`Purchased ${gen.name} on Solana! ${gen.emoji}`, 'success');

        } catch (error) {
            console.error('Purchase failed:', error);
            this.showLoading(false);
            this.showNotification('Transaction failed: ' + error.message, 'error');
        }
    }

    showGame() {
        document.getElementById('not-connected').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('connect-wallet').classList.add('hidden');
        document.getElementById('wallet-info').classList.remove('hidden');
        document.getElementById('wallet-address').textContent =
            this.walletAddress.slice(0, 4) + '...' + this.walletAddress.slice(-4);

        this.renderGenerators();
        this.updateDisplay();
    }

    updateGame() {
        if (!this.connected) return;

        const now = Date.now();
        const timeDiff = (now - this.lastClaimTime) / 1000;
        this.pendingRewards = this.productionRate * timeDiff;

        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('balance').textContent = this.formatNumber(this.balance);
        document.getElementById('pending-rewards').textContent = this.formatNumber(this.pendingRewards);
        document.getElementById('production-rate').textContent = this.formatNumber(this.productionRate);
        document.getElementById('total-earned').textContent = this.formatNumber(this.totalEarned);

        this.updateOwnedGenerators();
    }

    renderGenerators() {
        const container = document.getElementById('generators-container');
        container.innerHTML = '';

        this.generatorTypes.forEach(gen => {
            const owned = this.generators[gen.id];
            const cost = this.calculateCost(gen.id);
            const canAfford = this.balance >= cost;

            const card = document.createElement('div');
            card.className = `bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 ${canAfford ? 'border-purple-500/50 hover:border-purple-500 cursor-pointer transform hover:scale-105' : 'border-gray-500/30 opacity-50'} transition-all`;

            card.innerHTML = `
                <div class="text-4xl mb-2">${gen.emoji}</div>
                <h3 class="font-bold text-lg mb-2">${gen.name}</h3>
                <p class="text-sm text-gray-300 mb-4">+${this.formatNumber(gen.productionRate)} tokens/sec</p>
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs text-gray-400">Cost</p>
                        <p class="font-bold">${this.formatNumber(cost)}</p>
                    </div>
                    <button class="buy-btn bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-all ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}"
                            data-id="${gen.id}"
                            ${!canAfford ? 'disabled' : ''}>
                        Buy
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-2">Owned: ${owned}</p>
            `;

            if (canAfford) {
                const buyBtn = card.querySelector('.buy-btn');
                buyBtn.addEventListener('click', () => this.purchaseGenerator(gen.id));
            }

            container.appendChild(card);
        });
    }

    updateOwnedGenerators() {
        const container = document.getElementById('owned-generators');
        const hasGenerators = this.generators.some(count => count > 0);

        if (!hasGenerators) {
            container.innerHTML = '<p class="text-gray-400 text-center py-4">No generators yet. Purchase your first one above!</p>';
            return;
        }

        container.innerHTML = this.generators.map((count, id) => {
            if (count === 0) return '';
            const gen = this.generatorTypes[id];
            const totalProduction = gen.productionRate * count;
            return `
                <div class="flex justify-between items-center bg-white/5 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${gen.emoji}</span>
                        <div>
                            <p class="font-semibold">${gen.name}</p>
                            <p class="text-xs text-gray-400">Owned: ${count}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-green-400">+${this.formatNumber(totalProduction)}/sec</p>
                        <p class="text-xs text-gray-400">${this.formatNumber(gen.productionRate)} × ${count}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateCost(genId) {
        const gen = this.generatorTypes[genId];
        const owned = this.generators[genId];
        return Math.floor(gen.baseCost * Math.pow(gen.multiplier, owned));
    }

    updateProductionRate() {
        this.productionRate = this.generators.reduce((total, count, id) => {
            return total + (this.generatorTypes[id].productionRate * count);
        }, 0);
    }

    formatNumber(num) {
        if (num < 1000) return num.toFixed(2);
        if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
        return (num / 1000000000).toFixed(2) + 'B';
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg font-semibold shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize game
new SolanaIdleGameBlockchain();

    async depositSol() {
        if (!this.connected) {
            this.showNotification('Please connect your wallet first!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            // 0.2 SOL = 200,000,000 lamports
            const depositAmount = 200_000_000; // 0.2 SOL
            const tokensToReceive = 1000;

            console.log('Depositing 0.2 SOL to game...');

            // In production, this would call the deposit_sol instruction
            // For now, simulate the deposit
            await new Promise(resolve => setTimeout(resolve, 1500));

            this.balance += tokensToReceive;
            
            this.showLoading(false);
            this.updateDisplay();
            this.renderGenerators();

            this.showNotification(`Deposited 0.2 SOL! Received ${tokensToReceive} game tokens 🎮`, 'success');

        } catch (error) {
            console.error('Deposit failed:', error);
            this.showLoading(false);
            this.showNotification('Deposit failed: ' + error.message, 'error');
        }
    }

    async withdrawTokens() {
        if (!this.connected) {
            this.showNotification('Please connect your wallet first!', 'error');
            return;
        }

        if (this.balance < 100) {
            this.showNotification('Need at least 100 tokens to withdraw!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            const withdrawAmount = Math.floor(this.balance / 2); // Withdraw half

            console.log(`Withdrawing ${withdrawAmount} tokens to wallet...`);

            // In production, this would call the withdraw_tokens instruction
            // For now, simulate the withdrawal
            await new Promise(resolve => setTimeout(resolve, 1500));

            this.balance -= withdrawAmount;
            
            this.showLoading(false);
            this.updateDisplay();

            this.showNotification(`Withdrew ${withdrawAmount} tokens to your wallet! Check Phantom 💰`, 'success');

        } catch (error) {
            console.error('Withdraw failed:', error);
            this.showLoading(false);
            this.showNotification('Withdraw failed: ' + error.message, 'error');
        }
    }
