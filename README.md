# Diamante Trading Hub + DMT/SOL Pool Manager

A modern Solana trading platform focused on the Diamante (DMT) token, powered by Jupiter DEX aggregator. Incluye dashboard de monitoreo y bot de volumen automatizado para el pool DMT/SOL en Raydium.

## Features

- **Token Swapping**: Trade DMT, SOL, USDC, USDT and more using Jupiter DEX
- **Pool Dashboard**: Monitor en tiempo real del pool DMT/SOL en Raydium
- **Volume Bot**: Genera liquidez y volumen automatizado con 3 cuentas
- **Real-time Price Data**: Live token prices y estadísticas desde DexScreener
- **Wallet Integration**: Conecta con Phantom, Solflare y otros wallets de Solana
- **Welcome Bonus**: Nuevos usuarios reciben 5 SOL al conectar wallet
- **Mainnet Only**: Configurado exclusivamente para Solana mainnet

## Token & Pool Information

- **Token**: Diamante (DMT)
- **Address**: `DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV`
- **Pool DMT/SOL**: `8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr`
- **Raydium Program**: `AhwM3wt1gvoCxq9jKLSLrgR6kXGSQ2f4Urfx9Ffz9RNt`
- **Factory**: `7xMJ1iUN8iDqn9yXq8ML4x4gCAq93vXyjUYyrL619MrM`
- **Config**: `4JWs8ouCxFQog1pXhjFukWMPDPK5oNJ9pYnUTfTD5Gme`
- **Router**: `7qSHpPJcZojgi74Raf8tWThu387zSE8qMeAW8dJvmSC3`
- **Network**: Solana Mainnet

## Setup

1. **Install dependencies** (local, no contenedor):
   ```bash
   npm install --legacy-peer-deps
   npm install @solana/web3.js @solana/spl-token @raydium-io/raydium-sdk yargs
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
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
