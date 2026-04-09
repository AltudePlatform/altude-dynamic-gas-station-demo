import { Transaction, VersionedTransaction } from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: string | null
  connected: boolean
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
}
