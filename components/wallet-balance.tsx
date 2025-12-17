"use client"

import { useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DIAMANTE_TOKEN } from "@/lib/solana-config"
import { Wallet, TrendingUp } from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function WalletBalance({ walletAddress }: { walletAddress: string }) {
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number>(0)
  const [dmtBalance, setDmtBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const { data: solPrice } = useSWR(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  useEffect(() => {
    if (!walletAddress || !connection) {
      setLoading(false)
      return
    }

    const fetchBalances = async () => {
      try {
        const pubkey = new PublicKey(walletAddress)

        const balanceInLamports = await connection.getBalance(pubkey)
        setBalance(balanceInLamports / LAMPORTS_PER_SOL)

        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
            mint: new PublicKey(DIAMANTE_TOKEN.address),
          })

          if (tokenAccounts.value.length > 0) {
            const tokenAmount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount
            setDmtBalance(Number(tokenAmount.uiAmount) || 0)
          } else {
            setDmtBalance(0)
          }
        } catch (error) {
          console.error("[v0] Error fetching DMT balance:", error)
          setDmtBalance(0)
        }
      } catch (error) {
        console.error("[v0] Error fetching balances:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 15000) // Update every 15s
    return () => clearInterval(interval)
  }, [walletAddress, connection])

  const balanceUSD = balance * (solPrice?.solana?.usd || 0)

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect wallet to view balance</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : (
          <>
            <div className="p-3 bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg border border-purple-500/20">
              <p className="text-xs text-muted-foreground mb-1">SOL Balance</p>
              <p className="text-2xl font-bold">{balance.toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">≈ ${balanceUSD.toFixed(2)} USD</p>
            </div>

            <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-lg border border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{DIAMANTE_TOKEN.symbol} Balance</p>
                <TrendingUp className="h-3 w-3 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold">{dmtBalance.toFixed(6)}</p>
              <p className="text-xs text-muted-foreground">{DIAMANTE_TOKEN.name}</p>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Network Info</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SOL Price</span>
                  <span className="font-semibold">${solPrice?.solana?.usd?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-semibold text-green-400">Mainnet</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
