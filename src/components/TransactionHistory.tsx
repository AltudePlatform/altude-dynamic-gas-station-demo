import { TransactionHistoryItem } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, CheckCircle, XCircle, Trash } from '@phosphor-icons/react'
import { Separator } from '@/components/ui/separator'

interface TransactionHistoryProps {
  history: TransactionHistoryItem[]
  onClear: () => void
}

export function TransactionHistory({ history, onClear }: TransactionHistoryProps) {
  const truncateString = (str: string, start = 12, end = 12) => {
    if (str.length <= start + end) return str
    return `${str.slice(0, start)}...${str.slice(-end)}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Transaction History</CardTitle>
          <CardDescription>Past gasless transactions will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckCircle size={32} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete a gasless transaction to see it here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Transaction History</CardTitle>
            <CardDescription>
              {history.length} transaction{history.length !== 1 ? 's' : ''} relayed
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClear}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash size={16} className="mr-2" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={item.id}>
                <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'success' ? (
                        <CheckCircle size={20} weight="fill" className="text-accent" />
                      ) : (
                        <XCircle size={20} weight="fill" className="text-destructive" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={
                          item.network === 'mainnet-beta' 
                            ? 'bg-primary/10 text-primary border-primary/30' 
                            : 'bg-accent/10 text-accent border-accent/30'
                        }
                      >
                        {item.network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Wallet</p>
                      <p className="text-xs font-mono text-foreground">
                        {truncateString(item.walletAddress, 8, 8)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Signature</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-foreground flex-1">
                          {truncateString(item.signature, 10, 10)}
                        </p>
                        <a
                          href={item.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                          View <ArrowRight size={12} />
                        </a>
                      </div>
                    </div>

                    {item.message && (
                      <p className="text-xs text-muted-foreground pt-1">
                        {item.message}
                      </p>
                    )}
                  </div>
                </div>
                {index < history.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
