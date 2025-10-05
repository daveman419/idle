import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IdleGame } from "../target/types/idle_game";

async function main() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.IdleGame as Program<IdleGame>;

  // Get token mint from command line or use default
  const tokenMintAddress = process.argv[2];

  if (!tokenMintAddress) {
    console.error("❌ Please provide token mint address as argument");
    console.log("Usage: ts-node initialize-game.ts <TOKEN_MINT_ADDRESS>");
    process.exit(1);
  }

  const tokenMint = new PublicKey(tokenMintAddress);

  // Derive global state PDA
  const [globalState] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  console.log("🎮 Initializing Solana Idle Game");
  console.log("================================");
  console.log("Program ID:", program.programId.toString());
  console.log("Token Mint:", tokenMint.toString());
  console.log("Global State:", globalState.toString());
  console.log("Authority:", provider.wallet.publicKey.toString());
  console.log("");

  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        globalState: globalState,
        tokenMint: tokenMint,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✅ Game initialized successfully!");
    console.log("Transaction:", tx);
    console.log("");
    console.log("🔗 View on Explorer:");
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log("");
    console.log("🎮 Game is ready to play!");
    console.log("");
  } catch (error) {
    console.error("❌ Initialization failed:", error);

    if (error.toString().includes("already in use")) {
      console.log("ℹ️  Game already initialized!");
      console.log("Global State:", globalState.toString());
    }
  }
}

main();
