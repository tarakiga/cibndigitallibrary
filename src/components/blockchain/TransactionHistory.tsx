import React, { useState } from 'react';
import { History, ExternalLink, Filter, ChevronDown, ChevronUp, Hash, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { useCertificateTransactions } from '@/hooks/useBlockchain';
import { BlockchainNetwork, BlockchainTransaction, TransactionStatus } from '@/types/blockchain';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TransactionHistoryProps {
  certificateId: string;
  network?: BlockchainNetwork;
  maxHeight?: string;
}

const getStatusColor = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.CONFIRMED:
      return 'bg-green-600';
    case TransactionStatus.PENDING:
      return 'bg-yellow-600';
    case TransactionStatus.FAILED:
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
};

const getStatusLabel = (status: TransactionStatus): string => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const TransactionItem: React.FC<{ transaction: BlockchainTransaction; network: BlockchainNetwork }> = ({
  transaction,
  network,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getExplorerUrl = (txHash: string): string => {
    switch (network) {
      case BlockchainNetwork.ETHEREUM_MAINNET:
        return `https://etherscan.io/tx/${txHash}`;
      case BlockchainNetwork.ETHEREUM_SEPOLIA:
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case BlockchainNetwork.POLYGON_MAINNET:
        return `https://polygonscan.com/tx/${txHash}`;
      case BlockchainNetwork.POLYGON_MUMBAI:
        return `https://mumbai.polygonscan.com/tx/${txHash}`;
      default:
        return '#';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-4 space-y-3">
        {/* Transaction Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm font-medium truncate">
                {transaction.type?.replace('_', ' ').toUpperCase() || 'Transaction'}
              </p>
              <Badge
                variant="secondary"
                className={`${getStatusColor(transaction.status)} text-white`}
              >
                {getStatusLabel(transaction.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span className="font-mono truncate">{transaction.transactionHash}</span>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Transaction Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}</span>
          </div>
          {transaction.blockNumber && (
            <div className="flex items-center gap-1">
              <span>Block #{transaction.blockNumber}</span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="bg-muted rounded-md p-3 space-y-2 text-sm">
            {/* From */}
            {transaction.from && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-0.5">From</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {transaction.from}
                  </p>
                </div>
              </div>
            )}

            {/* To */}
            {transaction.to && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-0.5">To</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {transaction.to}
                  </p>
                </div>
              </div>
            )}

            {/* Gas Used */}
            {transaction.gasUsed && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Gas Used</span>
                <span className="text-xs font-medium">{transaction.gasUsed.toLocaleString()}</span>
              </div>
            )}

            {/* Fee */}
            {transaction.fee && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Transaction Fee</span>
                <span className="text-xs font-medium">{transaction.fee}</span>
              </div>
            )}

            {/* Full Timestamp */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Timestamp</span>
              <span className="text-xs font-medium">
                {new Date(transaction.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Confirmations */}
            {transaction.confirmations !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Confirmations</span>
                <span className="text-xs font-medium">{transaction.confirmations}</span>
              </div>
            )}
          </div>

          {/* Data */}
          {transaction.data && (
            <div>
              <p className="text-xs font-medium mb-1">Transaction Data</p>
              <div className="bg-muted rounded-md p-2 max-h-32 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {typeof transaction.data === 'string'
                    ? transaction.data
                    : JSON.stringify(transaction.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Explorer Link */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <a
              href={getExplorerUrl(transaction.transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  certificateId,
  network = BlockchainNetwork.HYPERLEDGER_FABRIC,
  maxHeight = '500px',
}) => {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');

  const { data: transactions, isLoading, error } = useCertificateTransactions(certificateId, network);

  // Filter transactions by status
  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    if (statusFilter === 'all') return transactions;
    return transactions.filter((tx) => tx.status === statusFilter);
  }, [transactions, statusFilter]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Loading transaction history...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load transaction history. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>No blockchain transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This certificate doesn't have any blockchain transactions yet. Transactions will appear
              here once the certificate is anchored to the blockchain.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
            </CardDescription>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TransactionStatus | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={TransactionStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={TransactionStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={TransactionStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="space-y-3 overflow-auto pr-2"
          style={{ maxHeight }}
        >
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.transactionHash}
              transaction={transaction}
              network={network}
            />
          ))}
        </div>

        {filteredTransactions.length === 0 && statusFilter !== 'all' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No transactions found with status: {getStatusLabel(statusFilter as TransactionStatus)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
