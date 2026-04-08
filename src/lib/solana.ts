import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js'
import { Buffer } from 'buffer'

export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

export interface CreateTransactionResult {
  transaction: Transaction
  feePayer: PublicKey
}

export async function createMemoTransaction(): Promise<CreateTransactionResult> {
  const feePayer = Keypair.generate()
  
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
  transaction.feePayer = feePayer.publicKey
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  return { transaction, feePayer: feePayer.publicKey }
}

export interface SignTransactionResult {
  signedTransaction: Transaction
  base64Transaction: string
}

export async function signTransaction(
  transaction: Transaction
): Promise<SignTransactionResult> {
  const simulatedWalletKeypair = Keypair.generate()
  
  transaction.sign(simulatedWalletKeypair)
  
  const serialized = transaction.serialize()
  const base64Transaction = serialized.toString('base64')
  
  return {
    signedTransaction: transaction,
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
    message: 'Transaction relayed successfully (mocked)',
  }
}
