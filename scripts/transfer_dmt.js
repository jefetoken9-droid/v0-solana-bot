#!/usr/bin/env node
/**
 * scripts/transfer_dmt.js
 * Transfiere una cantidad de tokens SPL (DMT) desde tu keypair a una cuenta objetivo (p.ej. cuenta del pool).
 * Uso (ejemplo):
 *   KEYPAIR=~/.config/solana/id.json RPC=https://api.mainnet-beta.solana.com node scripts/transfer_dmt.js \
 *     --mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV --recipient <RECIPIENT_TOKEN_ACCOUNT> --amount 15000000
 *
 * Nota: Este script solo realiza la transferencia SPL de tokens. Para crear/adicionar liquidez en un DEX (Raydium/Orca)
 * se requieren llamadas específicas al contrato del DEX; este script prepara la parte token y verifica balances.
 */

const fs = require('fs')
const path = require('path')
const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js')
const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token')
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
    .option('mint', { type: 'string', description: 'Mint address del token (DMT)', demandOption: true })
    .option('recipient', { type: 'string', description: 'Cuenta token destino (cuenta asociada del pool) - REQUIRED', demandOption: true })
    .option('amount', { type: 'number', description: 'Cantidad de tokens (en unidades enteras, según decimales del mint)', demandOption: true })
    .help().argv

  if (!argv.keypair) {
    console.error('ERROR: Debes establecer --keypair o la variable KEYPAIR.');
    process.exit(1)
  }

  const payer = await loadKeypair(argv.keypair)
  const connection = new Connection(argv.rpc, 'confirmed')

  const solBalance = await connection.getBalance(payer.publicKey)
  console.log('Wallet pubkey:', payer.publicKey.toBase58())
  console.log('SOL balance:', solBalance / 1e9, 'SOL')

  const mint = new PublicKey(argv.mint)
  const recipient = new PublicKey(argv.recipient)

  // Obtener la cuenta asociada del owner (payer) para el mint
  const payerAta = await getAssociatedTokenAddress(mint, payer.publicKey)
  try {
    const payerAtaInfo = await connection.getAccountInfo(payerAta)
    if (!payerAtaInfo) {
      console.error('No se encontró cuenta token asociada del payer para el mint:', payerAta.toBase58())
      console.error('Asegúrate de tener DMT en esa wallet o especifica la cuenta token con --owner-token-account')
      process.exit(1)
    }
  } catch (err) {}

  console.log('Payer ATA (assc):', payerAta.toBase58())
  console.log('Destino (recipient):', recipient.toBase58())

  const amount = BigInt(argv.amount)

  // Crear instrucción de transferencia
  const transferIx = createTransferInstruction(
    payerAta, // source
    recipient, // destination
    payer.publicKey, // owner
    amount,
    [],
    TOKEN_PROGRAM_ID
  )

  const { Transaction } = require('@solana/web3.js')
  const tx = new Transaction().add(transferIx)
  tx.feePayer = payer.publicKey
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signed = await payer.signTransaction(tx)

  const raw = tx.serialize()

  console.log('Enviando transacción...')
  const sig = await connection.sendRawTransaction(raw)
  console.log('Signature:', sig)
  console.log('Confirmando...')
  await connection.confirmTransaction(sig, 'confirmed')
  console.log('Transferencia enviada y confirmada.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
