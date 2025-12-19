# Guía: Ejecutar Pool & Volume Bot con Verificación en SolScan

## 📋 Requisitos Previos

1. **Solana CLI instalado** en tu máquina local
   ```bash
   curl https://release.solana.com/stable/install | sh
   ```

2. **Node.js 18+**
   ```bash
   node --version  # debe mostrar v18 o superior
   ```

3. **3 Keypairs configurados** para volumen (cuentas con SOL)
   ```bash
   # Crear nuevas keypairs o usar las existentes
   solana-keygen new --outfile ~/.config/solana/acct1.json
   solana-keygen new --outfile ~/.config/solana/acct2.json
   solana-keygen new --outfile ~/.config/solana/acct3.json
   ```

4. **Fondos necesarios:**
   - Cuenta principal: 15M DMT + 50 SOL (para crear pool)
   - Cuenta 1, 2, 3: ~0.5 SOL cada una (para fees de swaps)

---

## 🚀 Ejecución Paso a Paso

### Paso 1: Clonar y preparar repo

```bash
git clone https://github.com/jefetoken9-droid/v0-solana-bot
cd v0-solana-bot

# Instalar dependencias
npm install --legacy-peer-deps
npm install @solana/web3.js @solana/spl-token yargs

# Hacer scripts ejecutables
chmod +x scripts/execute_liquidity_and_volume.sh
chmod +x scripts/create_dmt_sol_pool.js
chmod +x scripts/volume_bot.js
```

### Paso 2: Verificar balances ANTES de ejecutar

```bash
# Cuenta principal (debe tener 15M DMT + 50+ SOL)
solana balance --keypair ~/.config/solana/id.json --url https://api.mainnet-beta.solana.com

# Ver tokens DMT
spl-token accounts --owner $(solana address --keypair ~/.config/solana/id.json) \
  --url https://api.mainnet-beta.solana.com

# Cuentas de volumen (deben tener ~0.5 SOL cada una)
solana balance --keypair ~/.config/solana/acct1.json --url https://api.mainnet-beta.solana.com
solana balance --keypair ~/.config/solana/acct2.json --url https://api.mainnet-beta.solana.com
solana balance --keypair ~/.config/solana/acct3.json --url https://api.mainnet-beta.solana.com
```

### Paso 3: Ejecutar Liquidez Inicial

```bash
# Inyectar 15,000,000 DMT + 50 SOL al pool
KEYPAIR=~/.config/solana/id.json \
RPC=https://api.mainnet-beta.solana.com \
  node scripts/create_dmt_sol_pool.js \
    --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
    --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
    --dmt-amount 15000000 \
    --sol-amount 50
```

**Output esperado:**
```
[INFO] Wallet: <tu-pubkey>
[INFO] Balance: X.XX SOL
[CONFIG] DMT Mint: DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV
[CONFIG] Pool ID: 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr
[TX] Signature: <HASH-TX>
[TX] Confirmada en https://solscan.io/tx/<HASH-TX>?cluster=mainnet
```

**Guarda el hash de transacción (HASH-TX)**

### Paso 4: Verificar Liquidez en SolScan

Abre en navegador (reemplaza HASH-TX):
```
https://solscan.io/tx/HASH-TX?cluster=mainnet
```

Deberías ver:
- ✅ Status: "Success"
- ✅ 2 instrucciones de transferencia (DMT + SOL)
- ✅ Pool actualizado con nueva liquidez

**Espera 1-2 minutos para que se indexe en GeckoTerminal**

### Paso 5: Ejecutar Bot de Volumen

```bash
# Generar 10 trades (compra/venta alternada)
KEYPAIR1=~/.config/solana/acct1.json \
KEYPAIR2=~/.config/solana/acct2.json \
KEYPAIR3=~/.config/solana/acct3.json \
RPC=https://api.mainnet-beta.solana.com \
  node scripts/volume_bot.js \
    --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
    --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
    --swap-amount 50000 \
    --trades 10 \
    --delay 2000
```

**Output esperado:**
```
[BOT] Cuenta 1: ... vende 50000 DMT
[TX] Signature: <HASH-TX-1>
[SWAP] ✓ Confirmada

[BOT] Cuenta 2: ... compra 50000 DMT
[TX] Signature: <HASH-TX-2>
[SWAP] ✓ Confirmada
...
[BOT] ✓ Completado: 10 trades ejecutados
```

