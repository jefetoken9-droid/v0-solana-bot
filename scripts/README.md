Scripts de pool DMT/SOL en Raydium

## Resumen
- `create_dmt_sol_pool.js` — Crea e inyecta liquidez (15M DMT + SOL) en un pool Raydium de forma automatizada.
- `volume_bot.js` — Bot de volumen: ejecuta trades automáticos entre 3 cuentas para generar liquidez y volumen en el pool.
- `transfer_dmt.js` — Transferencia básica de tokens SPL (uso auxiliar).

## Requisitos locales
- Node >= 18
- Tener instalado las dependencias necesarias localmente.

## Instalación (local)

```bash
npm install @solana/web3.js @solana/spl-token yargs
# o
pnpm add @solana/web3.js @solana/spl-token yargs
```

## Uso: Crear pool e inyectar liquidez

```bash
KEYPAIR=~/.config/solana/id.json RPC=https://api.mainnet-beta.solana.com \
  node scripts/create_dmt_sol_pool.js \
    --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
    --sol-mint So11111111111111111111111111111111111111112 \
    --raydium-program AhwM3wt1gvoCxq9jKLSLrgR6kXGSQ2f4Urfx9Ffz9RNt \
    --factory 7xMJ1iUN8iDqn9yXq8ML4x4gCAq93vXyjUYyrL619MrM \
    --pool-account 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
    --dmt-amount 15000000 \
    --sol-amount 50
```

### Parámetros

- `--dmt-mint` — Mint del token DMT
- `--sol-mint` — WSOL mint (por defecto: So111...)
- `--raydium-program` — Raydium Program ID
- `--factory` — Factory Address de Raydium
- `--pool-account` — Pool Account Address (puede ser PDA o existente)
- `--dmt-amount` — Cantidad de DMT (decimales incluidos)
- `--sol-amount` — Cantidad de SOL a inyectar
- `KEYPAIR` — Ruta al keypair JSON (env var)
- `RPC` — URL del RPC (env var; por defecto mainnet)

## Uso auxiliar: Bot de Volumen (genera liquidez y trades automáticos)

```bash
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

### Parámetros del Bot

- `KEYPAIR1, KEYPAIR2, KEYPAIR3` — Rutas a 3 keypairs JSON (cuentas que ejecutarán trades)
- `--dmt-mint` — Mint del token DMT
- `--pool-id` — ID del pool donde generar volumen
- `--swap-amount` — Cantidad por swap (defecto: 50000)
- `--trades` — Número total de trades (defecto: 10)
- `--delay` — Delay entre trades en ms (defecto: 2000)

### Direcciones integradas

El bot usa automáticamente estas direcciones de configuración de Raydium:

- **Raydium Program**: AhwM3wt1gvoCxq9jKLSLrgR6kXGSQ2f4Urfx9Ffz9RNt
- **Factory**: 7xMJ1iUN8iDqn9yXq8ML4x4gCAq93vXyjUYyrL619MrM
- **Config**: 4JWs8ouCxFQog1pXhjFukWMPDPK5oNJ9pYnUTfTD5Gme
- **Router**: 7qSHpPJcZojgi74Raf8tWThu387zSE8qMeAW8dJvmSC3
- **Pool**: 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr

### Cómo funciona

1. Carga 3 cuentas desde sus keypairs
2. Alterna entre vender DMT por SOL y comprar DMT con SOL
3. Ejecuta los trades secuencialmente con delay configurable
4. Registra cada transacción confirmada
5. Genera liquidez y volumen en el pool

## Uso auxiliar: Transferencia simple

```bash
KEYPAIR=~/.config/solana/id.json RPC=https://api.mainnet-beta.solana.com \
  node scripts/transfer_dmt.js \
    --mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
    --recipient <RECIPIENT_TOKEN_ACCOUNT> \
    --amount 15000000
```

## Notas importantes

1. **Decimales**: Asegúrate de usar los decimales correctos para cada token.
2. **Disponibilidad de tokens**: Tu wallet debe tener suficientes DMT y SOL.
3. **Fees**: Reserva ~0.5–2 SOL para fees de transacción.
4. **Pool existente vs nuevo**: El script maneja creación de cuentas token asociadas; si el pool ya existe, usará la cuenta existente.
5. **Explorador**: Después de ejecutar, podrás ver la transacción en Solana Beach o SolScan.
