"use client"

import { useEffect, useState } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react"
import { getTransactionUrl } from "@/lib/constants"

interface TransactionStatusProps {
  signature: string
  onConfirmed?: () => void
  onFailed?: () => void
}

export default function TransactionStatus({ signature, onConfirmed, onFailed }: TransactionStatusProps) {
  const { connection } = useConnection()
  const [status, setStatus] = useState<"pending" | "confirmed" | "failed">("pending")

  useEffect(() => {
    if (!signature || !connection) return

    const checkStatus = async () => {
      try {
        const result = await connection.getSignatureStatus(signature)

        if (result.value?.confirmationStatus === "confirmed" || result.value?.confirmationStatus === "finalized") {
          setStatus("confirmed")
          onConfirmed?.()
        } else if (result.value?.err) {
          setStatus("failed")
          onFailed?.()
        }
      } catch (error) {
        console.error("[v0] Error checking transaction status:", error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 2000)

    return () => clearInterval(interval)
  }, [signature, connection, onConfirmed, onFailed])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Transaction Status</CardTitle>
            <CardDescription className="font-mono text-xs mt-1">
              {signature.slice(0, 8)}...{signature.slice(-8)}
            </CardDescription>
          </div>
          <Badge
            variant={status === "confirmed" ? "default" : status === "failed" ? "destructive" : "secondary"}
            className="flex items-center gap-1"
          >
            {status === "pending" && <Clock className="h-3 w-3 animate-spin" />}
            {status === "confirmed" && <CheckCircle2 className="h-3 w-3" />}
            {status === "failed" && <XCircle className="h-3 w-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <a
          href={getTransactionUrl(signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View on Solscan
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  )
}
