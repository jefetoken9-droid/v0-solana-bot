"use client"

import { useEffect, useState } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export default function NetworkStatus() {
  const { connection } = useConnection()
  const [isConnected, setIsConnected] = useState(true)
  const [tps, setTps] = useState<number | null>(null)

  useEffect(() => {
    if (!connection) return

    const checkConnection = async () => {
      try {
        const perfSamples = await connection.getRecentPerformanceSamples(1)
        if (perfSamples.length > 0) {
          setTps(perfSamples[0].numTransactions / perfSamples[0].samplePeriodSecs)
        }
        setIsConnected(true)
      } catch (error) {
        console.error("[v0] Network check error:", error)
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [connection])

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      <span className="text-xs">{isConnected ? (tps ? `${Math.round(tps)} TPS` : "Connected") : "Disconnected"}</span>
    </Badge>
  )
}
