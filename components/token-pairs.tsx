'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

interface TokenPairsProps {
  onSelectToken: (token: string) => void
}

const TRENDING_TOKENS = [
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'raydium', symbol: 'RAY', name: 'Raydium' },
  { id: 'magic-eden', symbol: 'ME', name: 'Magic Eden' },
  { id: 'orca', symbol: 'ORCA', name: 'Orca' },
]

export default function TokenPairs({ onSelectToken }: TokenPairsProps) {
  const ids = TRENDING_TOKENS.map(t => t.id).join(',')
  
  const { data: priceData, isLoading } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TRENDING_TOKENS.map((token) => {
            const price = priceData?.[token.id]?.usd || 0
            const change = priceData?.[token.id]?.usd_24h_change || 0
            const isPositive = change >= 0

            return (
              <button
                key={token.symbol}
                onClick={() => onSelectToken(token.symbol)}
                className="p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-base font-bold">${price.toFixed(2)}</p>
                <p className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{change.toFixed(2)}%
                </p>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
