# Solana Idle Game - Windows Setup Script
# Run this in PowerShell as Administrator

Write-Host "🚀 Solana Idle Game - Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Please run this script as Administrator!" -ForegroundColor Red
    exit 1
}

# Function to check if command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check Rust installation
Write-Host "📦 Checking Rust installation..." -ForegroundColor Yellow
if (Test-Command rustc) {
    $rustVersion = rustc --version
    Write-Host "✅ Rust is installed: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Rust not found. Installing..." -ForegroundColor Red
    Write-Host "Downloading Rust installer..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
    Write-Host "Running Rust installer..." -ForegroundColor Yellow
    & "$env:TEMP\rustup-init.exe" -y
    $env:Path += ";$env:USERPROFILE\.cargo\bin"
    Write-Host "✅ Rust installed successfully!" -ForegroundColor Green
}

# Check Solana CLI installation
Write-Host ""
Write-Host "📦 Checking Solana CLI installation..." -ForegroundColor Yellow
if (Test-Command solana) {
    $solanaVersion = solana --version
    Write-Host "✅ Solana CLI is installed: $solanaVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Solana CLI not found." -ForegroundColor Red
    Write-Host "Please install manually from: https://docs.solana.com/cli/install-solana-cli-tools" -ForegroundColor Yellow
    Write-Host "Or download: https://github.com/solana-labs/solana/releases" -ForegroundColor Yellow
}

# Check Anchor installation
Write-Host ""
Write-Host "📦 Checking Anchor installation..." -ForegroundColor Yellow
if (Test-Command anchor) {
    $anchorVersion = anchor --version
    Write-Host "✅ Anchor is installed: $anchorVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Anchor not found. Installing via cargo..." -ForegroundColor Red
    Write-Host "This may take several minutes..." -ForegroundColor Yellow
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
    Write-Host "✅ Anchor installed successfully!" -ForegroundColor Green
}

# Check Node.js installation
Write-Host ""
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found." -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor Yellow
}

# Install NPM dependencies
Write-Host ""
Write-Host "📦 Installing NPM dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ NPM dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  package.json not found in current directory" -ForegroundColor Yellow
}

# Setup Solana config
Write-Host ""
Write-Host "⚙️  Configuring Solana..." -ForegroundColor Yellow
if (Test-Command solana) {
    # Create config directory if it doesn't exist
    $solanaConfigDir = "$env:USERPROFILE\.config\solana"
    if (-not (Test-Path $solanaConfigDir)) {
        New-Item -ItemType Directory -Path $solanaConfigDir -Force | Out-Null
    }

    # Set to devnet
    solana config set --url https://api.devnet.solana.com
    Write-Host "✅ Solana configured for devnet" -ForegroundColor Green

    # Check if keypair exists
    $keypairPath = "$solanaConfigDir\id.json"
    if (-not (Test-Path $keypairPath)) {
        Write-Host ""
        Write-Host "🔑 No keypair found. Generating new keypair..." -ForegroundColor Yellow
        Write-Host "⚠️  SAVE YOUR SEED PHRASE SECURELY!" -ForegroundColor Red
        solana-keygen new --outfile $keypairPath
        Write-Host "✅ Keypair generated at: $keypairPath" -ForegroundColor Green
    } else {
        Write-Host "✅ Keypair already exists at: $keypairPath" -ForegroundColor Green
    }

    # Show address and balance
    Write-Host ""
    Write-Host "📍 Your Solana address:" -ForegroundColor Cyan
    solana address
    Write-Host ""
    Write-Host "💰 Your balance:" -ForegroundColor Cyan
    solana balance
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Request devnet airdrop: solana airdrop 2" -ForegroundColor White
Write-Host "2. Build the program: anchor build" -ForegroundColor White
Write-Host "3. Deploy to devnet: anchor deploy" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
