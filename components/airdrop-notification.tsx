"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AirdropNotification() {
  const { publicKey, connected } = useWallet()
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    // Check if user already claimed
    if (connected && publicKey) {
      const claimedKey = `airdrop_claimed_${publicKey.toString()}`
      const hasClaimed = localStorage.getItem(claimedKey)
      if (hasClaimed) {
        setClaimed(true)
      }
    }
  }, [connected, publicKey])

  const claimAirdrop = async () => {
    if (!publicKey) return

    setClaiming(true)
    try {
      const response = await fetch("/api/airdrop-wsol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully received 5 SOL!`, {
          description: "Check your wallet balance",
          action: data.explorerUrl
            ? {
                label: "View Transaction",
                onClick: () => window.open(data.explorerUrl, "_blank"),
              }
            : undefined,
        })

        // Mark as claimed
        localStorage.setItem(`airdrop_claimed_${publicKey.toString()}`, Date.now().toString())
        setClaimed(true)
      } else {
        toast.error(data.error || "Failed to claim airdrop")
      }
    } catch (error) {
      console.error("[v0] Airdrop error:", error)
      toast.error("Failed to claim airdrop")
    } finally {
      setClaiming(false)
    }
  }

  if (!connected || claimed) return null

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Gift className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Welcome Bonus</h3>
            <p className="text-xs text-muted-foreground">Claim 5 SOL to start trading</p>
          </div>
        </div>
        <Button onClick={claimAirdrop} disabled={claiming} size="sm" className="bg-purple-600 hover:bg-purple-700">
          {claiming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Claiming...
            </>
          ) : (
            "Claim Now"
          )}
        </Button>
      </div>
    </Card>
  )
}
