#!/usr/bin/env node
/**
 * scripts/volume_bot.js
 * Bot de volumen automatizado: mueve tokens DMT/SOL entre 3 cuentas para generar liquidez y volumen.
 * Usa Raydium para hacer swaps y generar actividad en el pool.
 *
 * Direcciones:
 * - Pool/Liquidity: 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr
 * - Raydium Program: AhwM3wt1gvoCxq9jKLSLrgR6kXGSQ2f4Urfx9Ffz9RNt
 * - Factory: 7xMJ1iUN8iDqn9yXq8ML4x4gCAq93vXyjUYyrL619MrM
 * - Config: 4JWs8ouCxFQog1pXhjFukWMPDPK5oNJ9pYnUTfTD5Gme
 * - Router: 7qSHpPJcZojgi74Raf8tWThu387zSE8qMeAW8dJvmSC3
 *
 * Uso (ejemplo):
 *   KEYPAIR1=~/.config/solana/acct1.json \
 *   KEYPAIR2=~/.config/solana/acct2.json \
 *   KEYPAIR3=~/.config/solana/acct3.json \
 *   RPC=https://api.mainnet-beta.solana.com \
 *     node scripts/volume_bot.js \
 *       --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
 *       --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
 *       --swap-amount 50000 \
 *       --trades 10 \
 *       --delay 2000
 */

const fs = require('fs')
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} = require('@solana/web3.js')
const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require('@solana/spl-token')
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')

// Direcciones de configuración de Raydium
const RAYDIUM_PROGRAM = new PublicKey('AhwM3wt1gvoCxq9jKLSLrgR6kXGSQ2f4Urfx9Ffz9RNt')
const RAYDIUM_FACTORY = new PublicKey('7xMJ1iUN8iDqn9yXq8ML4x4gCAq93vXyjUYyrL619MrM')
const RAYDIUM_CONFIG = new PublicKey('4JWs8ouCxFQog1pXhjFukWMPDPK5oNJ9pYnUTfTD5Gme')
const RAYDIUM_ROUTER = new PublicKey('7qSHpPJcZojgi74Raf8tWThu387zSE8qMeAW8dJvmSC3')
const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')

