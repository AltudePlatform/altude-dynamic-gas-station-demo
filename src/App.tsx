import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle, Lightning, Wallet, Globe, Copy, ArrowSquareOut } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core'
import { SolanaWalletConnectors } from '@dynamic-labs/solana'
import { isSolanaWallet } from '@dynamic-labs/solana'
import {
  createAccountTransaction,
  createAccount,
  sendTransaction,
  decodeTransaction,
  formatDecodedTransaction,
  getAvailableNetworks,
  getTokenMint,
  type CreateTransactionResult,
  type AltudeApiResponse,
  type SolanaNetwork,
} from '@/lib/solana'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionHistoryItem } from '@/lib/types'
import { TransactionHistory } from '@/components/TransactionHistory'

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored((prev) => {
      const next = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])

  return [stored, setValue]
}

function StepIndicator({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all
        ${done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary/15 text-primary ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'}
      `}>
        {done ? <CheckCircle size={18} weight="bold" /> : number}
      </div>
      <span className={`text-xs font-medium ${done ? 'text-primary' : active ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div className="flex-1 h-12 flex items-center">
      <div className={`w-full h-0.5 rounded-full transition-colors ${done ? 'bg-primary' : 'bg-border'}`} />
    </div>
  )
}

function ResponseCard({ response, label }: { response: AltudeApiResponse; label: string }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-10 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} weight="fill" className="text-primary" />
          <span className="text-sm font-medium text-primary">{label}</span>
        </div>
        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
          {response.success ? 'Success' : 'Failed'}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <code className="text-xs text-muted-foreground flex-1 truncate">
            {response.signature}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(response.signature); toast.success('Signature copied') }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Copy signature"
          >
            <Copy size={14} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={response.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
          >
            View on Solscan <ArrowSquareOut size={12} />
          </a>
          <span className="text-xs text-muted-foreground">{response.message}</span>
        </div>
      </div>
    </div>
  )
}

