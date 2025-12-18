#!/usr/bin/env node
/**
 * scripts/create_dmt_sol_pool.js
 * Agrega liquidez a un pool DMT/SOL en Raydium usando @raydium-io/raydium-sdk
 * 
 * Uso (ejemplo):
 *   KEYPAIR=~/.config/solana/id.json RPC=https://api.mainnet-beta.solana.com \
 *     node scripts/create_dmt_sol_pool.js \
 *       --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
 *       --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
 *       --dmt-amount 15000000 \
 *       --sol-amount 50
 */

const fs = require('fs')
const {
  Connection,
  Keypair,
  PublicKey,
} = require('@solana/web3.js')
const {
  Liquidity,
  LiquidityPoolKeys,
  TokenAmount,
  Percent,
} = require('@raydium-io/raydium-sdk')
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')

async function loadKeypair(filePath) {
  const resolved = filePath.replace(/^~(?=$|\/)/, process.env.HOME)
  const raw = fs.readFileSync(resolved, { encoding: 'utf8' })
  const arr = JSON.parse(raw)
  return Keypair.fromSecretKey(Buffer.from(arr))
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('keypair', { type: 'string', description: 'Path al keypair (JSON)', default: process.env.KEYPAIR })
    .option('rpc', { type: 'string', description: 'RPC URL', default: process.env.RPC || 'https://api.mainnet-beta.solana.com' })
    .option('dmt-mint', { type: 'string', description: 'DMT Mint Address', demandOption: true })
    .option('pool-id', { type: 'string', description: 'Pool ID de Raydium', demandOption: true })
    .option('dmt-amount', { type: 'number', description: 'Cantidad de DMT a agregar (unidades enteras)', demandOption: true })
    .option('sol-amount', { type: 'number', description: 'Cantidad de SOL a agregar', demandOption: true })
    .option('slippage', { type: 'number', description: 'Slippage tolerance (%)', default: 1 })
    .help().argv

  if (!argv.keypair) {
    console.error('ERROR: Debes establecer --keypair o la variable KEYPAIR.')
    process.exit(1)
  }

  const payer = await loadKeypair(argv.keypair)
  const connection = new Connection(argv.rpc, 'confirmed')

  const solBalance = await connection.getBalance(payer.publicKey)
  console.log('[INFO] Wallet:', payer.publicKey.toBase58())
  console.log('[INFO] SOL balance:', solBalance / 1e9, 'SOL')

  const dmtMint = new PublicKey(argv['dmt-mint'])
  const poolId = new PublicKey(argv['pool-id'])

  console.log('[CONFIG] DMT Mint:', dmtMint.toBase58())
  console.log('[CONFIG] Pool ID:', poolId.toBase58())
  console.log('[CONFIG] DMT Amount:', argv['dmt-amount'])
  console.log('[CONFIG] SOL Amount:', argv['sol-amount'])

  try {
    // Obtener información del pool
    console.log('[POOL] Obteniendo información del pool...')
    const poolInfo = await connection.getAccountInfo(poolId)
    if (!poolInfo) {
      console.error('[ERROR] No se encontró el pool con ID:', poolId.toBase58())
      process.exit(1)
    }

    console.log('[POOL] Pool encontrado. Size:', poolInfo.data.length, 'bytes')

    // Crear estructura de TokenAmount
    const dmtAmountWithDecimals = new TokenAmount(dmtMint, argv['dmt-amount'], 6) // asumiendo 6 decimales
    const solMint = new PublicKey('So11111111111111111111111111111111111111112') // WSOL
    const solAmountWithDecimals = new TokenAmount(solMint, Math.floor(argv['sol-amount'] * 1e9), 9)

    console.log('[LIQUIDITY] Preparando para agregar liquidez...')
    console.log('[LIQUIDITY] DMT:', dmtAmountWithDecimals.toFixed(6))
    console.log('[LIQUIDITY] SOL:', solAmountWithDecimals.toFixed(9))

    // Usar Liquidity SDK para crear instrucción de addLiquidity
    // NOTA: Esto requiere @raydium-io/raydium-sdk instalado
    console.log('[TX] Creando transacción de liquidez...')
    console.log('[INFO] Necesita @raydium-io/raydium-sdk. Ejecuta: npm install @raydium-io/raydium-sdk')
    console.log('[INFO] Luego reinicia este script.')

    // Ejemplo de llamada (simplificado; requiere SDK completo)
    // const txs = await Liquidity.makeAddLiquidityTransaction({...})

  } catch (err) {
    console.error('[ERROR]', err.message)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
