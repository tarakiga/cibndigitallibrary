# Blockchain Integration Guide

## Overview

The AMANAH frontend application includes comprehensive blockchain integration for certificate anchoring and verification. This ensures that all certificates issued through the system have an immutable, tamper-proof record on the blockchain.

## Supported Blockchain Networks

The system currently supports the following blockchain networks:

### Enterprise Blockchain
- **Hyperledger Fabric** - Permissioned blockchain optimized for enterprise use

### Public Blockchains
- **Ethereum Mainnet** - Production Ethereum network
- **Ethereum Sepolia** - Ethereum testnet for development/testing
- **Polygon Mainnet** - Polygon production network (Layer 2 Ethereum)
- **Polygon Mumbai** - Polygon testnet for development/testing

## Architecture

### Core Components

1. **Type Definitions** (`src/types/blockchain.ts`)
   - Comprehensive TypeScript types for blockchain operations
   - Network configurations
   - Transaction models
   - Certificate anchoring models

2. **Service Layer** (`src/lib/blockchain/service.ts`)
   - API communication with backend blockchain services
   - Network status monitoring
   - Transaction management
   - Certificate verification

3. **React Hooks** (`src/hooks/useBlockchain.ts`)
   - React Query-based hooks for data fetching
   - Automatic caching and revalidation
   - Mutations for anchoring and verification

4. **UI Components** (`src/components/blockchain/`)
   - `BlockchainVerification` - Display certificate verification status
   - `TransactionHistory` - Show transaction timeline
   - `BlockchainStatus` - Network status indicators
   - `AnchorCertificateModal` - Certificate anchoring wizard

## Usage Guide

### 1. Anchoring a Certificate

To anchor a certificate to the blockchain:

```typescript
import { AnchorCertificateModal } from '@/components/blockchain';
import { useState } from 'react';

function CertificateIssuePage() {
  const [showAnchorModal, setShowAnchorModal] = useState(false);

  const handleAnchorSuccess = (transactionHash: string) => {
    console.log('Certificate anchored:', transactionHash);
    // Update certificate record with transaction hash
  };

  return (
    <>
      <button onClick={() => setShowAnchorModal(true)}>
        Anchor to Blockchain
      </button>

      <AnchorCertificateModal
        certificateId="cert-123"
        certificateData={certificateData}
        open={showAnchorModal}
        onOpenChange={setShowAnchorModal}
        onSuccess={handleAnchorSuccess}
      />
    </>
  );
}
```

### 2. Displaying Verification Status

Show blockchain verification for a certificate:

```typescript
import { BlockchainVerification } from '@/components/blockchain';
import { BlockchainNetwork } from '@/types/blockchain';

function CertificateViewPage({ certificateId }: { certificateId: string }) {
  return (
    <div>
      {/* Full verification details */}
      <BlockchainVerification
        certificateId={certificateId}
        network={BlockchainNetwork.HYPERLEDGER_FABRIC}
        showHeader={true}
      />

      {/* Compact mode for embedding */}
      <BlockchainVerification
        certificateId={certificateId}
        network={BlockchainNetwork.HYPERLEDGER_FABRIC}
        compact={true}
        showHeader={false}
      />
    </div>
  );
}
```

### 3. Showing Transaction History

Display all blockchain transactions for a certificate:

```typescript
import { TransactionHistory } from '@/components/blockchain';
import { BlockchainNetwork } from '@/types/blockchain';

function CertificateDetailsPage({ certificateId }: { certificateId: string }) {
  return (
    <TransactionHistory
      certificateId={certificateId}
      network={BlockchainNetwork.HYPERLEDGER_FABRIC}
      maxHeight="600px"
    />
  );
}
```

### 4. Monitoring Network Status

Display blockchain network status:

```typescript
import { 
  BlockchainStatus, 
  MultiNetworkStatus 
} from '@/components/blockchain';
import { BlockchainNetwork } from '@/types/blockchain';

function DashboardPage() {
  return (
    <div>
      {/* Single network - full details */}
      <BlockchainStatus
        network={BlockchainNetwork.HYPERLEDGER_FABRIC}
        variant="default"
        showDetails={true}
        autoRefresh={true}
        refreshInterval={30000}
      />

      {/* Single network - compact */}
      <BlockchainStatus
        network={BlockchainNetwork.ETHEREUM_MAINNET}
        variant="compact"
      />

      {/* Single network - minimal badge */}
      <BlockchainStatus
        network={BlockchainNetwork.POLYGON_MAINNET}
        variant="minimal"
      />

      {/* Multiple networks */}
      <MultiNetworkStatus
        networks={[
          BlockchainNetwork.HYPERLEDGER_FABRIC,
          BlockchainNetwork.ETHEREUM_MAINNET,
          BlockchainNetwork.POLYGON_MAINNET,
        ]}
        variant="compact"
      />
    </div>
  );
}
```

### 5. Using React Hooks Directly

For custom implementations, use the underlying hooks:

