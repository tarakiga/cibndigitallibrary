import React from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Server, TrendingUp, Zap } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useBlockchain';
import { BlockchainNetwork, NetworkStatus } from '@/types/blockchain';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BlockchainStatusProps {
  network: BlockchainNetwork;
  variant?: 'default' | 'compact' | 'minimal';
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const getStatusColor = (status?: NetworkStatus): string => {
  switch (status) {
    case NetworkStatus.ONLINE:
      return 'text-green-600 bg-green-50 border-green-200';
    case NetworkStatus.SYNCING:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case NetworkStatus.OFFLINE:
      return 'text-red-600 bg-red-50 border-red-200';
    case NetworkStatus.DEGRADED:
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status?: NetworkStatus) => {
  switch (status) {
    case NetworkStatus.ONLINE:
      return <CheckCircle className="h-4 w-4" />;
    case NetworkStatus.SYNCING:
      return <Clock className="h-4 w-4 animate-pulse" />;
    case NetworkStatus.OFFLINE:
      return <AlertCircle className="h-4 w-4" />;
    case NetworkStatus.DEGRADED:
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Server className="h-4 w-4" />;
  }
};

const getStatusLabel = (status?: NetworkStatus): string => {
  if (!status) return 'Unknown';
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const formatNetworkName = (network: BlockchainNetwork): string => {
  return network
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const BlockchainStatus: React.FC<BlockchainStatusProps> = ({
  network,
  variant = 'default',
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const { data: networkData, isLoading } = useNetworkStatus(network, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  if (isLoading) {
    if (variant === 'minimal') {
      return <Skeleton className="h-6 w-24" />;
    }
    if (variant === 'compact') {
      return <Skeleton className="h-10 w-48" />;
    }
    return <Skeleton className="h-32 w-full" />;
  }

  // Minimal variant - just a status indicator
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1.5', getStatusColor(networkData?.status))}
            >
              {getStatusIcon(networkData?.status)}
              <span className="text-xs font-medium">{getStatusLabel(networkData?.status)}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {formatNetworkName(network)} - {getStatusLabel(networkData?.status)}
            </p>
            {networkData?.blockHeight && (
              <p className="text-xs text-muted-foreground">Block #{networkData.blockHeight.toLocaleString()}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant - single line with key metrics
  if (variant === 'compact') {
    return (
      <Card className={cn('border', getStatusColor(networkData?.status))}>
        <CardContent className="py-2 px-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(networkData?.status)}
              <div className="flex flex-col">
                <span className="text-xs font-medium">{formatNetworkName(network)}</span>
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(networkData?.status)}
                </span>
              </div>
            </div>

            {showDetails && networkData?.blockHeight && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Server className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono">#{networkData.blockHeight.toLocaleString()}</span>
                </div>
                {networkData.tps !== undefined && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span>{networkData.tps.toFixed(1)} TPS</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - full details card
  return (
    <Card className={cn('border', getStatusColor(networkData?.status))}>
      <CardContent className="py-4 px-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(networkData?.status)}
              <div>
                <h3 className="text-sm font-semibold">{formatNetworkName(network)}</h3>
                <p className="text-xs text-muted-foreground">{getStatusLabel(networkData?.status)}</p>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(networkData?.status)}>
              <Activity className="h-3 w-3 mr-1" />
              {networkData?.status === NetworkStatus.ONLINE ? 'Live' : getStatusLabel(networkData?.status)}
            </Badge>
          </div>

          {/* Metrics Grid */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-4">
              {/* Block Height */}
              {networkData?.blockHeight !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Server className="h-3 w-3" />
                    <span>Block Height</span>
                  </div>
                  <p className="text-lg font-semibold font-mono">
                    #{networkData.blockHeight.toLocaleString()}
                  </p>
                </div>
              )}

              {/* TPS */}
              {networkData?.tps !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    <span>Throughput</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {networkData.tps.toFixed(2)} <span className="text-xs font-normal">TPS</span>
                  </p>
                </div>
              )}

              {/* Peer Count */}
              {networkData?.peerCount !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Peers</span>
                  </div>
                  <p className="text-lg font-semibold">{networkData.peerCount}</p>
                </div>
              )}

              {/* Latency */}
              {networkData?.latency !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Latency</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {networkData.latency} <span className="text-xs font-normal">ms</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          {networkData?.lastUpdated && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(networkData.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Multi-network status component
interface MultiNetworkStatusProps {
  networks: BlockchainNetwork[];
  variant?: 'default' | 'compact' | 'minimal';
}

export const MultiNetworkStatus: React.FC<MultiNetworkStatusProps> = ({
  networks,
  variant = 'compact',
}) => {
  return (
    <div className="space-y-3">
      {networks.map((network) => (
        <BlockchainStatus
          key={network}
          network={network}
          variant={variant}
          showDetails={variant === 'default'}
        />
      ))}
    </div>
  );
};

export default BlockchainStatus;
