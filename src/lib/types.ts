import { SolanaNetwork } from './solana'

export interface TransactionHistoryItem {
  id: string
  timestamp: number
  network: SolanaNetwork
  signature: string
  explorerUrl: string
  walletAddress: string
  status: 'success' | 'failed'
  message?: string
}
