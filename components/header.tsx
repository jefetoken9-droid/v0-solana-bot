"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Gem, Sparkles } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50 diamond-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-600 flex items-center justify-center diamond-glow relative">
            <Gem className="w-7 h-7 text-white" />
            <Sparkles className="w-3 h-3 text-cyan-300 absolute top-1 right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Diamante Trading Hub
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Powered by Jupiter
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px]">Mainnet</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-cyan-600 hover:!from-purple-700 hover:!to-cyan-700 !text-white !rounded-lg !font-semibold !transition-all diamond-glow" />
        </div>
      </div>
    </header>
  )
}
