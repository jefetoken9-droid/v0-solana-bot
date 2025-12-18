"use client"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import PoolDashboard from "@/components/pool-dashboard"
import { Gem } from "lucide-react"

export default function Home() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [mounted, setMounted] = useState(false)
  const [showPool, setShowPool] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="diamond-glow p-8 rounded-2xl">
          <Gem className="h-12 w-12 text-primary diamond-sparkle" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {showPool ? (
          <PoolDashboard />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[600px] gap-8">
            <button
              onClick={() => setShowPool(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
            >
              Ver Dashboard del Pool
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="diamond-glow p-8 rounded-2xl">
          <Gem className="h-12 w-12 text-primary diamond-sparkle" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {!wallet.connected ? (
          <div className="flex flex-col items-center justify-center min-h-[600px] gap-8">
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex justify-center mb-6">
                <div className="diamond-glow p-6 rounded-3xl bg-card/50 backdrop-blur">
                  <Gem className="h-20 w-20 diamond-gradient" />
                </div>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
                Diamante Trading Hub
              </h1>
              <p className="text-xl text-muted-foreground">
                Premium token trading powered by Jupiter on Solana Mainnet
              </p>
              <div className="diamond-border bg-card/30 backdrop-blur p-6 rounded-xl mt-8">
                <p className="text-lg font-semibold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome Bonus Available
                </p>
                <p className="text-muted-foreground">
                  Connect your wallet to receive 5 SOL instantly and start trading DMT tokens
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AirdropNotification />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TokenSwap />
                <PriceChart />
              </div>

              <aside className="space-y-6">
                <DiamanteInfo />
                <WalletBalance walletAddress={wallet.publicKey?.toString() || ""} />
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
