'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface WalletConnectionProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if phantom wallet is available
    const checkWallet = async () => {
      const { solana } = window as any
      if (solana?.isPhantom) {
        try {
          const response = await solana.connect({ onlyIfTrusted: true })
          setPublicKey(response.publicKey.toString())
          setConnected(true)
          onConnect(response.publicKey.toString())
        } catch (err) {
          console.log('No trusted connection found')
        }
      }
    }
    
    checkWallet()
  }, [onConnect])

  const connectWallet = async () => {
    setLoading(true)
    try {
      const { solana } = window as any
      if (!solana?.isPhantom) {
        alert('Please install Phantom wallet extension')
        setLoading(false)
        return
      }

      const response = await solana.connect()
      const address = response.publicKey.toString()
      
      setPublicKey(address)
      setConnected(true)
      onConnect(address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any
      if (solana?.isPhantom) {
        await solana.disconnect()
      }
      setPublicKey('')
      setConnected(false)
      onDisconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return (
    <Card className="border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {connected ? 'Connected to Phantom wallet' : 'Connect your wallet to start trading'}
          </p>
        </div>
        
        {!connected ? (
          <Button 
            onClick={connectWallet}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="text-right">
            <p className="text-sm text-accent font-medium mb-2">
              {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </p>
            <Button 
              onClick={disconnectWallet}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-card"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
