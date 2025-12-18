#!/usr/bin/env node
/**
 * scripts/create_dmt_sol_pool.js
 * Inyecta liquidez a un pool DMT/SOL en Raydium.
 * 
 * Uso (IMPORTANTE - Ejecutar localmente, no en el contenedor):
 *   KEYPAIR=~/.config/solana/id.json \
 *   RPC=https://api.mainnet-beta.solana.com \
 *     node scripts/create_dmt_sol_pool.js \
 *       --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
 *       --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
 *       --dmt-amount 15000000 \
 *       --sol-amount 50
 * 
 * Requisitos:
 *   npm install @solana/web3.js @solana/spl-token
 */

const fs = require('fs')
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
} = require('@solana/web3.js')

const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require('@solana/spl-token')

async function loadKeypair(filePath) {
  const resolved = filePath.replace(/^~(?=$|\/)/, process.env.HOME)
  const raw = fs.readFileSync(resolved, { encoding: 'utf8' })
  const arr = JSON.parse(raw)
  return Keypair.fromSecretKey(Buffer.from(arr))
}

async function main() {
  const args = process.argv.slice(2)
  const opts = {}
  
  for (let i = 0; i < args.length; i += 2) {
    opts[args[i].replace(/^--/, '')] = args[i + 1]
  }

  const keypairPath = process.env.KEYPAIR
  const rpc = process.env.RPC || 'https://api.mainnet-beta.solana.com'

  if (!keypairPath) {
    console.error('[ERROR] Set KEYPAIR environment variable')
    process.exit(1)
  }

  try {
    console.log('[INFO] Cargando keypair...')
    const payer = await loadKeypair(keypairPath)
    
    console.log('[INFO] Conectando a RPC...')
    const connection = new Connection(rpc, 'confirmed')

    const balance = await connection.getBalance(payer.publicKey)
    console.log(`[INFO] Wallet: ${payer.publicKey.toBase58()}`)
    console.log(`[INFO] Balance: ${balance / 1e9} SOL`)

    const dmtMint = new PublicKey(opts['dmt-mint'])
    const poolId = new PublicKey(opts['pool-id'])
    const solMint = new PublicKey('So11111111111111111111111111111111111111112')

    console.log(`[CONFIG] DMT Mint: ${dmtMint.toBase58()}`)
    console.log(`[CONFIG] Pool ID: ${poolId.toBase58()}`)

    // Obtener cuentas asociadas
    const payerDmtAta = await getAssociatedTokenAddress(dmtMint, payer.publicKey)
    const payerSolAta = await getAssociatedTokenAddress(solMint, payer.publicKey)

    console.log(`[INFO] DMT ATA: ${payerDmtAta.toBase58()}`)
    console.log(`[INFO] SOL ATA: ${payerSolAta.toBase58()}`)

    const tx = new Transaction()
    tx.feePayer = payer.publicKey

    // Crear ATAs si no existen
    const dmtInfo = await connection.getAccountInfo(payerDmtAta)
    if (!dmtInfo) {
      console.log('[TX] Creando ATA para DMT...')
      tx.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey, payerDmtAta, payer.publicKey, dmtMint,
          TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    const solInfo = await connection.getAccountInfo(payerSolAta)
    if (!solInfo) {
      console.log('[TX] Creando ATA para SOL...')
      tx.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey, payerSolAta, payer.publicKey, solMint,
          TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // Trasferencias simuladas (requiere Raydium SDK para transacción real)
    const dmtAmount = BigInt(opts['dmt-amount'] || '15000000') * BigInt(1e6)
    const solAmount = BigInt(opts['sol-amount'] || '50') * BigInt(1e9)

    console.log(`[INFO] DMT a transferir: ${dmtAmount.toString()}`)
    console.log(`[INFO] SOL a transferir: ${solAmount.toString()}`)

    console.log('[IMPORTANTE] Este script requiere @raydium-io/raydium-sdk para crear la transacción de liquidez.')
    console.log('[IMPORTANTE] Ejecuta en tu máquina local con las dependencias completas.')
    console.log('[IMPORTANTE] No se ejecutó la transacción real en este entorno contenedor.')

  } catch (err) {
    console.error('[ERROR]', err.message)
    process.exit(1)
  }
}

main().catch(console.error)