```typescript
import {
  useNetworkStatus,
  useBlockchainCertificate,
  useBlockchainVerification,
  useCertificateTransactions,
  useAnchorCertificate,
} from '@/hooks/useBlockchain';
import { BlockchainNetwork } from '@/types/blockchain';

function CustomComponent({ certificateId }: { certificateId: string }) {
  // Fetch network status
  const { data: networkStatus, isLoading: networkLoading } = useNetworkStatus(
    BlockchainNetwork.HYPERLEDGER_FABRIC
  );

  // Fetch certificate blockchain data
  const { data: certData, isLoading: certLoading } = useBlockchainCertificate(
    certificateId,
    BlockchainNetwork.HYPERLEDGER_FABRIC
  );

  // Verify a transaction
  const { data: verificationData } = useBlockchainVerification(
    certData?.transactionHash || '',
    BlockchainNetwork.HYPERLEDGER_FABRIC
  );

  // Fetch transaction history
  const { data: transactions } = useCertificateTransactions(
    certificateId,
    BlockchainNetwork.HYPERLEDGER_FABRIC
  );

  // Anchor certificate mutation
  const { mutate: anchorCertificate, isPending } = useAnchorCertificate();

  const handleAnchor = () => {
    anchorCertificate({
      certificateId,
      network: BlockchainNetwork.HYPERLEDGER_FABRIC,
      certificateData: { /* certificate data */ },
    });
  };

  // Your custom UI implementation
  return <div>...</div>;
}
```

## Certificate Anchoring Process

### What is Certificate Anchoring?

Certificate anchoring creates a cryptographic hash of the certificate data and stores it on the blockchain. This provides:

1. **Immutability** - Once anchored, the data cannot be altered
2. **Timestamp Proof** - Blockchain provides indisputable proof of when the certificate was issued
3. **Tamper Detection** - Any modification to the certificate can be detected
4. **Decentralization** - No single point of failure or control

### Anchoring Workflow

```
┌─────────────────────┐
│  Issue Certificate  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Generate Hash       │
│ (SHA-256/SHA-3)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Select Network      │
│ (Hyperledger, etc)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Submit Transaction  │
│ to Blockchain       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Wait for            │
│ Confirmation        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Store TX Hash       │
│ in Certificate DB   │
└─────────────────────┘
```

### Anchoring Best Practices

1. **Timing** - Anchor certificates immediately after issuance
2. **Network Selection** - Use Hyperledger Fabric for enterprise, Ethereum/Polygon for public verification
3. **Error Handling** - Implement retry logic for failed anchoring attempts
4. **User Feedback** - Show clear progress and confirmation to users
5. **Cost Consideration** - Be aware of gas fees on public blockchains

## Verification Process

### How Verification Works

```
┌─────────────────────┐
│ Receive Certificate │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Extract Transaction │
│ Hash from Cert      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Query Blockchain    │
│ for TX Hash         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Compare Cert Hash   │
│ with Blockchain     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Return Verification │
│ Result              │
└─────────────────────┘
```

### Verification Results

- ✅ **Verified** - Certificate hash matches blockchain record
- ❌ **Not Verified** - Hash mismatch indicates tampering
- ⏳ **Pending** - Transaction still being confirmed
- ❓ **Not Found** - Certificate not anchored or invalid transaction hash

## API Integration

### Backend Requirements

The frontend expects the following backend API endpoints:

#### Network Status
```
GET /api/blockchain/networks/:network/status
```

Response:
```json
{
  "network": "HYPERLEDGER_FABRIC",
  "status": "ONLINE",
  "blockHeight": 12345,
  "tps": 1500,
  "peerCount": 4,
  "latency": 45,
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

#### Certificate Verification
```
POST /api/blockchain/verify
```

Request:
```json
{
  "transactionHash": "0x123...",
  "network": "HYPERLEDGER_FABRIC"
}
```

Response:
```json
{
  "isValid": true,
  "transactionHash": "0x123...",
  "blockNumber": "12345",
  "timestamp": "2024-01-15T12:00:00Z",
  "certificateHash": "abc123...",
  "issuerOrganization": "AMANAH",
  "metadata": {}
}
```

#### Anchor Certificate
```
POST /api/blockchain/anchor
```

Request:
```json
{
  "certificateId": "cert-123",
  "network": "HYPERLEDGER_FABRIC",
  "certificateData": {
    "recipientName": "John Doe",
    "courseName": "Blockchain Fundamentals",
    "issueDate": "2024-01-15"
  }
}
```

Response:
```json
{
  "success": true,
  "transactionHash": "0x123...",
  "blockNumber": "12346",
  "timestamp": "2024-01-15T12:05:00Z",
  "certificateHash": "abc123...",
  "network": "HYPERLEDGER_FABRIC"
}
```

#### Certificate Blockchain Data
```
GET /api/blockchain/certificates/:certificateId?network=HYPERLEDGER_FABRIC
```

Response:
```json
{
  "certificateId": "cert-123",
  "transactionHash": "0x123...",
  "blockNumber": "12345",
  "timestamp": "2024-01-15T12:00:00Z",
  "certificateHash": "abc123...",
  "isVerified": true,
  "network": "HYPERLEDGER_FABRIC"
}
```

#### Certificate Transactions
```
GET /api/blockchain/certificates/:certificateId/transactions?network=HYPERLEDGER_FABRIC
```

Response:
```json
[
  {
    "transactionHash": "0x123...",
    "blockNumber": "12345",
    "timestamp": "2024-01-15T12:00:00Z",
    "from": "0xabc...",
    "to": "0xdef...",
    "status": "CONFIRMED",
    "type": "ANCHOR",
    "confirmations": 100,
    "gasUsed": 21000,
    "fee": "0.0001 ETH"
  }
]
```

## Security Considerations

### Hash Generation
- Use SHA-256 or SHA-3 for certificate hashing
- Include all critical certificate fields in hash computation
- Never hash sensitive PII directly

### Private Key Management
- Store private keys securely (HSM, KMS, or secure vault)
- Use separate keys for different environments
- Implement key rotation policies
- Never expose private keys to the frontend

### Transaction Signing
- Always sign transactions on the backend
- Validate certificate data before signing
- Implement rate limiting to prevent abuse

### Network Security
- Use TLS/SSL for all API communications
- Implement authentication and authorization
- Validate blockchain responses
- Monitor for suspicious activity

## Performance Optimization

### Caching Strategy
- React Query automatically caches blockchain data
- Default cache time: 5 minutes for certificate data
- Network status refreshes every 30 seconds
- Transaction history cached for 2 minutes

### Batch Operations
Consider batching multiple certificate anchoring operations:

```typescript
// Instead of anchoring one at a time
certificates.forEach(cert => anchorCertificate(cert));

