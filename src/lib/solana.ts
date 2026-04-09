import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js'
import { Buffer } from 'buffer'
import type { WalletAdapter } from './dynamic-wallet'

export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

export interface CreateTransactionResult {
  transaction: Transaction
  feePayer: PublicKey
}

export async function createMemoTransaction(
  walletPublicKey: string
): Promise<CreateTransactionResult> {
  const feePayer = new PublicKey(walletPublicKey)
  
  const memoText = 'Gasless transaction via Altude relay'
  const encoder = new TextEncoder()
  const memoData = encoder.encode(memoText)
  
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    data: Buffer.from(memoData),
  })

  const transaction = new Transaction()
  transaction.add(memoInstruction)
  transaction.feePayer = feePayer
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  return { transaction, feePayer }
}

export interface SignTransactionResult {
  signedTransaction: Transaction
  base64Transaction: string
}

export async function signTransaction(
  transaction: Transaction,
  wallet: WalletAdapter
): Promise<SignTransactionResult> {
  const signedTransaction = await wallet.signTransaction(transaction)
  
  const serialized = signedTransaction.serialize()
  const base64Transaction = serialized.toString('base64')
  
  return {
    signedTransaction,
    base64Transaction,
  }
}

export interface RelayResponse {
  success: boolean
  signature: string
  explorerUrl: string
  message: string
}

export async function relayViaAltude(base64Tx: string): Promise<RelayResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  const mockSignature =
    'mock' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  return {
    success: true,
    signature: mockSignature,
    explorerUrl: `https://solscan.io/tx/${mockSignature}?cluster=devnet`,
    message: 'Transaction relayed successfully via Altude (mocked)',
  }
}
