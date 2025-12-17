# Diamante Trading Hub

A modern Solana trading platform focused on the Diamante (DMT) token, powered by Jupiter DEX aggregator.

## Features

- **Token Swapping**: Trade DMT, SOL, USDC, USDT and more using Jupiter DEX
- **Real-time Price Data**: Live token prices and 24h statistics from DexScreener
- **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- **Welcome Bonus**: New users receive 5 SOL upon wallet connection
- **Mainnet Only**: Configured exclusively for Solana mainnet

## Token Information

- **Token**: Diamante (DMT)
- **Address**: `5zJo2GzYRgiZw5j3SBNpuqVcGok35kT3ADwsw74yJWV6`
- **Pool**: `8oiVbfQT4ErS1wciaTuJhCSn1EuPn37wThA5MypiBq6K`
- **Network**: Solana Mainnet

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   - `NEXT_PUBLIC_SOLANA_RPC_URL`: Your Solana RPC endpoint (optional, defaults to public mainnet)
   - `BOT_PRIVATE_KEY`: Base58 encoded private key for the airdrop bot wallet (required for airdrop feature)

3. **Fund the bot wallet** (for airdrop functionality):
   - The bot wallet needs SOL to send airdrops to new users
   - Send SOL to the bot's public key
   - Minimum recommended: 100 SOL (for 20 users)

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Reusable UI components

### Blockchain Integration
- **@solana/web3.js**: Solana blockchain interaction
- **@solana/wallet-adapter**: Wallet connection management
- **Jupiter API**: DEX aggregator for token swaps
- **DexScreener API**: Real-time token price data

### Key Components

- `components/token-swap.tsx`: Jupiter-powered token swap interface
- `components/diamante-info.tsx`: DMT token statistics display
- `components/wallet-balance.tsx`: SOL and DMT balance tracker
- `components/airdrop-notification.tsx`: Welcome bonus claim UI
- `app/api/airdrop-wsol/route.ts`: Airdrop distribution API

## Security Considerations

- **Private Keys**: Never commit `.env.local` or expose private keys
- **Rate Limiting**: Airdrop API includes 24-hour cooldown per wallet
- **RPC Endpoints**: Use rate-limited or private RPC endpoints for production
- **Bot Wallet**: Monitor bot wallet balance regularly

## Production Deployment

1. **Vercel** (recommended):
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

2. **Environment Variables**:
   - Set `NEXT_PUBLIC_SOLANA_RPC_URL` to your production RPC
   - Set `BOT_PRIVATE_KEY` with a secure private key

3. **RPC Provider**:
   Consider using dedicated RPC providers for better reliability:
   - [QuickNode](https://www.quicknode.com/)
   - [Helius](https://helius.dev/)
   - [Alchemy](https://www.alchemy.com/)

## API Routes

### POST /api/airdrop-wsol
Distributes 5 SOL to new wallet connections.

**Request**:
```json
{
  "walletAddress": "user_wallet_public_key"
}
```

**Response**:
```json
{
  "success": true,
  "signature": "transaction_signature",
  "amount": 5,
  "explorerUrl": "https://solscan.io/tx/..."
}
```

## Jupiter Integration

The app uses Jupiter v6 API for token swaps:
- Quote API: `https://quote-api.jup.ag/v6/quote`
- Swap API: `https://quote-api.jup.ag/v6/swap`

Features:
- Best price routing across Solana DEXs
- Configurable slippage tolerance
- Price impact calculation
- Automatic SOL wrapping/unwrapping

## Troubleshooting

**Wallet not connecting**:
- Ensure wallet extension is installed
- Check network is set to Mainnet
- Clear browser cache and reload

**Airdrop failing**:
- Check bot wallet has sufficient SOL
- Verify `BOT_PRIVATE_KEY` is correctly set
- Check 24-hour cooldown period

**Swap failing**:
- Increase slippage tolerance
- Check wallet has sufficient balance
- Verify network connectivity

## License

MIT
