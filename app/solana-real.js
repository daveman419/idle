// Solana Idle Game - REAL Blockchain Integration
// Program ID: 5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4 (Devnet)

const PROGRAM_ID = new solanaWeb3.PublicKey('5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4');
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new solanaWeb3.Connection(DEVNET_RPC, 'confirmed');

// PDA Seeds
const GLOBAL_STATE_SEED = 'global_state';
const PLAYER_SEED = 'player';
const VAULT_SEED = 'vault';

class SolanaIdleGameReal {
    constructor() {
        this.wallet = null;
        this.connected = false;
        this.walletAddress = null;

        // Game state
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
        document.getElementById('disconnect-wallet')?.addEventListener('click', () => this.disconnectWallet());
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
            console.log('✅ Phantom wallet detected!');
        } else {
            console.log('❌ Phantom wallet not found');
        }
    }

    async connectWallet() {
        try {
            if (!window.solana || !window.solana.isPhantom) {
                this.showNotification('Please install Phantom wallet!', 'error');
                window.open('https://phantom.app/', '_blank');
                return;
            }

            this.showLoading(true);

            const response = await window.solana.connect();
            this.wallet = window.solana;
            this.walletAddress = response.publicKey;
            this.connected = true;

            console.log('✅ Connected:', this.walletAddress.toString());

            // Fetch player data from blockchain
            await this.fetchPlayerData();

            this.showLoading(false);
            this.showGame();
            this.showNotification('Wallet connected! 🎮', 'success');

        } catch (error) {
            console.error('Connection failed:', error);
            this.showLoading(false);
            this.showNotification('Failed to connect: ' + error.message, 'error');
        }
    }

    async disconnectWallet() {
        try {
            if (this.wallet) {
                await this.wallet.disconnect();
            }

            this.wallet = null;
            this.connected = false;
            this.walletAddress = null;
            this.balance = 0;
            this.generators = [0, 0, 0, 0, 0];
            this.productionRate = 0;
            this.pendingRewards = 0;

            // Reset UI
            document.getElementById('wallet-info').classList.add('hidden');
            document.getElementById('connect-wallet').classList.remove('hidden');
            document.getElementById('game-container').classList.add('hidden');
            document.getElementById('not-connected').classList.remove('hidden');

            this.showNotification('Wallet disconnected', 'success');
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    }

    async fetchPlayerData() {
        try {
            // Derive player PDA
            const [playerPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(PLAYER_SEED), this.walletAddress.toBuffer()],
                PROGRAM_ID
            );

            console.log('Player PDA:', playerPDA.toString());

            // Fetch account data
            const playerAccount = await connection.getAccountInfo(playerPDA);

            if (playerAccount) {
                // Deserialize player data
                console.log('✅ Player account exists');
                // TODO: Properly deserialize the account data
                // For now, use defaults
                this.balance = 0;
                this.generators = [0, 0, 0, 0, 0];
            } else {
                console.log('ℹ️  Player account not found - will initialize on first transaction');
                this.balance = 0;
            }

            this.lastClaimTime = Date.now();

        } catch (error) {
            console.error('Error fetching player data:', error);
            this.balance = 0;
        }
    }

    async depositSol() {
        if (!this.connected) {
            this.showNotification('Connect wallet first!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            const depositAmount = 0.2 * solanaWeb3.LAMPORTS_PER_SOL; // 0.2 SOL

            // Derive PDAs
            const [globalStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(GLOBAL_STATE_SEED)],
                PROGRAM_ID
            );

            const [playerPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(PLAYER_SEED), this.walletAddress.toBuffer()],
                PROGRAM_ID
            );

            const [vaultPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(VAULT_SEED)],
                PROGRAM_ID
            );

            // Check if player account exists
            const playerAccount = await connection.getAccountInfo(playerPDA);

            let tx;

            if (!playerAccount) {
                // Need to initialize player first
                console.log('Initializing player account...');

                const initPlayerIx = new solanaWeb3.TransactionInstruction({
                    programId: PROGRAM_ID,
                    keys: [
                        { pubkey: globalStatePDA, isSigner: false, isWritable: true },
                        { pubkey: playerPDA, isSigner: false, isWritable: true },
                        { pubkey: this.walletAddress, isSigner: true, isWritable: true },
                        { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                    ],
                    data: Buffer.from([1]) // initialize_player instruction discriminator
                });

                tx = new solanaWeb3.Transaction().add(initPlayerIx);
            }

            // Create deposit instruction
            const depositData = Buffer.alloc(9);
            depositData.writeUInt8(4, 0); // deposit_sol discriminator
            depositData.writeBigUInt64LE(BigInt(depositAmount), 1);

            const depositIx = new solanaWeb3.TransactionInstruction({
                programId: PROGRAM_ID,
                keys: [
                    { pubkey: globalStatePDA, isSigner: false, isWritable: false },
                    { pubkey: playerPDA, isSigner: false, isWritable: true },
                    { pubkey: vaultPDA, isSigner: false, isWritable: true },
                    { pubkey: this.walletAddress, isSigner: true, isWritable: true },
                    { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                ],
                data: depositData
            });

            if (tx) {
                tx.add(depositIx);
            } else {
                tx = new solanaWeb3.Transaction().add(depositIx);
            }

            tx.feePayer = this.walletAddress;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            // Sign and send
            const signed = await this.wallet.signTransaction(tx);
            const txid = await connection.sendRawTransaction(signed.serialize());

            console.log('Transaction sent:', txid);

            // Wait for confirmation
            await connection.confirmTransaction(txid, 'confirmed');

            console.log('✅ Deposit confirmed!');

            // Update balance
            this.balance += 1000;

            this.showLoading(false);
            this.updateDisplay();
            this.renderGenerators();

            this.showNotification(`✅ Deposited 0.2 SOL! Received 1000 tokens`, 'success');

        } catch (error) {
            console.error('Deposit failed:', error);
            this.showLoading(false);
            this.showNotification('❌ Deposit failed: ' + error.message, 'error');
        }
    }

    async withdrawTokens() {
        if (!this.connected) {
            this.showNotification('Connect wallet first!', 'error');
            return;
        }

        if (this.balance < 100) {
            this.showNotification('Need at least 100 tokens!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            const withdrawAmount = Math.floor(this.balance / 2);

            const [globalStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(GLOBAL_STATE_SEED)],
                PROGRAM_ID
            );

            const [playerPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(PLAYER_SEED), this.walletAddress.toBuffer()],
                PROGRAM_ID
            );

            // Create withdraw instruction
            const withdrawData = Buffer.alloc(9);
            withdrawData.writeUInt8(5, 0); // withdraw_tokens discriminator
            withdrawData.writeBigUInt64LE(BigInt(withdrawAmount), 1);

            const withdrawIx = new solanaWeb3.TransactionInstruction({
                programId: PROGRAM_ID,
                keys: [
                    { pubkey: globalStatePDA, isSigner: false, isWritable: false },
                    { pubkey: playerPDA, isSigner: false, isWritable: true },
                    { pubkey: this.walletAddress, isSigner: true, isWritable: false },
                ],
                data: withdrawData
            });

            const tx = new solanaWeb3.Transaction().add(withdrawIx);
            tx.feePayer = this.walletAddress;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            const signed = await this.wallet.signTransaction(tx);
            const txid = await connection.sendRawTransaction(signed.serialize());

            await connection.confirmTransaction(txid, 'confirmed');

            console.log('✅ Withdraw confirmed!');

            this.balance -= withdrawAmount;

            this.showLoading(false);
            this.updateDisplay();

            this.showNotification(`✅ Withdrew ${withdrawAmount} tokens to wallet!`, 'success');

        } catch (error) {
            console.error('Withdraw failed:', error);
            this.showLoading(false);
            this.showNotification('❌ Withdraw failed: ' + error.message, 'error');
        }
    }

    async claimRewards() {
        if (!this.connected) {
            this.showNotification('Connect wallet first!', 'error');
            return;
        }

        if (this.pendingRewards < 0.01) {
            this.showNotification('No rewards to claim!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            const [globalStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(GLOBAL_STATE_SEED)],
                PROGRAM_ID
            );

            const [playerPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(PLAYER_SEED), this.walletAddress.toBuffer()],
                PROGRAM_ID
            );

            const claimIx = new solanaWeb3.TransactionInstruction({
                programId: PROGRAM_ID,
                keys: [
                    { pubkey: globalStatePDA, isSigner: false, isWritable: true },
                    { pubkey: playerPDA, isSigner: false, isWritable: true },
                    { pubkey: this.walletAddress, isSigner: true, isWritable: false },
                ],
                data: Buffer.from([3]) // claim_rewards discriminator
            });

            const tx = new solanaWeb3.Transaction().add(claimIx);
            tx.feePayer = this.walletAddress;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            const signed = await this.wallet.signTransaction(tx);
            const txid = await connection.sendRawTransaction(signed.serialize());

            await connection.confirmTransaction(txid, 'confirmed');

            this.balance += this.pendingRewards;
            this.totalEarned += this.pendingRewards;
            this.lastClaimTime = Date.now();
            this.pendingRewards = 0;

            this.showLoading(false);
            this.updateDisplay();
            this.renderGenerators();

            this.showNotification('✅ Rewards claimed!', 'success');

        } catch (error) {
            console.error('Claim failed:', error);
            this.showLoading(false);
            this.showNotification('❌ Claim failed: ' + error.message, 'error');
        }
    }

    async purchaseGenerator(genId) {
        if (!this.connected) {
            this.showNotification('Connect wallet first!', 'error');
            return;
        }

        const cost = this.calculateCost(genId);
        if (this.balance < cost) {
            this.showNotification('Insufficient balance!', 'error');
            return;
        }

        try {
            this.showLoading(true);

            const [globalStatePDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(GLOBAL_STATE_SEED)],
                PROGRAM_ID
            );

            const [playerPDA] = await solanaWeb3.PublicKey.findProgramAddress(
                [Buffer.from(PLAYER_SEED), this.walletAddress.toBuffer()],
                PROGRAM_ID
            );

            const purchaseData = Buffer.alloc(2);
            purchaseData.writeUInt8(2, 0); // purchase_generator discriminator
            purchaseData.writeUInt8(genId, 1);

            const purchaseIx = new solanaWeb3.TransactionInstruction({
                programId: PROGRAM_ID,
                keys: [
                    { pubkey: globalStatePDA, isSigner: false, isWritable: false },
                    { pubkey: playerPDA, isSigner: false, isWritable: true },
                    { pubkey: this.walletAddress, isSigner: true, isWritable: false },
                ],
                data: purchaseData
            });

            const tx = new solanaWeb3.Transaction().add(purchaseIx);
            tx.feePayer = this.walletAddress;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            const signed = await this.wallet.signTransaction(tx);
            const txid = await connection.sendRawTransaction(signed.serialize());

            await connection.confirmTransaction(txid, 'confirmed');

            this.balance -= cost;
            this.generators[genId]++;
            this.updateProductionRate();

            this.showLoading(false);
            this.renderGenerators();
            this.updateDisplay();

            const gen = this.generatorTypes[genId];
            this.showNotification(`✅ Purchased ${gen.name}! ${gen.emoji}`, 'success');

        } catch (error) {
            console.error('Purchase failed:', error);
            this.showLoading(false);
            this.showNotification('❌ Purchase failed: ' + error.message, 'error');
        }
    }

    showGame() {
        document.getElementById('not-connected').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('connect-wallet').classList.add('hidden');
        document.getElementById('wallet-info').classList.remove('hidden');
        document.getElementById('wallet-address').textContent =
            this.walletAddress.toString().slice(0, 4) + '...' + this.walletAddress.toString().slice(-4);

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
            container.innerHTML = '<p class="text-gray-400 text-center py-4">No generators yet. Deposit SOL and purchase your first one!</p>';
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

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SolanaIdleGameReal());
} else {
    new SolanaIdleGameReal();
}
