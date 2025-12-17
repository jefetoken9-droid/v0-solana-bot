import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js"
import bs58 from "bs58"

const AIRDROP_AMOUNT = 5 * LAMPORTS_PER_SOL // 5 SOL

// Rate limiting store (in production, use Redis)
const airdropHistory = new Map<string, number>()
const COOLDOWN_TIME = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Check rate limiting
    const lastAirdrop = airdropHistory.get(walletAddress)
    if (lastAirdrop && Date.now() - lastAirdrop < COOLDOWN_TIME) {
      const timeLeft = Math.ceil((COOLDOWN_TIME - (Date.now() - lastAirdrop)) / (60 * 60 * 1000))
      return NextResponse.json({ error: `Airdrop cooldown active. Try again in ${timeLeft} hours` }, { status: 429 })
    }

    // Get bot private key from environment
    const botPrivateKey = process.env.BOT_PRIVATE_KEY
    if (!botPrivateKey) {
      console.error("BOT_PRIVATE_KEY not configured")
      return NextResponse.json({ error: "Airdrop service not configured" }, { status: 500 })
    }

    // Initialize connection and keypairs
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      "confirmed",
    )

    const botKeypair = Keypair.fromSecretKey(bs58.decode(botPrivateKey))
    const recipientPubkey = new PublicKey(walletAddress)

    // Check bot balance
    const botBalance = await connection.getBalance(botKeypair.publicKey)
    if (botBalance < AIRDROP_AMOUNT + 5000) {
      // Include transaction fee
      console.error("Bot wallet has insufficient funds")
      return NextResponse.json({ error: "Airdrop service temporarily unavailable" }, { status: 503 })
    }

    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: botKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: AIRDROP_AMOUNT,
      }),
    )

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = botKeypair.publicKey

    // Sign and send transaction
    transaction.sign(botKeypair)
    const signature = await connection.sendRawTransaction(transaction.serialize())

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    })

    // Update rate limiting
    airdropHistory.set(walletAddress, Date.now())

    console.log(`[AIRDROP] Sent 5 SOL to ${walletAddress}, tx: ${signature}`)

    return NextResponse.json({
      success: true,
      signature,
      amount: AIRDROP_AMOUNT / LAMPORTS_PER_SOL,
      explorerUrl: `https://solscan.io/tx/${signature}`,
    })
  } catch (error) {
    console.error("[AIRDROP ERROR]", error)
    return NextResponse.json(
      { error: "Failed to process airdrop", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
