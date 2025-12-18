#!/bin/bash
# scripts/execute_liquidity_and_volume.sh
# Script completo para ejecutar liquidez y volumen verificando en SolScan

set -e

echo "=================================="
echo "DMT/SOL Pool Liquidity + Volume Bot"
echo "=================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validar variables de entorno
if [ -z "$KEYPAIR" ]; then
  echo -e "${RED}[ERROR] Set KEYPAIR=/path/to/id.json${NC}"
  exit 1
fi

if [ -z "$KEYPAIR1" ] || [ -z "$KEYPAIR2" ] || [ -z "$KEYPAIR3" ]; then
  echo -e "${RED}[ERROR] Set KEYPAIR1, KEYPAIR2, KEYPAIR3${NC}"
  exit 1
fi

RPC="${RPC:-https://api.mainnet-beta.solana.com}"
DMT_MINT="DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV"
POOL_ID="8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr"

echo -e "${BLUE}[CONFIG]${NC} RPC: $RPC"
echo -e "${BLUE}[CONFIG]${NC} DMT Mint: $DMT_MINT"
echo -e "${BLUE}[CONFIG]${NC} Pool ID: $POOL_ID"
echo ""

# Paso 1: Verificar balances
echo -e "${YELLOW}[STEP 1]${NC} Verificando balances..."
echo ""

echo "Cuenta principal:"
solana balance --keypair "$KEYPAIR" --url "$RPC"

echo ""
echo "Cuentas de volumen:"
solana balance --keypair "$KEYPAIR1" --url "$RPC"
solana balance --keypair "$KEYPAIR2" --url "$RPC"
solana balance --keypair "$KEYPAIR3" --url "$RPC"
echo ""

# Paso 2: Inyectar liquidez
echo -e "${YELLOW}[STEP 2]${NC} Inyectando liquidez..."
echo "Ejecutando: create_dmt_sol_pool.js"
echo ""

KEYPAIR="$KEYPAIR" RPC="$RPC" node scripts/create_dmt_sol_pool.js \
  --dmt-mint "$DMT_MINT" \
  --pool-id "$POOL_ID" \
  --dmt-amount 15000000 \
  --sol-amount 50

echo ""
echo -e "${GREEN}[OK]${NC} Liquidez inyectada"
echo ""

# Capturar signature (en producción, el script devolvería esto)
read -p "Ingresa el transaction hash del paso anterior (para verificar): " TX_HASH

if [ ! -z "$TX_HASH" ]; then
  echo ""
  echo -e "${BLUE}[SOLSCAN]${NC} Verificando transacción..."
  echo -e "  URL: https://solscan.io/tx/$TX_HASH?cluster=mainnet"
  echo ""
  # Esperar confirmación
  sleep 10
fi

# Paso 3: Generar volumen
echo -e "${YELLOW}[STEP 3]${NC} Generando volumen con bot..."
echo "Ejecutando: volume_bot.js"
echo ""

KEYPAIR1="$KEYPAIR1" \
KEYPAIR2="$KEYPAIR2" \
KEYPAIR3="$KEYPAIR3" \
RPC="$RPC" node scripts/volume_bot.js \
  --dmt-mint "$DMT_MINT" \
  --pool-id "$POOL_ID" \
  --swap-amount 50000 \
  --trades 10 \
  --delay 2000

echo ""
echo -e "${GREEN}[OK]${NC} Volumen generado"
echo ""

# Paso 4: Monitoreo final
echo -e "${YELLOW}[STEP 4]${NC} Monitoreo final..."
echo ""
echo -e "${BLUE}[GECKOTERMINAL]${NC}"
echo "  https://www.geckoterminal.com/solana/pools/$POOL_ID"
echo ""
echo -e "${BLUE}[SOLSCAN - Token]${NC}"
echo "  https://solscan.io/token/$DMT_MINT?cluster=mainnet"
echo ""
echo -e "${BLUE}[SOLSCAN - Pool]${NC}"
echo "  https://solscan.io/account/$POOL_ID?cluster=mainnet"
echo ""

echo -e "${GREEN}[COMPLETADO]${NC} Todos los pasos ejecutados exitosamente"
echo ""
echo "Próximos pasos:"
echo "1. Espera 30-60 segundos para que se confirmen todas las transacciones"
echo "2. Verifica el volumen en GeckoTerminal"
echo "3. Monitorea el pool en SolScan"
echo ""
