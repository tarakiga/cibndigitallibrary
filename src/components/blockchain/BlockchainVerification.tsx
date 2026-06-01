import React from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Hash, Calendar, Clock, Server, Shield } from 'lucide-react';
import { useBlockchainCertificate, useBlockchainVerification, useExplorerLink } from '@/hooks/useBlockchain';
import { BlockchainNetwork } from '@/types/blockchain';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface BlockchainVerificationProps {
  certificateId: string;
  transactionHash?: string;
  network?: BlockchainNetwork;
  showHeader?: boolean;
  compact?: boolean;
}

export const BlockchainVerification: React.FC<BlockchainVerificationProps> = ({
  certificateId,
  transactionHash,
  network = BlockchainNetwork.HYPERLEDGER_FABRIC,
  showHeader = true,
  compact = false,
}) => {
  // Fetch certificate blockchain data
  const { data: certData, isLoading: isCertLoading } = useBlockchainCertificate(certificateId, network);
  
  // Fetch verification result if we have a transaction hash
  const { data: verificationData, isLoading: isVerifying } = useBlockchainVerification(
    transactionHash || certData?.transactionHash || '',
    network
  );

  // Get explorer link
  const explorerLink = useExplorerLink(
    transactionHash || certData?.transactionHash || '',
    network,
    'transaction'
  );

  const isLoading = isCertLoading || isVerifying;

  // Determine verification status
  const isVerified = verificationData?.isValid || certData?.isVerified;
  const hasBlockchainData = !!(transactionHash || certData?.transactionHash);

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Blockchain Verification</CardTitle>
            <CardDescription>Verifying certificate authenticity...</CardDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasBlockchainData) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Blockchain Verification</CardTitle>
            <CardDescription>Certificate not yet anchored to blockchain</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Anchored</AlertTitle>
            <AlertDescription>
              This certificate has not been anchored to the blockchain yet. Blockchain verification will be
              available once the anchoring process is complete.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const displayData = verificationData || certData;

  return (
    <Card className={compact ? 'border-0 shadow-none' : ''}>
      {showHeader && !compact && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Blockchain Verification
              </CardTitle>
              <CardDescription>Certificate authenticity verified on blockchain</CardDescription>
            </div>
            <Badge
              variant={isVerified ? 'default' : 'destructive'}
              className={isVerified ? 'bg-green-600' : ''}
            >
              {isVerified ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Verified
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Verification Status Alert */}
        {isVerified ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Certificate Verified</AlertTitle>
            <AlertDescription className="text-green-800">
              This certificate has been successfully verified on the blockchain. The data is immutable and
              tamper-proof.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              {displayData?.message || 'Unable to verify certificate on blockchain. The data may have been tampered with.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Blockchain Details */}
        <div className="space-y-3">
          {/* Network */}
          <div className="flex items-start gap-3">
            <Server className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Blockchain Network</p>
              <p className="text-sm text-muted-foreground">
                {network.replace('_', ' ')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Transaction Hash */}
          {displayData?.transactionHash && (
            <>
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Transaction Hash</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {displayData.transactionHash}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Block Number */}
          {displayData?.blockNumber && (
            <>
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Block Number</p>
                  <p className="text-sm text-muted-foreground">
                    #{displayData.blockNumber}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Timestamp */}
          {displayData?.timestamp && (
            <>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Anchored</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(displayData.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(displayData.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Certificate Hash */}
          {displayData?.certificateHash && (
            <>
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Certificate Hash</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {displayData.certificateHash}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Issuer Organization */}
          {displayData?.issuerOrganization && (
            <>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Issuer Organization</p>
                  <p className="text-sm text-muted-foreground">
                    {displayData.issuerOrganization}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Explorer Link */}
        {explorerLink && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <a
                href={explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                View on Blockchain Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}

        {/* Additional Metadata */}
        {verificationData?.metadata && Object.keys(verificationData.metadata).length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Additional Verification Data</p>
            <div className="bg-muted p-3 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(verificationData.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainVerification;
