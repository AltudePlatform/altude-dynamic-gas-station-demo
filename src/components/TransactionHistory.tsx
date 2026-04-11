import { TransactionHistoryItem } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle, Trash, ArrowSquareOut } from '@phosphor-icons/react'

interface TransactionHistoryProps {
  history: TransactionHistoryItem[]
  onClear: () => void
}

export function TransactionHistory({ history, onClear }: TransactionHistoryProps) {
  const truncate = (s: string, n = 8) => s.length <= n * 2 + 3 ? s : `${s.slice(0, n)}...${s.slice(-n)}`

  const formatDate = (timestamp: number) => {
    const diffMs = Date.now() - timestamp
    const mins = Math.floor(diffMs / 60000)
    const hrs = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 7) return `${days}d ago`

    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-8 py-10 text-center">
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          History ({history.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive text-xs"
        >
          <Trash size={14} className="mr-1.5" />
          Clear
        </Button>
      </div>

      <ScrollArea className="h-[320px]">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-5 px-6 py-5 rounded-lg border border-border bg-card"
            >
              {item.status === 'success' ? (
                <CheckCircle size={18} weight="fill" className="text-primary shrink-0" />
              ) : (
                <XCircle size={18} weight="fill" className="text-destructive shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm text-foreground truncate">
                    {truncate(item.signature, 10)}
                  </code>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {item.network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
                  </Badge>
                </div>
                {item.message && (
                  <p className="text-xs text-muted-foreground truncate mt-1">{item.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</span>
                <a
                  href={item.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                  aria-label="View on explorer"
                >
                  <ArrowSquareOut size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
