# Guía de Deploy - DMT/SOL Pool & Dashboard

## Opciones de Deploy

### Opción 1: Vercel (Recomendado para Next.js)

**Pasos:**

1. **Preparar el repositorio:**
   ```bash
   git add .
   git commit -m "Add pool dashboard and volume bot"
   git push origin main
   ```

2. **Conectar a Vercel:**
   - Ve a https://vercel.com
   - Haz clic en "New Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar variables de entorno en Vercel:**
   - En el panel de Vercel, ve a "Settings" → "Environment Variables"
   - Agrega:
     ```
     NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
     ```

4. **Deploy automático:**
   - Vercel compilará automáticamente tu app
   - Tu sitio estará disponible en `https://tu-proyecto.vercel.app`

**Ventajas:**
- Deployado automáticamente en cada push
- CDN global
- SSL gratis
- Muy rápido

---

### Opción 2: Railway

**Pasos:**

1. **Preparar repositorio (igual a Opción 1)**

2. **Conectar a Railway:**
   - Ve a https://railway.app
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub"

3. **Configurar build:**
   - Railway detectará Next.js automáticamente
   - Variables de entorno: agregar en el panel

4. **Deploy:**
   - Railway compilará y deployará automáticamente

---

### Opción 3: Local + Ngrok (Para testing rápido)

**Pasos:**

1. **En tu máquina local:**
   ```bash
   npm install
   npm run build
   npm run start
   ```

2. **Exponer con Ngrok:**
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```

3. **Compartir URL pública:**
   - Ngrok generará una URL tipo `https://xxxx-xx-xxxx-xxxx.ngrok.io`
   - Valida que la app funcione en esa URL

---

### Opción 4: Docker + Cloud Run (Google Cloud)

**Crear Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Deploy a Cloud Run:**

```bash
gcloud run deploy dmt-pool-dashboard \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Ejecución de Scripts en Producción

### Scripts Disponibles

1. **create_dmt_sol_pool.js** - Inyectar liquidez inicial
2. **volume_bot.js** - Generar volumen automático
3. **transfer_dmt.js** - Transferir tokens

### Ejecutar Localmente (Recomendado)

```bash
# Instalar dependencias
npm install @solana/web3.js @solana/spl-token @raydium-io/raydium-sdk yargs

# Inyectar liquidez inicial (una sola vez)
KEYPAIR=~/.config/solana/id.json RPC=https://api.mainnet-beta.solana.com \
  node scripts/create_dmt_sol_pool.js \
    --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
    --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
    --dmt-amount 15000000 \
    --sol-amount 50

# Generar volumen (3 cuentas)
KEYPAIR1=~/.config/solana/acct1.json \
KEYPAIR2=~/.config/solana/acct2.json \
KEYPAIR3=~/.config/solana/acct3.json \
RPC=https://api.mainnet-beta.solana.com \
  node scripts/volume_bot.js \
    --dmt-mint DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV \
    --pool-id 8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr \
    --swap-amount 50000 \
    --trades 20 \
    --delay 2000
```

---

## Monitoreo Post-Deploy

### URLs de Monitoreo

- **Dashboard Local:** http://localhost:3000
- **GeckoTerminal:** https://www.geckoterminal.com/solana/pools/8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr
- **SolScan:** https://solscan.io/token/DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV

### Verificar Estado del Pool

```bash
# Obtener info del pool
curl https://api.mainnet-beta.solana.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getAccountInfo",
    "params": ["8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr"]
  }'
```

---

## Checklist de Deploy

- [ ] Codigo committeado y en GitHub
- [ ] Variables de entorno configuradas
- [ ] Build local exitoso (`npm run build`)
- [ ] Scripts de liquidez/volumen probados localmente
- [ ] URLs de exploradores verificadas
- [ ] Dashboard cargando en navegador
- [ ] Pool visible en GeckoTerminal

---

## Troubleshooting

**Build falla por dependencias:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Pool no aparece en GeckoTerminal:**
- Espera 5-10 minutos después de `create_dmt_sol_pool.js`
- Verifica que la transacción fue confirmada en SolScan

**Bot no ejecuta trades:**
- Verifica que las 3 cuentas tienen SOL para fees (~0.1 SOL c/u)
- Verifica que las cuentas tienen DMT

---

## Soporte

Para problemas específicos de Raydium o Solana:
- Raydium Docs: https://raydium.io/fusion/
- Solana Docs: https://docs.solana.com/
- Discord: Solana Labs, Raydium
