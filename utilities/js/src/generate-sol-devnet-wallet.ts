import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

// Generate a new random keypair
const keypair = Keypair.generate();

// Get the private key as bytes array
const privateKey = keypair.secretKey;

// Get the public key (address)
const publicKey = keypair.publicKey.toString();

console.log("private key:", Buffer.from(privateKey).toString("hex"));
console.log("public key:", publicKey);

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Request airdrop of 1 SOL to the new keypair
console.log("Requesting airdrop of 1 SOL...");
(async () => {
  try {
    const airdropSignature = await connection.requestAirdrop(
      keypair.publicKey,
      1 * LAMPORTS_PER_SOL,
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    // Get the updated balance
    const balance = await connection.getBalance(keypair.publicKey);

    console.log(
      `Airdrop successful! New balance: ${balance / LAMPORTS_PER_SOL} SOL`,
    );
  } catch (error) {
    console.error("Airdrop failed:", error);
  }
})();
