// Solana Idle Game - Frontend Logic
// Program ID: 5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4 (Devnet)
// This is a simplified version that simulates blockchain interaction
// For production, you'd use @solana/web3.js and @project-serum/anchor

const PROGRAM_ID = '5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4';

class SolanaIdleGame {
    constructor() {
        this.connected = false;
        this.walletAddress = null;
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

        // Check if already connected (from localStorage)
        const savedState = localStorage.getItem('solana-idle-game');
        if (savedState) {
            this.loadState(JSON.parse(savedState));
            this.showGame();
        }

        // Update loop
        setInterval(() => this.updateGame(), 100);
    }

    async connectWallet() {
        this.showLoading(true);

        // Simulate wallet connection
        // In production, use: window.solana.connect()
        setTimeout(() => {
            this.walletAddress = this.generateWalletAddress();
            this.connected = true;
            this.lastClaimTime = Date.now();

            // Give starter tokens
            this.balance = 50;

            this.showLoading(false);
            this.showGame();
            this.saveState();
            this.showNotification('Wallet connected successfully!', 'success');
        }, 1500);
    }

    showGame() {
        document.getElementById('not-connected').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('connect-wallet').classList.add('hidden');
        document.getElementById('wallet-info').classList.remove('hidden');
        document.getElementById('wallet-address').textContent = this.walletAddress;

        this.renderGenerators();
        this.updateDisplay();
    }

    updateGame() {
        if (!this.connected) return;

        // Calculate pending rewards
        const now = Date.now();
        const timeDiff = (now - this.lastClaimTime) / 1000; // seconds
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

    async purchaseGenerator(genId) {
        const cost = this.calculateCost(genId);

        if (this.balance < cost) {
            this.showNotification('Insufficient balance!', 'error');
            return;
        }

        this.showLoading(true);

        // Simulate blockchain transaction
        setTimeout(() => {
            this.balance -= cost;
            this.generators[genId]++;
            this.updateProductionRate();

            this.showLoading(false);
            this.renderGenerators();
            this.updateDisplay();
            this.saveState();

            const gen = this.generatorTypes[genId];
            this.showNotification(`Purchased ${gen.name}! ${gen.emoji}`, 'success');
        }, 1000);
    }

    async claimRewards() {
        if (this.pendingRewards < 0.01) {
            this.showNotification('No rewards to claim yet!', 'error');
            return;
        }

        this.showLoading(true);

        // Simulate blockchain transaction
        setTimeout(() => {
            this.balance += this.pendingRewards;
            this.totalEarned += this.pendingRewards;
            this.lastClaimTime = Date.now();
            this.pendingRewards = 0;

            this.showLoading(false);
            this.updateDisplay();
            this.renderGenerators(); // Update affordability
            this.saveState();

            this.showNotification('Rewards claimed! 💰', 'success');
        }, 1000);
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

    generateWalletAddress() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
        let address = '';
        for (let i = 0; i < 44; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
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

    saveState() {
        const state = {
            walletAddress: this.walletAddress,
            balance: this.balance,
            generators: this.generators,
            lastClaimTime: this.lastClaimTime,
            totalEarned: this.totalEarned,
            productionRate: this.productionRate
        };
        localStorage.setItem('solana-idle-game', JSON.stringify(state));
    }

    loadState(state) {
        this.walletAddress = state.walletAddress;
        this.balance = state.balance || 0;
        this.generators = state.generators || [0, 0, 0, 0, 0];
        this.lastClaimTime = state.lastClaimTime || Date.now();
        this.totalEarned = state.totalEarned || 0;
        this.productionRate = state.productionRate || 0;
        this.connected = true;
    }
}

// Initialize game
new SolanaIdleGame();
