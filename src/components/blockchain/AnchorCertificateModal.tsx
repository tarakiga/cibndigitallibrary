import React, { useState } from 'react';
import { Anchor, AlertCircle, CheckCircle, Loader2, Server, Shield } from 'lucide-react';
import { useAnchorCertificate } from '@/hooks/useBlockchain';
import { BlockchainNetwork } from '@/types/blockchain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface AnchorCertificateModalProps {
  certificateId: string;
  certificateData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (transactionHash: string) => void;
}

enum AnchoringStep {
  SELECT_NETWORK = 'select_network',
  CONFIRM = 'confirm',
  ANCHORING = 'anchoring',
  SUCCESS = 'success',
  ERROR = 'error',
}

export const AnchorCertificateModal: React.FC<AnchorCertificateModalProps> = ({
  certificateId,
  certificateData,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<AnchoringStep>(AnchoringStep.SELECT_NETWORK);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>(
    BlockchainNetwork.HYPERLEDGER_FABRIC
  );
  const [transactionHash, setTransactionHash] = useState<string>('');

  const { mutate: anchorCertificate, isPending } = useAnchorCertificate();

  const handleAnchor = () => {
    setCurrentStep(AnchoringStep.ANCHORING);

    anchorCertificate(
      {
        certificateId,
        network: selectedNetwork,
        certificateData,
      },
      {
        onSuccess: (data) => {
          setTransactionHash(data.transactionHash);
          setCurrentStep(AnchoringStep.SUCCESS);
          onSuccess?.(data.transactionHash);
        },
        onError: () => {
          setCurrentStep(AnchoringStep.ERROR);
        },
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation completes
    setTimeout(() => {
      setCurrentStep(AnchoringStep.SELECT_NETWORK);
      setTransactionHash('');
    }, 300);
  };

  const getStepProgress = (): number => {
    switch (currentStep) {
      case AnchoringStep.SELECT_NETWORK:
        return 25;
      case AnchoringStep.CONFIRM:
        return 50;
      case AnchoringStep.ANCHORING:
        return 75;
      case AnchoringStep.SUCCESS:
      case AnchoringStep.ERROR:
        return 100;
      default:
        return 0;
    }
  };

  const formatNetworkName = (network: BlockchainNetwork): string => {
    return network
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Anchor Certificate to Blockchain
          </DialogTitle>
          <DialogDescription>
            Create an immutable record of this certificate on the blockchain for tamper-proof verification.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={getStepProgress()} className="h-2" />

        <div className="space-y-4 py-4">
          {/* Step 1: Select Network */}
          {currentStep === AnchoringStep.SELECT_NETWORK && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network">Select Blockchain Network</Label>
                <Select
                  value={selectedNetwork}
                  onValueChange={(value) => setSelectedNetwork(value as BlockchainNetwork)}
                >
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Choose a blockchain network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BlockchainNetwork.HYPERLEDGER_FABRIC}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Hyperledger Fabric
                      </div>
                    </SelectItem>
                    <SelectItem value={BlockchainNetwork.ETHEREUM_MAINNET}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Ethereum Mainnet
                      </div>
                    </SelectItem>
                    <SelectItem value={BlockchainNetwork.ETHEREUM_SEPOLIA}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Ethereum Sepolia (Testnet)
                      </div>
                    </SelectItem>
                    <SelectItem value={BlockchainNetwork.POLYGON_MAINNET}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Polygon Mainnet
                      </div>
                    </SelectItem>
                    <SelectItem value={BlockchainNetwork.POLYGON_MUMBAI}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Polygon Mumbai (Testnet)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This determines which blockchain will store the certificate anchor.
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>What is Certificate Anchoring?</AlertTitle>
                <AlertDescription className="text-xs">
                  Anchoring creates a cryptographic hash of your certificate and stores it on the
                  blockchain. This creates an immutable, timestamped proof of the certificate's existence
                  and content, making it tamper-proof.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: Confirm */}
          {currentStep === AnchoringStep.CONFIRM && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Confirm Anchoring</AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>You are about to anchor this certificate to:</p>
                  <p className="font-semibold">{formatNetworkName(selectedNetwork)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This operation cannot be undone. Once anchored, the certificate's hash will be
                    permanently recorded on the blockchain.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate ID</span>
                  <span className="font-mono">{certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>{formatNetworkName(selectedNetwork)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Anchoring */}
          {currentStep === AnchoringStep.ANCHORING && (
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Anchoring to Blockchain</h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we submit your certificate to {formatNetworkName(selectedNetwork)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === AnchoringStep.SUCCESS && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Successfully Anchored!</AlertTitle>
                <AlertDescription className="text-green-800 space-y-2">
                  <p>Your certificate has been successfully anchored to the blockchain.</p>
                  {transactionHash && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Transaction Hash:</p>
                      <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                        {transactionHash}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 5: Error */}
          {currentStep === AnchoringStep.ERROR && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Anchoring Failed</AlertTitle>
                <AlertDescription>
                  Failed to anchor certificate to the blockchain. Please try again later or contact support
                  if the problem persists.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep === AnchoringStep.SELECT_NETWORK && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setCurrentStep(AnchoringStep.CONFIRM)}>
                Continue
              </Button>
            </>
          )}

          {currentStep === AnchoringStep.CONFIRM && (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(AnchoringStep.SELECT_NETWORK)}
              >
                Back
              </Button>
              <Button onClick={handleAnchor} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Anchor
              </Button>
            </>
          )}

          {currentStep === AnchoringStep.SUCCESS && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}

          {currentStep === AnchoringStep.ERROR && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleAnchor}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnchorCertificateModal;
