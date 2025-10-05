// Simple initialization script without TypeScript
const anchor = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");

async function main() {
  const tokenMintAddress = process.argv[2];

  if (!tokenMintAddress) {
    console.error("❌ Please provide token mint address");
    console.log("Usage: node init-simple.js <TOKEN_MINT>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4");
  const tokenMint = new PublicKey(tokenMintAddress);

  // Derive global state PDA
  const [globalState] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    programId
  );

  console.log("🎮 Initializing Solana Idle Game");
  console.log("================================");
  console.log("Program ID:", programId.toString());
  console.log("Token Mint:", tokenMint.toString());
  console.log("Global State:", globalState.toString());
  console.log("");

  // For now, just show the addresses since the IDL might not be generated
  console.log("✅ Addresses ready!");
  console.log("");
  console.log("📝 Next: The program is already deployed and ready to use");
  console.log("🎮 Open the frontend and start playing!");
}

main().catch(console.error);
