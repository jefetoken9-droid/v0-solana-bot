'use client'

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

interface Transaction {
  signature: string
  timestamp: number
  status: 'success' | 'failed'
}

export default function TransactionHistory() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wallet.publicKey || !connection) {
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        const sigs = await connection.getSignaturesForAddress(wallet.publicKey!, { limit: 10 })
        const txs = sigs.map(sig => ({
          signature: sig.signature,
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
          status: sig.err ? 'failed' : 'success'
        }))
        setTransactions(txs)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [wallet.publicKey, connection])

  if (!wallet.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect wallet to view transactions</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <a
                key={tx.signature}
                href={`https://solscan.io/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors border border-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono truncate">{tx.signature.slice(0, 20)}...</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    tx.status === 'success' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {tx.status === 'success' ? 'Success' : 'Failed'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
