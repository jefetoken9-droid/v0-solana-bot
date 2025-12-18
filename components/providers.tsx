"use client"

import type React from "react"
import { useMemo } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
// WalletModalProvider removed to avoid dependency on @solana/wallet-adapter-react-ui
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { Toaster } from "sonner"
import { PhantomProvider, darkTheme } from "@phantom/react-sdk"
import { RPC_ENDPOINT } from "@/lib/solana-config"

// styles from @solana/wallet-adapter-react-ui removed

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
        <PhantomProvider
          config={{
            providers: ["google", "apple", "injected"],
            appId: "dd7ac22c-e616-4923-b321-ca1e7baf34cf",
            addressTypes: ["Ethereum", "Solana", "BitcoinSegwit", "Sui"],
            authOptions: {
              redirectUrl: "https://yourapp.com/auth/callback",
            },
          }}
          theme={darkTheme}
          appIcon="https://phantom-portal20240925173430423400000001.s3.ca-central-1.amazonaws.com/icons/5a712be6-3157-47e8-950d-27e16ab0bba9.jpg"
          appName="Diamante"
        >
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </PhantomProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