function DemoContent() {
  const { primaryWallet, user } = useDynamicContext()
  const [network, setNetwork] = useState<SolanaNetwork>('devnet')
  const availableNetworks = getAvailableNetworks()
  const tokenMint = getTokenMint()
  const [transaction, setTransaction] = useState<CreateTransactionResult | null>(null)
  const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null)
  const [decodedTxText, setDecodedTxText] = useState<string | null>(null)
  const [createAccountResponse, setCreateAccountResponse] = useState<AltudeApiResponse | null>(null)
  const [sendResponse, setSendResponse] = useState<AltudeApiResponse | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showDecoded, setShowDecoded] = useState(false)
  const [history, setHistory] = useLocalStorage<TransactionHistoryItem[]>('transaction-history', [])

  const isAuthenticated = !!user
  const walletReady = !!primaryWallet
  const walletAddress = primaryWallet?.address || null

  const currentStep = !transaction ? 1 : !signedTxBase64 ? 2 : !createAccountResponse ? 3 : !sendResponse ? 4 : 5

  const handleCreateTransaction = async () => {
    if (!walletAddress) return
    setIsCreating(true)
    try {
      const result = await createAccountTransaction(walletAddress, network)
      setTransaction(result)
      setSignedTxBase64(null)
      setDecodedTxText(null)
      setCreateAccountResponse(null)
      setSendResponse(null)
      setShowDecoded(false)
      toast.success('Transaction created — sign with your wallet')
    } catch (error) {
      toast.error('Failed to create transaction')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSignTransaction = async () => {
    if (!transaction || !primaryWallet || !isSolanaWallet(primaryWallet)) return
    setIsSigning(true)
    try {
      const signer = await primaryWallet.getSigner()
      const signed = await signer.signTransaction(transaction.transaction as any)

      // Re-apply newAccount partial signature if the wallet adapter dropped it
      const newAccountSig = signed.signatures.find(
        (s: any) => s.publicKey.equals(transaction.newAccount.publicKey)
      )
      if (!newAccountSig?.signature) {
        signed.partialSign(transaction.newAccount)
      }

      const serialized = signed.serialize({ verifySignatures: false })
      const base64Transaction = Buffer.from(serialized).toString('base64')
      setSignedTxBase64(base64Transaction)
      const decoded = decodeTransaction(base64Transaction)
      setDecodedTxText(formatDecodedTransaction(decoded))
      toast.success('Transaction signed')
    } catch (error) {
      toast.error('Failed to sign transaction')
      console.error(error)
    } finally {
      setIsSigning(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!signedTxBase64 || !walletAddress) return
    setIsCreatingAccount(true)
    try {
      const result = await createAccount(signedTxBase64, network)
      setCreateAccountResponse(result)
      toast.success('Account created')
      setHistory((h) => [{
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: Date.now(),
        network,
        signature: result.signature,
        explorerUrl: result.explorerUrl,
        walletAddress,
        status: result.success ? 'success' : 'failed',
        message: result.message,
      }, ...h])
    } catch (error) {
      toast.error('Failed to create account')
      console.error(error)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleSendTransaction = async () => {
    if (!signedTxBase64 || !walletAddress) return
    setIsSending(true)
    try {
      const result = await sendTransaction(signedTxBase64, network)
      setSendResponse(result)
      toast.success('Transaction sent')
      setHistory((h) => [{
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: Date.now(),
        network,
        signature: result.signature,
        explorerUrl: result.explorerUrl,
        walletAddress,
        status: result.success ? 'success' : 'failed',
        message: result.message,
      }, ...h])
    } catch (error) {
      toast.error('Failed to send transaction')
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleNetworkChange = (value: SolanaNetwork) => {
    setNetwork(value)
    setTransaction(null)
    setSignedTxBase64(null)
    setDecodedTxText(null)
    setCreateAccountResponse(null)
    setSendResponse(null)
    setShowDecoded(false)
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success('History cleared')
  }

  const truncate = (s: string, n = 6) => s.length <= n * 2 + 3 ? s : `${s.slice(0, n)}...${s.slice(-n)}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lightning size={20} weight="fill" className="text-primary" />
            <h1 className="text-base font-semibold tracking-tight">Altude Gas Station</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && walletReady && (
              <Select value={network} onValueChange={handleNetworkChange}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devnet" disabled={!availableNetworks.includes('devnet')}>
                    Devnet{!availableNetworks.includes('devnet') ? ' (no key)' : ''}
                  </SelectItem>
                  <SelectItem value="mainnet-beta" disabled={!availableNetworks.includes('mainnet-beta')}>
                    Mainnet{!availableNetworks.includes('mainnet-beta') ? ' (no key)' : ''}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <DynamicWidget />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-12 py-16 space-y-12">
        {/* Not authenticated */}
        {!isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-10">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet size={30} weight="duotone" className="text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Gasless Transactions on Solana</h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Sign in with your email to get an embedded wallet and send transactions without paying gas fees.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              <div className="flex items-center gap-2 text-xs">
                <Wallet size={14} />
                <span>Sign in</span>
              </div>
              <ArrowRight size={12} />
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle size={14} />
                <span>Create tx</span>
              </div>
              <ArrowRight size={12} />
              <div className="flex items-center gap-2 text-xs">
                <Lightning size={14} />
                <span>Altude relays</span>
              </div>
              <ArrowRight size={12} />
              <div className="flex items-center gap-2 text-xs">
                <Globe size={14} />
                <span>On-chain</span>
              </div>
            </div>
          </div>
        )}

        {/* Provisioning */}
        {isAuthenticated && !walletReady && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
              <Wallet size={26} weight="duotone" className="text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Setting up your wallet</h2>
              <p className="text-sm text-muted-foreground">
                Provisioning your embedded Solana wallet...
              </p>
            </div>
          </div>
        )}

        {/* Main flow */}
        {walletReady && (
          <>
            {/* Wallet info bar */}
            <div className="flex items-center justify-between px-8 py-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Connected</span>
                <code className="text-sm text-foreground">{truncate(walletAddress || '', 8)}</code>
              </div>
              <Badge variant="outline" className="text-xs">
                {network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
              </Badge>
            </div>

            {/* Progress steps */}
            <div className="flex items-start px-10 py-8 rounded-xl bg-card border border-border">
              <StepIndicator number={1} label="Create" active={currentStep === 1} done={currentStep > 1} />
              <StepConnector done={currentStep > 1} />
              <StepIndicator number={2} label="Sign" active={currentStep === 2} done={currentStep > 2} />
              <StepConnector done={currentStep > 2} />
              <StepIndicator number={3} label="Register" active={currentStep === 3} done={currentStep > 3} />
              <StepConnector done={currentStep > 3} />
              <StepIndicator number={4} label="Send" active={currentStep === 4} done={currentStep > 4} />
            </div>

            {/* Action cards */}
            <div className="space-y-10">
              {/* Step 1 */}
              <div className="rounded-xl border border-border bg-card px-10 py-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">01</span>
                    <span className="text-sm font-medium">Create Transaction</span>
                  </div>
                  {transaction && <Badge variant="outline" className="text-xs text-primary border-primary/30">Done</Badge>}
                </div>
                <div className="flex justify-center py-8">
                  <Button
                    onClick={handleCreateTransaction}
                    disabled={isCreating}
                    size="lg"
                    style={{ padding: '14px 40px' }}
                  >
                    {isCreating ? 'Creating...' : 'Create Account Transaction'}
                  </Button>
                </div>
                {transaction && (
                  <p className="text-xs text-muted-foreground">
                    Fee payer: <code className="text-foreground">{truncate(transaction.feePayer.toString(), 8)}</code>
                  </p>
                )}
              </div>

              {/* Step 1 - Transaction details */}
              {signedTxBase64 && (
                <div className="rounded-xl border border-border bg-card px-10 py-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground">TX</span>
                      <span className="text-sm font-medium">Transaction Details</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">Ready</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground flex-1 truncate">{signedTxBase64}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(signedTxBase64); toast.success('Copied') }}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
                        aria-label="Copy transaction"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    {decodedTxText && (
                      <>
                        <button
                          onClick={() => setShowDecoded(!showDecoded)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          {showDecoded ? 'Hide' : 'Show'} decoded transaction
                        </button>
                        {showDecoded && (
                          <pre className="text-xs font-mono text-muted-foreground bg-background rounded-md p-3 overflow-x-auto max-h-64 overflow-y-auto border border-border">
{decodedTxText}
                          </pre>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 — Sign */}
              <div className={`rounded-xl border bg-card px-10 py-10 space-y-8 transition-opacity ${!transaction || signedTxBase64 ? 'opacity-40 pointer-events-none' : ''} border-border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">02</span>
                    <span className="text-sm font-medium">Sign with Wallet</span>
                  </div>
                  {signedTxBase64 && <Badge variant="outline" className="text-xs text-primary border-primary/30">Signed</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Your wallet signs to authorize the close-authority transfer.
                </p>
                <div className="flex justify-center py-8">
                  <Button
                    onClick={handleSignTransaction}
                    disabled={!transaction || !!signedTxBase64 || isSigning}
                    size="lg"
                    variant="secondary"
                    style={{ padding: '14px 40px' }}
                  >
                    {isSigning ? 'Signing...' : 'Sign Transaction'}
                  </Button>
                </div>
              </div>

              {/* Step 3 — Register */}
              <div className={`rounded-xl border bg-card px-10 py-10 space-y-8 transition-opacity ${!signedTxBase64 ? 'opacity-40 pointer-events-none' : ''} border-border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">03</span>
                    <span className="text-sm font-medium">Create Account via Altude</span>
                  </div>
                  {createAccountResponse && <Badge variant="outline" className="text-xs text-primary border-primary/30">Registered</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Registers a gas station account for this wallet on-chain.
                </p>
                <div className="flex justify-center py-8">
                  <Button
                    onClick={handleCreateAccount}
                    disabled={!signedTxBase64 || isCreatingAccount}
                    size="lg"
                    variant="secondary"
                    style={{ padding: '14px 40px' }}
                  >
                    {isCreatingAccount ? 'Registering...' : 'Register Account'}
                  </Button>
                </div>
                {createAccountResponse && <ResponseCard response={createAccountResponse} label="Account Registered" />}
              </div>

              {/* Step 4 — Send */}
              <div className={`rounded-xl border bg-card px-10 py-10 space-y-8 transition-opacity ${!signedTxBase64 ? 'opacity-40 pointer-events-none' : ''} border-border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">04</span>
                    <span className="text-sm font-medium">Send via Altude Relay</span>
                  </div>
                  {sendResponse && <Badge variant="outline" className="text-xs text-primary border-primary/30">Sent</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {tokenMint
                    ? 'Relays the signed transaction through Altude — gas fees covered.'
                    : <>No token mint configured. Set <code className="bg-secondary px-1 rounded">VITE_TOKEN_MINT</code> to enable.</>}
                </p>
                <div className="flex justify-center py-8">
                  <Button
                    onClick={handleSendTransaction}
                    disabled={!signedTxBase64 || isSending || !tokenMint}
                    size="lg"
                    style={{ padding: '14px 40px' }}
                  >
                    {isSending ? 'Sending...' : 'Send Transaction'}
                  </Button>
                </div>
                {sendResponse && <ResponseCard response={sendResponse} label="Transaction Sent" />}
              </div>
            </div>

            {/* API status */}
            <div className="flex items-center justify-between px-8 py-6 rounded-xl bg-card border border-border text-sm">
              {availableNetworks.includes(network) ? (
                <span className="flex items-center gap-1.5 text-primary">
                  <CheckCircle size={14} weight="fill" />
                  Altude API connected ({network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No API key for {network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'} — add <code className="bg-secondary px-1 rounded">VITE_ALTUDE_API_KEY_{network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'}</code>
                </span>
              )}
            </div>

            {/* History */}
            <TransactionHistory history={history} onClear={handleClearHistory} />
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'test-environment-id',
        walletConnectors: [SolanaWalletConnectors],
        overrides: {
          evmNetworks: () => [],
        },
      }}
    >
      <DemoContent />
      <Toaster richColors position="bottom-right" theme="dark" />
    </DynamicContextProvider>
  )
}

export default App
