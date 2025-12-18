import { Connection, PublicKey } from "@solana/web3.js"

// Mainnet Solana configuration
const MAINNET_RPC = "https://api.mainnet-beta.solana.com"

// Validate that the RPC endpoint is a valid URL
const validateRpcEndpoint = (url: string | undefined): string => {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return MAINNET_RPC
  }
  return url
}

export const NETWORK = "mainnet-beta" as const
export const RPC_ENDPOINT = validateRpcEndpoint(process.env.NEXT_PUBLIC_SOLANA_RPC_URL)

// Diamante Token Configuration (DMT)
export const DIAMANTE_TOKEN = {
  address: "5zJo2GzYRgiZw5j3SBNpuqVcGok35kT3ADwsw74yJWV6",
  symbol: "DMT",
  name: "Diamante",
  decimals: 6,
  poolAddress: "8oiVbfQT4ErS1wciaTuJhCSn1EuPn37wThA5MypiBq6K",
  geckoTerminalUrl: "https://www.geckoterminal.com/solana/pools/8oiVbfQT4ErS1wciaTuJhCSn1EuPn37wThA5MypiBq6K",
}

// WSOL Configuration
export const WSOL = {
  address: "So11111111111111111111111111111111111111112",
  symbol: "WSOL",
  name: "Wrapped SOL",
  decimals: 9,
}

// Airdrop amount: 5 WSOL
export const AIRDROP_AMOUNT = 50 * 1e9 // 50 WSOL in lamports

// Create connection to Solana mainnet
export const createConnection = () => {
  return new Connection(RPC_ENDPOINT, "confirmed")
}

// Token addresses as PublicKey
export const DIAMANTE_MINT = new PublicKey(DIAMANTE_TOKEN.address)
export const WSOL_MINT = new PublicKey(WSOL.address)
