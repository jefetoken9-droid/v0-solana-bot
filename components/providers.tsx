"use client"

import type React from "react"
import { useMemo } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { Toaster } from "sonner"
import { RPC_ENDPOINT } from "@/lib/solana-config"

require("@solana/wallet-adapter-react-ui/styles.css")

export default function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet

  const endpoint = useMemo(() => {
    const url = RPC_ENDPOINT
    console.log("[v0] RPC Endpoint:", url)
    return url
  }, [])

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
