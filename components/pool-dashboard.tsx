"use client"

import { useEffect, useState } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const POOL_ID = "8fVcXzRLm2GkDfy2Jw2W79HQGwgVzmi5zwpTfZWj22sr"
const DMT_MINT = "DNtKVnhBub6ikXE782PK64ZUv8GgaAWQyVTgDrEvxUDV"
const RPC = "https://api.mainnet-beta.solana.com"

export default function PoolDashboard() {
  const [poolData, setPoolData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [botRunning, setBotRunning] = useState(false)

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const connection = new Connection(RPC, "confirmed")
        const poolPubkey = new PublicKey(POOL_ID)

        const accountInfo = await connection.getAccountInfo(poolPubkey)
        if (accountInfo) {
          setPoolData({
            poolId: POOL_ID,
            size: accountInfo.data.length,
            owner: accountInfo.owner.toBase58(),
            lamports: accountInfo.lamports,
            lastChecked: new Date().toLocaleString(),
          })
        }
      } catch (err) {
        console.error("Error fetching pool data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPoolData()
    const interval = setInterval(fetchPoolData, 10000) // Refrescar cada 10s
    return () => clearInterval(interval)
  }, [])

  const handleStartBot = () => {
    setBotRunning(true)
    // En producción, esto llamaría a una API que ejecute el bot
    console.log("Bot iniciado")
    setTimeout(() => setBotRunning(false), 30000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">DMT/SOL Pool</h1>
          <p className="text-purple-300">Monitor de liquidez y volumen en Raydium</p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pool Status */}
          <Card className="bg-slate-800 border-purple-500/30 p-6">
            <h3 className="text-purple-300 text-sm font-semibold mb-2">Estado del Pool</h3>
            <div className="flex items-baseline gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-2xl font-bold text-white">Activo</span>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              Última actualización: {poolData?.lastChecked || "Cargando..."}
            </p>
          </Card>

          {/* Pool Size */}
          <Card className="bg-slate-800 border-purple-500/30 p-6">
            <h3 className="text-purple-300 text-sm font-semibold mb-2">Tamaño del Pool</h3>
            <p className="text-2xl font-bold text-white">
              {poolData ? `${(poolData.size / 1024).toFixed(2)} KB` : "Cargando..."}
            </p>
            <p className="text-slate-400 text-xs mt-4">Datos en cadena</p>
          </Card>

          {/* Liquidity */}
          <Card className="bg-slate-800 border-purple-500/30 p-6">
            <h3 className="text-purple-300 text-sm font-semibold mb-2">Liquidez</h3>
            <p className="text-2xl font-bold text-green-400">15,000,000 DMT</p>
            <p className="text-slate-400 text-xs mt-4">+ 50 SOL equivalentes</p>
          </Card>

          {/* Volume 24H */}
          <Card className="bg-slate-800 border-purple-500/30 p-6">
            <h3 className="text-purple-300 text-sm font-semibold mb-2">Volumen Bot</h3>
            <p className="text-2xl font-bold text-blue-400">{botRunning ? "En ejecución" : "Pausado"}</p>
            <p className="text-slate-400 text-xs mt-4">Estado en tiempo real</p>
          </Card>
        </div>

        {/* Pool Details */}
        <Card className="bg-slate-800 border-purple-500/30 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Detalles del Pool</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-purple-300 font-semibold mb-4">Configuración</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Pool ID</span>
                  <code className="text-green-400 text-xs font-mono">{POOL_ID.slice(0, 8)}...</code>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Token Mint</span>
                  <code className="text-green-400 text-xs font-mono">{DMT_MINT.slice(0, 8)}...</code>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Program</span>
                  <code className="text-green-400 text-xs font-mono">AhwM3wt1...</code>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Factory</span>
                  <code className="text-green-400 text-xs font-mono">7xMJ1iUN...</code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 font-semibold mb-4">Direcciones Raydium</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Config</span>
                  <code className="text-blue-400 text-xs font-mono">4JWs8ouC...</code>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Router</span>
                  <code className="text-blue-400 text-xs font-mono">7qSHpPJc...</code>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Red</span>
                  <span className="text-slate-300">Mainnet</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">RPC</span>
                  <span className="text-slate-300 text-xs">api.mainnet-beta.solana.com</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bot Control */}
        <Card className="bg-slate-800 border-purple-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Control de Bot de Volumen</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-purple-300 font-semibold mb-4">Parámetros</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-sm">Cantidad por Swap</label>
                  <input
                    type="number"
                    defaultValue="50000"
                    className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Número de Trades</label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Delay entre Trades (ms)</label>
                  <input
                    type="number"
                    defaultValue="2000"
                    className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 font-semibold mb-4">Estado</h3>
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4 h-32 overflow-y-auto">
                <p className="text-slate-300 text-sm font-mono">
                  {botRunning
                    ? "Bot ejecutando trades... (Modo demo)\n\n→ Swap 1: Vendiendo DMT\n→ Swap 2: Comprando DMT\n→ Confirmadas..."
                    : "Estado: Inactivo\n\nHaz clic en 'Iniciar Bot' para comenzar\na generar volumen y liquidez."}
                </p>
              </div>

              <Button
                onClick={handleStartBot}
                disabled={botRunning}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {botRunning ? "Bot en ejecución..." : "Iniciar Bot"}
              </Button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              ⚠️ <strong>Nota:</strong> En producción, ejecuta los scripts localmente con tus keypairs reales.
              Este dashboard es solo para monitoreo. Usa: <code className="bg-slate-900 px-2 py-1 rounded text-xs">node scripts/volume_bot.js</code>
            </p>
          </div>
        </Card>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`https://www.geckoterminal.com/solana/pools/${POOL_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            📊 Ver en GeckoTerminal
          </a>
          <a
            href="https://solscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            🔍 Ver en SolScan
          </a>
        </div>
      </div>
    </div>
  )
}
