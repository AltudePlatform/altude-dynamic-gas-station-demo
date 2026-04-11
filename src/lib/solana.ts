import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token'
import { Buffer } from 'buffer'

export type SolanaNetwork = 'devnet' | 'mainnet-beta'

const ALTUDE_API_BASE = 'https://api.altude.so'
const ALTUDE_FEE_PAYER = 'ALTn7gyjm29WthZGgs4z6WVAK2PK5U6w4FAtPg3TPY71'

export function getConnection(network: SolanaNetwork): Connection {
  return new Connection(clusterApiUrl(network), 'confirmed')
}

export function getTokenMint(): string | undefined {
  return import.meta.env.VITE_TOKEN_MINT || undefined
}

export interface CreateTransactionResult {
  transaction: Transaction
  feePayer: PublicKey
  newAccount: Keypair
}

export async function createAccountTransaction(
  walletPublicKey: string,
  network: SolanaNetwork = 'devnet'
): Promise<CreateTransactionResult> {
  const connection = getConnection(network)
  const feePayer = new PublicKey(ALTUDE_FEE_PAYER)
  const userWallet = new PublicKey(walletPublicKey)
  const newAccount = Keypair.generate()

  const lamports = await connection.getMinimumBalanceForRentExemption(0)

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: feePayer,
    newAccountPubkey: newAccount.publicKey,
    lamports,
    space: 0,
    programId: SystemProgram.programId,
  })

  // Altude requires a SetAuthority instruction to transfer ownership to the fee payer
  const setAuthorityInstruction = createSetAuthorityInstruction(
    newAccount.publicKey,      // account
    newAccount.publicKey,      // current authority
    AuthorityType.AccountOwner, // authority type
    feePayer,                  // new authority
  )

  const transaction = new Transaction()
  transaction.add(createAccountInstruction)
  transaction.add(setAuthorityInstruction)

  // If a token mint is configured, create the user's ATA for it
  const mintAddress = getTokenMint()
  if (mintAddress) {
    const mint = new PublicKey(mintAddress)
    const ata = getAssociatedTokenAddressSync(mint, userWallet)
    const ataInstruction = createAssociatedTokenAccountIdempotentInstruction(
      feePayer,    // payer
      ata,         // associated token account
      userWallet,  // owner
      mint,        // mint
    )
    transaction.add(ataInstruction)
  }

  transaction.feePayer = feePayer

  const blockhash = await getAltudeBlockhash(network)
  transaction.recentBlockhash = blockhash

  // Partially sign with the new account keypair
  transaction.partialSign(newAccount)

  return { transaction, feePayer, newAccount }
}

export interface AltudeApiResponse {
  success: boolean
  signature: string
  explorerUrl: string
  message: string
}

export interface DecodedTransaction {
  signatures: { publicKey: string; signature: string | null }[]
  feePayer: string
  recentBlockhash: string
  instructions: {
    programId: string
    accounts: { pubkey: string; isSigner: boolean; isWritable: boolean }[]
    dataRaw: string
    dataUtf8: string
  }[]
  serializedBytes: number
}

export function decodeTransaction(base64Tx: string): DecodedTransaction {
  const raw = Buffer.from(base64Tx, 'base64')
  const tx = Transaction.from(raw)

  return {
    signatures: tx.signatures.map((s) => ({
      publicKey: s.publicKey.toString(),
      signature: s.signature ? Buffer.from(s.signature).toString('hex') : null,
    })),
    feePayer: tx.feePayer?.toString() || 'unknown',
    recentBlockhash: tx.recentBlockhash || 'unknown',
    instructions: tx.instructions.map((ix) => ({
      programId: ix.programId.toString(),
      accounts: ix.keys.map((k) => ({
        pubkey: k.pubkey.toString(),
        isSigner: k.isSigner,
        isWritable: k.isWritable,
      })),
      dataRaw: Buffer.from(ix.data).toString('hex'),
      dataUtf8: Buffer.from(ix.data).toString('utf-8'),
    })),
    serializedBytes: raw.length,
  }
}

export function formatDecodedTransaction(decoded: DecodedTransaction): string {
  const lines: string[] = []

  lines.push(`═══ Decoded Transaction (${decoded.serializedBytes} bytes) ═══`)
  lines.push('')
  lines.push(`Fee Payer: ${decoded.feePayer}`)
  lines.push(`Recent Blockhash: ${decoded.recentBlockhash}`)
  lines.push('')

  lines.push(`── Signatures (${decoded.signatures.length}) ──`)
  for (const sig of decoded.signatures) {
    lines.push(`  Signer: ${sig.publicKey}`)
    lines.push(`  Signature: ${sig.signature ?? '(not yet signed)'}`)
    lines.push('')
  }

  lines.push(`── Instructions (${decoded.instructions.length}) ──`)
  for (let i = 0; i < decoded.instructions.length; i++) {
    const ix = decoded.instructions[i]
    lines.push(`  [${i}] Program: ${ix.programId}`)
    if (ix.accounts.length > 0) {
      lines.push(`      Accounts:`)
      for (const acc of ix.accounts) {
        const flags = [acc.isSigner ? 'signer' : '', acc.isWritable ? 'writable' : ''].filter(Boolean).join(', ')
        lines.push(`        ${acc.pubkey} (${flags || 'read-only'})`)
      }
    }
    lines.push(`      Data (hex): ${ix.dataRaw}`)
    lines.push(`      Data (utf8): ${ix.dataUtf8}`)
    lines.push('')
  }

  return lines.join('\n')
}

