'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface WalletStatsProps {
  walletAddress: string
}

export default function WalletStats({ walletAddress }: WalletStatsProps) {
  const [solBalance, setSolBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(
          `https://api.mainnet-beta.solana.com`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getBalance',
              params: [walletAddress]
            })
          }
        )
        const data = await response.json()
        setSolBalance(data.result.value / 1e9)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch balance:', error)
        setLoading(false)
      }
    }

    if (walletAddress) {
      fetchBalance()
      const interval = setInterval(fetchBalance, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [walletAddress])

  return (
    <div className="space-y-4">
      <Card className="border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">SOL Balance</p>
        <p className="text-2xl font-bold">
          {loading ? 'Loading...' : `${solBalance.toFixed(4)} SOL`}
        </p>
      </Card>

      <Card className="border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Portfolio Value</p>
        <p className="text-2xl font-bold">$0.00</p>
        <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
      </Card>

      <Card className="border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
        <div className="space-y-2">
          <button className="w-full px-3 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors">
            Buy SOL
          </button>
          <button className="w-full px-3 py-2 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-sm transition-colors">
            Send
          </button>
          <button className="w-full px-3 py-2 rounded-md bg-muted/10 hover:bg-muted/20 text-foreground text-sm transition-colors">
            Receive
          </button>
        </div>
      </Card>
    </div>
  )
}
