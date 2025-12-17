// API Endpoints
export const API_ENDPOINTS = {
  JUPITER_QUOTE: "https://quote-api.jup.ag/v6/quote",
  JUPITER_SWAP: "https://quote-api.jup.ag/v6/swap",
  DEXSCREENER: "https://api.dexscreener.com/latest/dex/tokens",
  COINGECKO: "https://api.coingecko.com/api/v3/simple/price",
} as const

// UI Constants
export const UI_CONFIG = {
  BALANCE_REFRESH_INTERVAL: 15000, // 15 seconds
  PRICE_REFRESH_INTERVAL: 30000, // 30 seconds
  QUOTE_DEBOUNCE_TIME: 500, // 500ms
} as const

// Transaction Settings
export const TRANSACTION_CONFIG = {
  DEFAULT_SLIPPAGE: 1, // 1%
  MAX_SLIPPAGE: 50, // 50%
  PRIORITY_FEE: "auto",
  CONFIRMATION_TIMEOUT: 60000, // 60 seconds
} as const

// Airdrop Settings
export const AIRDROP_CONFIG = {
  AMOUNT_SOL: 5,
  COOLDOWN_HOURS: 24,
} as const

// Explorer URLs
export const EXPLORER_URLS = {
  SOLSCAN: "https://solscan.io",
  SOLANA_FM: "https://solana.fm",
} as const

export function getTransactionUrl(signature: string, explorer: keyof typeof EXPLORER_URLS = "SOLSCAN"): string {
  return `${EXPLORER_URLS[explorer]}/tx/${signature}`
}

export function getAddressUrl(address: string, explorer: keyof typeof EXPLORER_URLS = "SOLSCAN"): string {
  return `${EXPLORER_URLS[explorer]}/address/${address}`
}
