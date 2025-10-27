'use client';

import { useState } from 'react';
import {
  BlockchainVerification,
  TransactionHistory,
  BlockchainStatus,
  MultiNetworkStatus,
  AnchorCertificateModal,
} from '@/components/blockchain';
import { BlockchainNetwork } from '@/types/blockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function BlockchainDemoPage() {
  const [showAnchorModal, setShowAnchorModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>(
    BlockchainNetwork.HYPERLEDGER_FABRIC
  );

  const demoCertificateId = 'CERT-DEMO-123';
  const demoTransactionHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔗 Blockchain Integration Demo</h1>
            <p className="text-muted-foreground text-lg">
              Preview all blockchain components and features - Phase 8
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10">
            ✅ Complete
          </Badge>
        </div>
        <Separator className="my-4" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Test blockchain features</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setShowAnchorModal(true)}>
            🔒 Anchor Certificate
          </Button>
          <Button variant="outline">✅ Verify Certificate</Button>
          <Button variant="outline">📜 View Transaction History</Button>
          <Button variant="outline">📡 Check Network Status</Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Blockchain Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.values(BlockchainNetwork).map((network) => (
              <Button
                key={network}
                variant={selectedNetwork === network ? 'default' : 'outline'}
                onClick={() => setSelectedNetwork(network)}
                size="sm"
              >
                {network.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="status">Network Status</TabsTrigger>
          <TabsTrigger value="all">All Components</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Verification Component</CardTitle>
                <CardDescription>
                  Displays certificate verification status with blockchain proof
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainVerification
                  certificateId={demoCertificateId}
                  transactionHash={demoTransactionHash}
                  network={selectedNetwork}
                  showHeader={true}
                  compact={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Mode</CardTitle>
                <CardDescription>
                  Verification component in compact mode for embedding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainVerification
                  certificateId={demoCertificateId}
                  transactionHash={demoTransactionHash}
                  network={selectedNetwork}
                  showHeader={false}
                  compact={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History Component</CardTitle>
              <CardDescription>
                View all blockchain transactions for a certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory
                certificateId={demoCertificateId}
                network={selectedNetwork}
                maxHeight="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Default Status</CardTitle>
                <CardDescription>Full network status with metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainStatus
                  network={selectedNetwork}
                  variant="default"
                  showDetails={true}
                  autoRefresh={true}
                  refreshInterval={30000}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Status</CardTitle>
                <CardDescription>Single-line status display</CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainStatus
                  network={selectedNetwork}
                  variant="compact"
                  showDetails={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minimal Status</CardTitle>
                <CardDescription>Badge-style status indicator</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Status:</span>
                <BlockchainStatus
                  network={selectedNetwork}
                  variant="minimal"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Network Status</CardTitle>
                <CardDescription>Monitor multiple networks</CardDescription>
              </CardHeader>
              <CardContent>
                <MultiNetworkStatus
                  networks={[
                    BlockchainNetwork.HYPERLEDGER_FABRIC,
                    BlockchainNetwork.ETHEREUM_MAINNET,
                    BlockchainNetwork.POLYGON_MAINNET,
                  ]}
                  variant="compact"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockchainVerification
                  certificateId={demoCertificateId}
                  transactionHash={demoTransactionHash}
                  network={selectedNetwork}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory
                  certificateId={demoCertificateId}
                  network={selectedNetwork}
                  maxHeight="400px"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockchainStatus
                  network={selectedNetwork}
                  variant="default"
                  showDetails={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AnchorCertificateModal
        certificateId={demoCertificateId}
        certificateData={{
          recipientName: 'John Doe',
          courseName: 'Blockchain Fundamentals',
          issueDate: new Date().toISOString(),
          issuer: 'AMANAH',
        }}
        open={showAnchorModal}
        onOpenChange={setShowAnchorModal}
        onSuccess={(txHash) => {
          console.log('Certificate anchored successfully:', txHash);
          alert(`✅ Certificate anchored! Transaction Hash: ${txHash}`);
        }}
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Component Information</CardTitle>
          <CardDescription>Available blockchain components and their features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">BlockchainVerification</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Displays verification status</li>
                <li>• Shows transaction details</li>
                <li>• Links to blockchain explorer</li>
                <li>• Supports compact mode</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">TransactionHistory</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Shows all transactions</li>
                <li>• Status-based filtering</li>
                <li>• Expandable details</li>
                <li>• Explorer integration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">BlockchainStatus</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time network monitoring</li>
                <li>• Multiple display variants</li>
                <li>• Auto-refresh capability</li>
                <li>• Performance metrics</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">AnchorCertificateModal</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-step wizard</li>
                <li>• Network selection</li>
                <li>• Progress tracking</li>
                <li>• Success/error handling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-6">
        <p className="font-semibold mb-2">🎉 Blockchain Integration - Phase 8 Complete</p>
        <p>
          Supporting: Hyperledger Fabric, Ethereum (Mainnet & Sepolia), Polygon (Mainnet & Mumbai)
        </p>
        <p className="mt-2 text-xs">
          📍 Access at: <code className="bg-muted px-2 py-1 rounded">/en/library/blockchain-demo</code>
        </p>
      </div>
    </div>
  );
}