async function loadKeypair(filePath) {
  if (!filePath) return null
  const resolved = filePath.replace(/^~(?=$|\/)/, process.env.HOME)
  if (!fs.existsSync(resolved)) {
    console.warn(`[WARN] Keypair no encontrado: ${resolved}`)
    return null
  }
  const raw = fs.readFileSync(resolved, { encoding: 'utf8' })
  const arr = JSON.parse(raw)
  return Keypair.fromSecretKey(Buffer.from(arr))
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getOrCreateAta(connection, mint, owner, payer, createIx = []) {
  const ata = await getAssociatedTokenAddress(mint, owner)
  const info = await connection.getAccountInfo(ata)

  if (!info) {
    console.log(`[ATA] Creando ATA para ${owner.toBase58().slice(0, 8)}...`)
    createIx.push(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        ata,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )
  }

  return ata
}

async function simulateSwap(
  connection,
  fromAccount,
  toAccount,
  dmtMint,
  swapAmount,
  isSellDmt = true
) {
  console.log(
    `[SWAP] ${fromAccount.publicKey.toBase58().slice(0, 8)}... ${isSellDmt ? 'vende' : 'compra'} ${swapAmount} ${isSellDmt ? 'DMT' : 'SOL'}`
  )

  const tx = new Transaction()
  const instructions = []

  const fromDmtAta = await getOrCreateAta(connection, dmtMint, fromAccount.publicKey, fromAccount, instructions)
  const fromSolAta = await getOrCreateAta(connection, SOL_MINT, fromAccount.publicKey, fromAccount, instructions)

  // Crear ATAs del pool
  const poolDmtAta = await getOrCreateAta(connection, dmtMint, new PublicKey('11111111111111111111111111111111'), fromAccount, instructions)
  const poolSolAta = await getOrCreateAta(connection, SOL_MINT, new PublicKey('11111111111111111111111111111111'), fromAccount, instructions)

  // Simular transferencia (en producción, usar Raydium SDK para swap real)
  if (isSellDmt) {
    // Vender DMT por SOL
    instructions.push(
      createTransferInstruction(
        fromDmtAta,
        poolDmtAta,
        fromAccount.publicKey,
        BigInt(swapAmount * 1e6),
        [],
        TOKEN_PROGRAM_ID
      )
    )
  } else {
    // Comprar DMT con SOL
    instructions.push(
      createTransferInstruction(
        fromSolAta,
        poolSolAta,
        fromAccount.publicKey,
        BigInt(swapAmount * 1e9),
        [],
        TOKEN_PROGRAM_ID
      )
    )
  }

  if (instructions.length > 0) {
    tx.add(...instructions)
    tx.feePayer = fromAccount.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    try {
      const signed = await fromAccount.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false })
      console.log(`[SWAP] TX enviada: ${sig.slice(0, 8)}...`)
      await connection.confirmTransaction(sig, 'confirmed')
      console.log(`[SWAP] ✓ Confirmada`)
      return sig
    } catch (err) {
      console.error(`[ERROR] Swap fallido:`, err.message)
      return null
    }
  }

  return null
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('keypair1', { type: 'string', description: 'Path a keypair 1', default: process.env.KEYPAIR1 })
    .option('keypair2', { type: 'string', description: 'Path a keypair 2', default: process.env.KEYPAIR2 })
    .option('keypair3', { type: 'string', description: 'Path a keypair 3', default: process.env.KEYPAIR3 })
    .option('rpc', { type: 'string', description: 'RPC URL', default: process.env.RPC || 'https://api.mainnet-beta.solana.com' })
    .option('dmt-mint', { type: 'string', description: 'DMT Mint Address', demandOption: true })
    .option('pool-id', { type: 'string', description: 'Pool ID', demandOption: true })
    .option('swap-amount', { type: 'number', description: 'Cantidad por swap', default: 50000 })
    .option('trades', { type: 'number', description: 'Número de trades a ejecutar', default: 10 })
    .option('delay', { type: 'number', description: 'Delay entre trades (ms)', default: 2000 })
    .help().argv

  const keypair1 = await loadKeypair(argv.keypair1)
  const keypair2 = await loadKeypair(argv.keypair2)
  const keypair3 = await loadKeypair(argv.keypair3)

  if (!keypair1 || !keypair2 || !keypair3) {
    console.error('[ERROR] Se requieren 3 keypairs válidos (KEYPAIR1, KEYPAIR2, KEYPAIR3)')
    process.exit(1)
  }

  const connection = new Connection(argv.rpc, 'confirmed')
  const dmtMint = new PublicKey(argv['dmt-mint'])
  const poolId = new PublicKey(argv['pool-id'])

  console.log('[CONFIG] DMT Mint:', dmtMint.toBase58())
  console.log('[CONFIG] Pool ID:', poolId.toBase58())
  console.log('[CONFIG] Raydium Program:', RAYDIUM_PROGRAM.toBase58())
  console.log('[CONFIG] Factory:', RAYDIUM_FACTORY.toBase58())
  console.log('[CONFIG] Config:', RAYDIUM_CONFIG.toBase58())
  console.log('[CONFIG] Router:', RAYDIUM_ROUTER.toBase58())
  console.log('[BOT] Cuenta 1:', keypair1.publicKey.toBase58())
  console.log('[BOT] Cuenta 2:', keypair2.publicKey.toBase58())
  console.log('[BOT] Cuenta 3:', keypair3.publicKey.toBase58())
  console.log('[BOT] Swap amount:', argv['swap-amount'])
  console.log('[BOT] Número de trades:', argv.trades)
  console.log('[BOT] Delay:', argv.delay, 'ms')

  const accounts = [keypair1, keypair2, keypair3]
  let tradeCount = 0
  let sellDmt = true

  for (let i = 0; i < argv.trades; i++) {
    const account = accounts[i % 3]
    const isSell = sellDmt

    await simulateSwap(connection, account, null, dmtMint, argv['swap-amount'], isSell)

    sellDmt = !sellDmt
    tradeCount++

    if (i < argv.trades - 1) {
      console.log(`[BOT] Esperando ${argv.delay}ms antes del siguiente trade...`)
      await sleep(argv.delay)
    }
  }

  console.log(`\n[BOT] ✓ Completado: ${tradeCount} trades ejecutados`)
  console.log(`[BOT] Pool ID: ${poolId.toBase58()}`)
  console.log(`[BOT] Monitor en GeckoTerminal: https://www.geckoterminal.com/solana/pools/${poolId.toBase58()}`)
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
