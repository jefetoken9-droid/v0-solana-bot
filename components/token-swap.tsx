"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { VersionedTransaction } from "@solana/web3.js"
import { DIAMANTE_TOKEN, WSOL } from "@/lib/solana-config"

const TOKENS = [
  { symbol: WSOL.symbol, name: WSOL.name, mint: WSOL.address, decimals: WSOL.decimals, logo: "" },
  {
    symbol: DIAMANTE_TOKEN.symbol,
    name: DIAMANTE_TOKEN.name,
    mint: DIAMANTE_TOKEN.address,
    decimals: DIAMANTE_TOKEN.decimals,
    logo: "",
  },
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5FboyKj2FpCpFhaADVQy65pBavFvVqjQo6NWJ", decimals: 6, logo: "" },
  { symbol: "USDT", name: "Tether", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, logo: "" },
]

export default function TokenSwap() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [fromToken, setFromToken] = useState(WSOL.symbol)
  const [toToken, setToToken] = useState(DIAMANTE_TOKEN.symbol)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [slippage, setSlippage] = useState("1")
  const [quoteResponse, setQuoteResponse] = useState<any>(null)

  useEffect(() => {
    if (fromAmount && Number.parseFloat(fromAmount) > 0) {
      const timer = setTimeout(() => {
        fetchQuote()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setToAmount("")
      setQuoteResponse(null)
    }
  }, [fromAmount, fromToken, toToken, slippage])

  const fetchQuote = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) return

    setLoading(true)
    try {
      const fromTokenObj = TOKENS.find((t) => t.symbol === fromToken)
      const toTokenObj = TOKENS.find((t) => t.symbol === toToken)

      if (!fromTokenObj || !toTokenObj) {
        throw new Error("Token not found")
      }

      const amountInSmallestUnit = Math.floor(Number.parseFloat(fromAmount) * 10 ** fromTokenObj.decimals)

      const params = new URLSearchParams({
        inputMint: fromTokenObj.mint,
        outputMint: toTokenObj.mint,
        amount: amountInSmallestUnit.toString(),
        slippageBps: (Number.parseFloat(slippage) * 100).toString(),
      })

      const response = await fetch(`https://quote-api.jup.ag/v6/quote?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to get swap quote")
      }

      const quote = await response.json()
      const outputAmount = Number(quote.outAmount) / 10 ** toTokenObj.decimals
      setToAmount(outputAmount.toFixed(toTokenObj.decimals))
      setQuoteResponse(quote)

      console.log("[v0] Quote received:", { outputAmount, quote })
    } catch (error) {
      console.error("[v0] Quote error:", error)
      toast.error("Failed to get quote")
      setToAmount("")
      setQuoteResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!wallet.connected || !wallet.publicKey || !quoteResponse) {
      toast.error("Connect wallet and get a quote first")
      return
    }

    setSwapping(true)
    try {
      console.log("[v0] Executing swap with quote:", quoteResponse)

      const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      })

      if (!swapResponse.ok) {
        throw new Error("Failed to get swap transaction")
      }

      const { swapTransaction } = await swapResponse.json()

      const swapTransactionBuf = Buffer.from(swapTransaction, "base64")
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

      const signed = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 2,
      })

      console.log("[v0] Transaction sent:", signature)

      toast.success("Transaction sent!", {
        description: "Confirming transaction...",
        action: {
          label: "View",
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
      })

      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error("Transaction failed")
      }

      toast.success("Swap successful!", {
        description: `Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
        action: {
          label: "View",
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
      })

      // Reset form
      setFromAmount("")
      setToAmount("")
      setQuoteResponse(null)
    } catch (error) {
      console.error("[v0] Swap error:", error)
      toast.error("Swap failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setSwapping(false)
    }
  }

  const handleReverseTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount("")
    setQuoteResponse(null)
  }

  const fromTokenObj = TOKENS.find((t) => t.symbol === fromToken)
  const toTokenObj = TOKENS.find((t) => t.symbol === toToken)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Swap Tokens</CardTitle>
          <a
            href="https://jup.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Powered by Jupiter <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
              step="0.000001"
              min="0"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="px-4 py-2 rounded-lg bg-input border border-border text-foreground cursor-pointer hover:bg-input/80 transition-colors"
            >
              {TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{fromTokenObj?.name}</p>
        </div>

        <div className="flex justify-center -my-2">
          <button
            onClick={handleReverseTokens}
            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-colors border border-purple-500/20"
          >
            <ArrowDownUp className="w-5 h-5 text-purple-400" />
          </button>
        </div>

        <div className="space-y-2">
          <Label>To (estimated)</Label>
          <div className="flex gap-2">
            <Input type="number" placeholder="0.00" value={toAmount} readOnly className="flex-1 bg-muted/50" />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="px-4 py-2 rounded-lg bg-input border border-border text-foreground cursor-pointer hover:bg-input/80 transition-colors"
            >
              {TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{toTokenObj?.name}</p>
        </div>

        <div className="space-y-2">
          <Label>Slippage Tolerance (%)</Label>
          <div className="flex gap-2">
            {["0.5", "1", "2"].map((val) => (
              <Button
                key={val}
                variant={slippage === val ? "default" : "outline"}
                size="sm"
                onClick={() => setSlippage(val)}
                className="flex-1"
              >
                {val}%
              </Button>
            ))}
            <Input
              type="number"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-20"
              min="0"
              max="50"
            />
          </div>
        </div>

        {quoteResponse && (
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg space-y-2 text-sm border border-purple-500/20">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium text-cyan-400">
                1 {fromToken} ≈ {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)} {toToken}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Impact</span>
              <span className={`font-medium ${quoteResponse.priceImpactPct > 1 ? "text-red-400" : "text-green-400"}`}>
                {quoteResponse.priceImpactPct?.toFixed(2) || "0.00"}%
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSwap}
          disabled={!wallet.connected || !fromAmount || !quoteResponse || loading || swapping}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {swapping
            ? "Swapping..."
            : loading
              ? "Getting Quote..."
              : !wallet.connected
                ? "Connect Wallet"
                : !quoteResponse
                  ? "Enter Amount"
                  : "Swap"}
        </Button>
      </CardContent>
    </Card>
  )
}