### Paso 6: Verificar Transacciones en SolScan

Para cada hash de transacción del bot:
```
https://solscan.io/tx/<HASH-TX>?cluster=mainnet
```

Deberías ver:
- ✅ Status: "Success"
- ✅ Transacciones alternadas (vender/comprar)
- ✅ Fees pagados por cada cuenta
- ✅ Liquidity pool actualizado

---

## 📊 Monitoreo en GeckoTerminal

**URL del Pool:**
```
https://www.geckoterminal.com/solana/pools/8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr
```

Deberías ver:
- ✅ Liquidez: 15M DMT + 50 SOL
- ✅ Volumen 24h: Aumentando con cada bot run
- ✅ Precio: DMT/SOL ratio actualizado
- ✅ Gráfico con movimientos de los trades

---

## 🔍 Troubleshooting

### "Transaction failed: Insufficient funds"
**Solución:** Asegúrate de tener suficiente SOL para fees
```bash
# Transferir SOL a cuentas de volumen
solana transfer ~/.config/solana/id.json 1 \
  $(solana address --keypair ~/.config/solana/acct1.json) \
  --url https://api.mainnet-beta.solana.com
```

### "ATA not found"
**Solución:** Crear manualmente las cuentas asociadas
```bash
spl-token create-account DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
  --owner $(solana address --keypair ~/.config/solana/acct1.json)
```

### "Pool not found in GeckoTerminal"
**Solución:** Espera 5-10 minutos después de la transacción y refresca

### Las transacciones no confirman
**Solución:** Verifica el RPC no esté congestionado
```bash
# Usar RPC alternativo
RPC=https://api-mainnet.magic-eden.com ...
```

---

## 📝 Script Completo (Todo en Uno)

```bash
#!/bin/bash
set -e

KEYPAIR=~/.config/solana/id.json
KEYPAIR1=~/.config/solana/acct1.json
KEYPAIR2=~/.config/solana/acct2.json
KEYPAIR3=~/.config/solana/acct3.json
RPC=https://api.mainnet-beta.solana.com
DMT_MINT=DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV
POOL_ID=8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr

echo "=== Verificando balances ==="
solana balance --keypair $KEYPAIR --url $RPC
solana balance --keypair $KEYPAIR1 --url $RPC
solana balance --keypair $KEYPAIR2 --url $RPC
solana balance --keypair $KEYPAIR3 --url $RPC

echo ""
echo "=== Creando liquidez ==="
KEYPAIR=$KEYPAIR RPC=$RPC node scripts/create_dmt_sol_pool.js \
  --dmt-mint $DMT_MINT --pool-id $POOL_ID \
  --dmt-amount 15000000 --sol-amount 50

echo ""
echo "=== Esperando confirmación ==="
sleep 30

echo ""
echo "=== Generando volumen ==="
KEYPAIR1=$KEYPAIR1 KEYPAIR2=$KEYPAIR2 KEYPAIR3=$KEYPAIR3 RPC=$RPC \
  node scripts/volume_bot.js \
  --dmt-mint $DMT_MINT --pool-id $POOL_ID \
  --swap-amount 50000 --trades 10 --delay 2000

echo ""
echo "=== Completado ==="
echo "Pool: https://www.geckoterminal.com/solana/pools/$POOL_ID"
echo "Token: https://solscan.io/token/$DMT_MINT?cluster=mainnet"
```

Guarda esto en `scripts/run_all.sh` y ejecuta:
```bash
chmod +x scripts/run_all.sh
./scripts/run_all.sh
```

---

## ✅ Checklist Final

- [ ] Keypairs creados y financiados
- [ ] Liquidez inyectada (TX confirmada en SolScan)
- [ ] Pool visible en GeckoTerminal
- [ ] Bot ejecutado con éxito (10 TXs confirmadas)
- [ ] Volumen visible en pool (GeckoTerminal actualizado)
- [ ] Todas las TXs verificables en SolScan

---

## 📞 URLs de Referencia

- **SolScan**: https://solscan.io/?cluster=mainnet
- **GeckoTerminal**: https://www.geckoterminal.com/
- **Raydium**: https://raydium.io/
- **Solana Docs**: https://docs.solana.com/

¡Listo para ejecutar! 🚀
