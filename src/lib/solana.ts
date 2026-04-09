import {
  Connection,
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

export interface RelayResponse {
  success: boolean
  signature: string
  explorerUrl: string
  message: string
}

export async function relayViaAltude(base64Tx: string): Promise<RelayResponse> {
  const apiKey = import.meta.env.VITE_ALTUDE_API_KEY
  
  if (!apiKey) {
    console.warn('VITE_ALTUDE_API_KEY not found - using mock response')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const mockSignature =
      'mock' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    return {
      success: true,
      signature: mockSignature,
      explorerUrl: `https://solscan.io/tx/${mockSignature}?cluster=devnet`,
      message: 'Transaction relayed successfully (mocked - add VITE_ALTUDE_API_KEY to use real API)',
    }
  }

  try {
    const response = await fetch('https://api.altude.io/v1/relay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        signedTransaction: base64Tx,
        network: 'devnet',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Altude API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      success: data.success ?? true,
      signature: data.signature,
      explorerUrl: `https://solscan.io/tx/${data.signature}?cluster=devnet`,
      message: data.message || 'Transaction relayed successfully via Altude',
    }
  } catch (error) {
    console.error('Altude relay error:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to relay transaction via Altude'
    )
  }
}