function getExplorerUrl(signature: string, network: SolanaNetwork): string {
  if (network === 'mainnet-beta') {
    return `https://solscan.io/tx/${signature}`
  }
  return `https://solscan.io/tx/${signature}?cluster=devnet`
}

function getApiKey(network: SolanaNetwork): string | undefined {
  if (network === 'mainnet-beta') {
    return import.meta.env.VITE_ALTUDE_API_KEY_MAINNET
  }
  return import.meta.env.VITE_ALTUDE_API_KEY_DEVNET
}

export function getAvailableNetworks(): SolanaNetwork[] {
  const networks: SolanaNetwork[] = []
  if (import.meta.env.VITE_ALTUDE_API_KEY_DEVNET) networks.push('devnet')
  if (import.meta.env.VITE_ALTUDE_API_KEY_MAINNET) networks.push('mainnet-beta')
  return networks
}

function getMockSignature(): string {
  return 'mock' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

async function getAltudeBlockhash(network: SolanaNetwork): Promise<string> {
  const apiKey = getApiKey(network)
  if (!apiKey) {
    throw new Error(`No Altude API key configured for ${network}. Set VITE_ALTUDE_API_KEY_${network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'} in .env`)
  }

  const response = await fetch(`${ALTUDE_API_BASE}/api/Transaction/blockhash`, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.title || `Altude blockhash API error: ${response.status}`)
  }

  const data = await response.json()
  const blockhash = data.Blockhash || data.blockhash
  if (!blockhash) {
    throw new Error('Altude API returned no blockhash')
  }

  return blockhash
}

async function altudeApiCall(
  endpoint: string,
  signedTransaction: string,
  network: SolanaNetwork,
): Promise<Response> {
  const apiKey = getApiKey(network)
  if (!apiKey) {
    throw new Error(`No Altude API key configured for ${network}. Set VITE_ALTUDE_API_KEY_${network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'} in .env`)
  }

  return fetch(`${ALTUDE_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ SignedTransaction: signedTransaction }),
  })
}

export async function createAccount(
  base64Tx: string,
  network: SolanaNetwork = 'devnet'
): Promise<AltudeApiResponse> {
  const apiKey = getApiKey(network)

  if (!apiKey) {
    console.warn(`No Altude API key for ${network} — using mock response`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockSig = getMockSignature()
    return {
      success: true,
      signature: mockSig,
      explorerUrl: getExplorerUrl(mockSig, network),
      message: `Account created on ${network} (mocked — add VITE_ALTUDE_API_KEY_${network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'} for real API)`,
    }
  }

  try {
    const response = await altudeApiCall('/api/Account/create', base64Tx, network)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.title || `Altude API error: ${response.status}`)
    }

    const data = await response.json()
    const signature = data.Signature || data.signature || ''

    if (!signature) {
      throw new Error('Altude API returned no transaction signature — account creation may have failed')
    }

    return {
      success: true,
      signature,
      explorerUrl: getExplorerUrl(signature, network),
      message: `Account created successfully on ${network}`,
    }
  } catch (error) {
    console.error('Altude create account error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create account via Altude'
    )
  }
}

export async function sendTransaction(
  base64Tx: string,
  network: SolanaNetwork = 'devnet'
): Promise<AltudeApiResponse> {
  const apiKey = getApiKey(network)

  if (!apiKey) {
    console.warn(`No Altude API key for ${network} — using mock response`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockSig = getMockSignature()
    return {
      success: true,
      signature: mockSig,
      explorerUrl: getExplorerUrl(mockSig, network),
      message: `Transaction sent on ${network} (mocked — add VITE_ALTUDE_API_KEY_${network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'} for real API)`,
    }
  }

  try {
    const response = await altudeApiCall('/api/Transaction/send', base64Tx, network)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.title || `Altude API error: ${response.status}`)
    }

    const data = await response.json()
    const signature = data.Signature || data.signature || ''

    if (!signature) {
      throw new Error('Altude API returned no transaction signature — transaction may have failed')
    }

    return {
      success: true,
      signature,
      explorerUrl: getExplorerUrl(signature, network),
      message: `Transaction sent successfully on ${network}`,
    }
  } catch (error) {
    console.error('Altude send transaction error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to send transaction via Altude'
    )
  }
}