// Batch multiple certificates
await batchAnchorCertificates(certificates);
```

### Pagination
For large transaction histories, implement pagination:

```typescript
const { data, fetchNextPage, hasNextPage } = useCertificateTransactions(
  certificateId,
  network,
  { pageSize: 20 }
);
```

## Troubleshooting

### Common Issues

1. **Transaction Not Found**
   - Wait for blockchain confirmation (can take minutes)
   - Check network status
   - Verify transaction hash is correct

2. **Verification Failed**
   - Certificate data may have been modified
   - Transaction may not be confirmed yet
   - Check blockchain network connectivity

3. **Anchoring Timeout**
   - Blockchain network may be congested
   - Increase gas price (for public blockchains)
   - Retry with different network

4. **Network Status Shows Offline**
   - Check backend blockchain node connectivity
   - Verify network configuration
   - Check firewall rules

## Testing

### Unit Tests
Test blockchain service functions:

```typescript
import { blockchainService } from '@/lib/blockchain/service';

describe('Blockchain Service', () => {
  it('should fetch network status', async () => {
    const status = await blockchainService.getNetworkStatus(
      BlockchainNetwork.HYPERLEDGER_FABRIC
    );
    expect(status.network).toBe(BlockchainNetwork.HYPERLEDGER_FABRIC);
  });

  it('should verify certificate', async () => {
    const result = await blockchainService.verifyCertificate(
      'tx-hash',
      BlockchainNetwork.HYPERLEDGER_FABRIC
    );
    expect(result.isValid).toBeDefined();
  });
});
```

### Integration Tests
Test complete anchoring workflow:

```typescript
describe('Certificate Anchoring Flow', () => {
  it('should anchor and verify certificate', async () => {
    // 1. Anchor certificate
    const anchorResult = await anchorCertificate({
      certificateId: 'test-cert',
      network: BlockchainNetwork.HYPERLEDGER_FABRIC,
      certificateData: mockCertData,
    });

    // 2. Wait for confirmation
    await waitFor(() => {
      expect(anchorResult.transactionHash).toBeDefined();
    });

    // 3. Verify certificate
    const verifyResult = await verifyCertificate(
      anchorResult.transactionHash,
      BlockchainNetwork.HYPERLEDGER_FABRIC
    );

    expect(verifyResult.isValid).toBe(true);
  });
});
```

## Future Enhancements

### Planned Features
1. **Multi-Network Anchoring** - Anchor to multiple blockchains simultaneously
2. **Batch Verification** - Verify multiple certificates in one request
3. **Smart Contract Integration** - Deploy custom smart contracts for advanced features
4. **NFT Certificates** - Issue certificates as NFTs on public blockchains
5. **IPFS Integration** - Store certificate PDFs on IPFS with blockchain pointers
6. **Zero-Knowledge Proofs** - Verify credentials without revealing details

## Resources

### Documentation
- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/)
- [Ethereum Developer Docs](https://ethereum.org/developers)
- [Polygon Documentation](https://docs.polygon.technology/)

### Tools
- **Block Explorers**
  - Hyperledger: Your organization's explorer
  - Ethereum: [Etherscan](https://etherscan.io)
  - Polygon: [PolygonScan](https://polygonscan.com)

### Support
For blockchain integration support, contact the development team or file an issue in the project repository.

---

**Last Updated:** January 2024  
**Version:** 1.0.0
