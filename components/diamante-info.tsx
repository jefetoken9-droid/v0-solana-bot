"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, TrendingUp, TrendingDown, Gem } from "lucide-react"
import { DIAMANTE_TOKEN } from "@/lib/solana-config"

interface TokenData {
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  holders: number
  marketCap: number
}

export default function DiamanteInfo() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTokenData()
    const interval = setInterval(fetchTokenData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTokenData = async () => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${DIAMANTE_TOKEN.address}`)
      const data = await response.json()

      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0]
        setTokenData({
          price: Number.parseFloat(pair.priceUsd) || 0,
          priceChange24h: Number.parseFloat(pair.priceChange?.h24) || 0,
          volume24h: Number.parseFloat(pair.volume?.h24) || 0,
          liquidity: Number.parseFloat(pair.liquidity?.usd) || 0,
          holders: pair.info?.holders || 0,
          marketCap: Number.parseFloat(pair.marketCap) || 0,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch Diamante data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="diamond-border diamond-glow bg-gradient-to-br from-purple-500/10 via-card to-cyan-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {DIAMANTE_TOKEN.symbol}
                <span className="text-muted-foreground text-base font-normal">{DIAMANTE_TOKEN.name}</span>
              </CardTitle>
              <CardDescription className="mt-1">Featured Token</CardDescription>
            </div>
          </div>
          <a
            href={DIAMANTE_TOKEN.geckoTerminalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-purple-400" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-12 bg-muted/50 animate-pulse rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-16 bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-16 bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-16 bg-muted/50 animate-pulse rounded-lg" />
            </div>
          </div>
        ) : tokenData ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg border border-purple-500/30">
              <div className="text-3xl font-bold">${tokenData.price.toFixed(8)}</div>
              <div
                className={`flex items-center gap-1 text-sm mt-2 font-semibold ${
                  tokenData.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {tokenData.priceChange24h >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(tokenData.priceChange24h).toFixed(2)}% (24h)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                <div className="text-sm font-bold">${(tokenData.marketCap / 1000).toFixed(1)}K</div>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Liquidity</div>
                <div className="text-sm font-bold">${(tokenData.liquidity / 1000).toFixed(1)}K</div>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Volume 24h</div>
                <div className="text-sm font-bold">${(tokenData.volume24h / 1000).toFixed(1)}K</div>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Holders</div>
                <div className="text-sm font-bold">{tokenData.holders || "N/A"}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">Unable to load token data</div>
        )}
      </CardContent>
    </Card>
  )
}
