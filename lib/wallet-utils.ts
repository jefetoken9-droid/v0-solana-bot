import { type Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Check if wallet has sufficient balance for transaction
export async function checkBalance(
  connection: Connection,
  walletAddress: PublicKey,
  requiredAmount: number,
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  try {
    const balance = await connection.getBalance(walletAddress)
    const balanceInSol = balance / LAMPORTS_PER_SOL

    return {
      sufficient: balanceInSol >= requiredAmount,
      balance: balanceInSol,
      required: requiredAmount,
    }
  } catch (error) {
    console.error("[v0] Error checking balance:", error)
    throw error
  }
}

// Format wallet address for display (shortened)
export function formatWalletAddress(address: string, length = 4): string {
  if (!address) return ""
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

// Format SOL amount with proper decimals
export function formatSolAmount(lamports: number, decimals = 4): string {
  const sol = lamports / LAMPORTS_PER_SOL
  return sol.toFixed(decimals)
}

// Format token amount with proper decimals
export function formatTokenAmount(amount: number, decimals = 6, displayDecimals = 6): string {
  const value = amount / 10 ** decimals
  return value.toFixed(displayDecimals)
}

// Calculate USD value
export function calculateUsdValue(amount: number, priceUsd: number): string {
  const value = amount * priceUsd
  return value.toFixed(2)
}
