import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Wallet, Lightning, Globe, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core'
import { SolanaWalletConnectors } from '@dynamic-labs/solana'
import {
  createMemoTransaction,
  relayViaAltude,
  type CreateTransactionResult,
  type RelayResponse,
  type SolanaNetwork,
} from '@/lib/solana'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Transaction } from '@solana/web3.js'
import { useKV } from '@github/spark/hooks'
import { TransactionHistoryItem } from '@/lib/types'
import { TransactionHistory } from '@/components/TransactionHistory'

function DemoContent() {
  const { primaryWallet } = useDynamicContext()
  const [network, setNetwork] = useState<SolanaNetwork>('devnet')
  const [transaction, setTransaction] = useState<CreateTransactionResult | null>(null)
  const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null)
  const [relayResponse, setRelayResponse] = useState<RelayResponse | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [isRelaying, setIsRelaying] = useState(false)
  const [history, setHistory] = useKV<TransactionHistoryItem[]>('transaction-history', [])

  const walletConnected = !!primaryWallet
  const walletAddress = primaryWallet?.address || null

  const handleCreateTransaction = async () => {
    if (!walletAddress) return

    setIsCreating(true)
    try {
      const result = await createMemoTransaction(walletAddress, network)
      setTransaction(result)
      setSignedTxBase64(null)
      setRelayResponse(null)
      toast.success(`Transaction created on ${network}`)
    } catch (error) {
      toast.error('Failed to create transaction')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSignTransaction = async () => {
    if (!transaction || !primaryWallet) return

    setIsSigning(true)
    try {
      const solanaConnector = primaryWallet.connector as any
      const signedTx = await solanaConnector.signTransaction(transaction.transaction)
      
      const serialized = signedTx.serialize()
      const base64Transaction = serialized.toString('base64')
      
      setSignedTxBase64(base64Transaction)
      setRelayResponse(null)
      toast.success('Transaction signed by Dynamic wallet')
    } catch (error) {
      toast.error('Failed to sign transaction')
      console.error(error)
    } finally {
      setIsSigning(false)
    }
  }

  const handleSendGasless = async () => {
    if (!signedTxBase64 || !walletAddress) return

    setIsRelaying(true)
    try {
      const result = await relayViaAltude(signedTxBase64, network)
      setRelayResponse(result)
      toast.success('Transaction relayed via Altude')
      
      const historyItem: TransactionHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: Date.now(),
        network,
        signature: result.signature,
        explorerUrl: result.explorerUrl,
        walletAddress,
        status: result.success ? 'success' : 'failed',
        message: result.message,
      }
      
      setHistory((currentHistory) => [historyItem, ...(currentHistory || [])])
    } catch (error) {
      toast.error('Failed to relay transaction')
      console.error(error)
    } finally {
      setIsRelaying(false)
    }
  }

  const handleNetworkChange = (newNetwork: SolanaNetwork) => {
    setNetwork(newNetwork)
    setTransaction(null)
    setSignedTxBase64(null)
    setRelayResponse(null)
    toast.info(`Switched to ${newNetwork}`)
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success('Transaction history cleared')
  }

  const truncateString = (str: string, start = 20, end = 20) => {
    if (str.length <= start + end) return str
    return `${str.slice(0, start)}...${str.slice(-end)}`
  }

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
                  Gasless Transaction Demo
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Dynamic Wallet + Altude Relay
                </CardDescription>
              </div>
              <DynamicWidget />
            </div>

          {walletConnected && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground">Network:</label>
              <Select value={network} onValueChange={handleNetworkChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devnet">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">Dev</Badge>
                      <span>Devnet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mainnet-beta">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Live</Badge>
                      <span>Mainnet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!walletConnected ? (
            <div className="pt-6">
              <div className="p-8 bg-muted/50 rounded-lg border border-border text-center space-y-4">
                <Wallet size={48} weight="duotone" className="text-primary mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with Dynamic wallet to start the gasless transaction flow
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click the "Connect Wallet" button above
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="pt-2">
                <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">Connected</Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {truncateString(walletAddress || '', 8, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex flex-col items-center gap-2">
                    <Wallet size={28} weight="duotone" className="text-primary" />
                    <span className="text-xs font-medium">Dynamic</span>
                  </div>
                  <ArrowRight size={20} className="text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={28} weight="duotone" className="text-accent" />
                    <span className="text-xs font-medium">Sign Tx</span>
                  </div>
                  <ArrowRight size={20} className="text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="flex flex-col items-center gap-2">
                    <Lightning size={28} weight="duotone" className="text-accent" />
                    <span className="text-xs font-medium">Altude</span>
                  </div>
                  <ArrowRight size={20} className="text-muted-foreground rotate-90 md:rotate-0" />
                  <div className="flex flex-col items-center gap-2">
                    <Globe size={28} weight="duotone" className="text-primary" />
                    <span className="text-xs font-medium">Solana</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardHeader>

        {walletConnected && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={handleCreateTransaction}
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? 'Creating...' : '1. Create Transaction'}
                </Button>
                {transaction && (
                  <div className="p-3 bg-muted/30 rounded-md border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Created</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Fee payer: {truncateString(transaction.feePayer.toString(), 8, 8)}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  onClick={handleSignTransaction}
                  disabled={!transaction || isSigning}
                  className="w-full"
                  size="lg"
                >
                  {isSigning ? 'Signing...' : '2. Sign with Dynamic Wallet'}
                </Button>
                <p className="text-xs text-muted-foreground px-1">
                  ⓘ Dynamic wallet handles the transaction signing securely
                </p>
                {signedTxBase64 && (
                  <div className="p-3 bg-muted/30 rounded-md border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Signed</Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-2 break-all">
                      {truncateString(signedTxBase64, 32, 32)}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  onClick={handleSendGasless}
                  disabled={!signedTxBase64 || isRelaying}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  {isRelaying ? 'Relaying...' : '3. Send Gasless via Altude'}
                </Button>
                {relayResponse && (
                  <div className="p-3 bg-accent/10 rounded-md border border-accent/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-accent text-accent-foreground">
                        {relayResponse.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-foreground">
                        Signature: {truncateString(relayResponse.signature, 12, 12)}
                      </p>
                      <a
                        href={relayResponse.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                      >
                        View on Solscan <ArrowRight size={12} />
                      </a>
                      <p className="text-xs text-muted-foreground pt-2">{relayResponse.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="bg-muted/20 p-4 rounded-md space-y-2">
              <h3 className="text-sm font-semibold">How it works:</h3>
              <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                <li>Dynamic wallet manages user authentication and transaction signing</li>
                <li>Altude does not replace your wallet - it complements it</li>
                <li>Signed transactions are relayed through Altude to the Solana blockchain</li>
                <li>Altude covers the gas fees, enabling gasless user experiences</li>
                <li>Users maintain full control through their Dynamic wallet</li>
              </ul>
              <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {import.meta.env.VITE_ALTUDE_API_KEY ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-accent" weight="fill" />
                      <span className="font-medium text-accent">Real Altude API active</span>
                    </span>
                  ) : (
                    <span>
                      ℹ️ Using mock relay - add <code className="bg-muted px-1 rounded">VITE_ALTUDE_API_KEY</code> to use real API
                    </span>
                  )}
                </p>
                <Badge variant="outline" className={network === 'mainnet-beta' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-accent/10 text-accent border-accent/30'}>
                  {network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {walletConnected && (
        <TransactionHistory history={history || []} onClear={handleClearHistory} />
      )}
    </div>
    </div>
  )
}

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'test-environment-id',
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      <DemoContent />
    </DynamicContextProvider>
  )
}

export default App
