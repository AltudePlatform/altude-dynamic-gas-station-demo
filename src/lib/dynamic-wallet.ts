import { Keypair, Transaction } from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: string | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
}

class MockDynamicWallet implements WalletAdapter {
  publicKey: string | null = null
  connected: boolean = false
  private keypair: Keypair | null = null

  async connect(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    this.keypair = Keypair.generate()
    this.publicKey = this.keypair.publicKey.toString()
    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.publicKey = null
    this.connected = false
    this.keypair = null
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected || !this.keypair) {
      throw new Error('Wallet not connected')
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    
    transaction.sign(this.keypair)
    return transaction
  }
}

export const dynamicWallet = new MockDynamicWallet()
