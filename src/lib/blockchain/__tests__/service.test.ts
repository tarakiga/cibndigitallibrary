import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { blockchainService } from '../service';
import { BlockchainNetwork, TransactionStatus } from '@/types/blockchain';

// Mock fetch globally
global.fetch = vi.fn();

describe('BlockchainService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNetworkStatus', () => {
    it('should fetch network status successfully', async () => {
      const mockResponse = {
        network: BlockchainNetwork.HYPERLEDGER_FABRIC,
        status: 'ONLINE',
        blockHeight: 12345,
        tps: 1500,
        peerCount: 4,
        latency: 45,
        lastUpdated: '2024-01-15T12:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await blockchainService.getNetworkStatus(
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/blockchain/networks/HYPERLEDGER_FABRIC/status'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(
        blockchainService.getNetworkStatus(BlockchainNetwork.HYPERLEDGER_FABRIC)
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        blockchainService.getNetworkStatus(BlockchainNetwork.HYPERLEDGER_FABRIC)
      ).rejects.toThrow('Network error');
    });
  });

  describe('verifyCertificate', () => {
    it('should verify certificate successfully', async () => {
      const mockResponse = {
        isValid: true,
        transactionHash: '0xabc123',
        blockNumber: '12345',
        timestamp: '2024-01-15T12:00:00Z',
        certificateHash: 'hash123',
        issuerOrganization: 'AMANAH',
        metadata: {},
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await blockchainService.verifyCertificate(
        '0xabc123',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/blockchain/verify'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('0xabc123'),
        })
      );
    });

    it('should handle invalid certificate', async () => {
      const mockResponse = {
        isValid: false,
        transactionHash: '0xinvalid',
        message: 'Certificate not found',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await blockchainService.verifyCertificate(
        '0xinvalid',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result.isValid).toBe(false);
    });
  });

  describe('anchorCertificate', () => {
    it('should anchor certificate successfully', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0xnew123',
        blockNumber: '12346',
        timestamp: '2024-01-15T13:00:00Z',
        certificateHash: 'newhash123',
        network: BlockchainNetwork.HYPERLEDGER_FABRIC,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await blockchainService.anchorCertificate(
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC,
        { name: 'Test Certificate' }
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.transactionHash).toMatch(/^0x/);
    });

    it('should include certificate data in request', async () => {
      const certificateData = {
        recipientName: 'John Doe',
        courseName: 'Blockchain 101',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, transactionHash: '0x123' }),
      });

      await blockchainService.anchorCertificate(
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC,
        certificateData
      );

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.certificateData).toEqual(certificateData);
    });
  });

  describe('getCertificateBlockchainData', () => {
    it('should get certificate blockchain data successfully', async () => {
      const mockResponse = {
        certificateId: 'cert-123',
        transactionHash: '0xabc123',
        blockNumber: '12345',
        timestamp: '2024-01-15T12:00:00Z',
        certificateHash: 'hash123',
        isVerified: true,
        network: BlockchainNetwork.HYPERLEDGER_FABRIC,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await blockchainService.getCertificateBlockchainData(
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result).toEqual(mockResponse);
      expect(result.isVerified).toBe(true);
    });

    it('should handle certificate not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        blockchainService.getCertificateBlockchainData(
          'invalid-cert',
          BlockchainNetwork.HYPERLEDGER_FABRIC
        )
      ).rejects.toThrow();
    });
  });

  describe('getCertificateTransactions', () => {
    it('should get certificate transactions successfully', async () => {
      const mockResponse = [
        {
          transactionHash: '0xabc123',
          blockNumber: '12345',
          timestamp: '2024-01-15T12:00:00Z',
          from: '0xsender',
          to: '0xreceiver',
          status: TransactionStatus.CONFIRMED,
          type: 'ANCHOR',
          confirmations: 100,
        },
        {
          transactionHash: '0xdef456',
          blockNumber: '12346',
          timestamp: '2024-01-15T13:00:00Z',
          from: '0xsender',
          to: '0xreceiver',
          status: TransactionStatus.CONFIRMED,
          type: 'VERIFY',
          confirmations: 50,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await blockchainService.getCertificateTransactions(
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('ANCHOR');
      expect(result[1].type).toBe('VERIFY');
    });

    it('should handle empty transaction history', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await blockchainService.getCertificateTransactions(
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details successfully', async () => {
      const mockTransaction = {
        transactionHash: '0xabc123',
        blockNumber: '12345',
        timestamp: '2024-01-15T12:00:00Z',
        from: '0xsender',
        to: '0xreceiver',
        status: TransactionStatus.CONFIRMED,
        confirmations: 100,
        gasUsed: 21000,
        fee: '0.0001 ETH',
      };

      // Mock both the transaction list and single transaction endpoints
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTransaction],
      });

      const result = await blockchainService.getTransaction(
        '0xabc123',
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result?.transactionHash).toBe('0xabc123');
    });

    it('should return null for non-existent transaction', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await blockchainService.getTransaction(
        '0xinvalid',
        'cert-123',
        BlockchainNetwork.HYPERLEDGER_FABRIC
      );

      expect(result).toBeNull();
    });
  });

  describe('getExplorerLink', () => {
    it('should generate Ethereum Mainnet explorer link', () => {
      const link = blockchainService.getExplorerLink(
        '0xabc123',
        BlockchainNetwork.ETHEREUM_MAINNET,
        'transaction'
      );

      expect(link).toBe('https://etherscan.io/tx/0xabc123');
    });

    it('should generate Ethereum Sepolia explorer link', () => {
      const link = blockchainService.getExplorerLink(
        '0xabc123',
        BlockchainNetwork.ETHEREUM_SEPOLIA,
        'transaction'
      );

      expect(link).toBe('https://sepolia.etherscan.io/tx/0xabc123');
    });

    it('should generate Polygon Mainnet explorer link', () => {
      const link = blockchainService.getExplorerLink(
        '0xabc123',
        BlockchainNetwork.POLYGON_MAINNET,
        'transaction'
      );

      expect(link).toBe('https://polygonscan.com/tx/0xabc123');
    });

    it('should generate address explorer link', () => {
      const link = blockchainService.getExplorerLink(
        '0xaddress',
        BlockchainNetwork.ETHEREUM_MAINNET,
        'address'
      );

      expect(link).toBe('https://etherscan.io/address/0xaddress');
    });

    it('should generate block explorer link', () => {
      const link = blockchainService.getExplorerLink(
        '12345',
        BlockchainNetwork.POLYGON_MAINNET,
        'block'
      );

      expect(link).toBe('https://polygonscan.com/block/12345');
    });

    it('should return null for unsupported network', () => {
      const link = blockchainService.getExplorerLink(
        '0xabc123',
        BlockchainNetwork.HYPERLEDGER_FABRIC,
        'transaction'
      );

      expect(link).toBeNull();
    });
  });

  describe('hashCertificateData', () => {
    it('should generate consistent hash for same data', () => {
      const data = { name: 'Test', value: 123 };
      const hash1 = blockchainService.hashCertificateData(data);
      const hash2 = blockchainService.hashCertificateData(data);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it('should generate different hash for different data', () => {
      const data1 = { name: 'Test1' };
      const data2 = { name: 'Test2' };
      const hash1 = blockchainService.hashCertificateData(data1);
      const hash2 = blockchainService.hashCertificateData(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle nested objects', () => {
      const data = {
        level1: {
          level2: {
            value: 'nested',
          },
        },
      };

      const hash = blockchainService.hashCertificateData(data);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('formatTransactionHash', () => {
    it('should format long transaction hash', () => {
      const hash = '0x' + 'a'.repeat(64);
      const formatted = blockchainService.formatTransactionHash(hash);

      expect(formatted).toBe('0xaaaa...aaaa');
    });

    it('should not format short hash', () => {
      const hash = '0xabc123';
      const formatted = blockchainService.formatTransactionHash(hash);

      expect(formatted).toBe('0xabc123');
    });

    it('should handle hash without 0x prefix', () => {
      const hash = 'a'.repeat(64);
      const formatted = blockchainService.formatTransactionHash(hash);

      expect(formatted).toBe('aaaa...aaaa');
    });

    it('should handle custom prefix and suffix length', () => {
      const hash = '0x' + 'a'.repeat(64);
      const formatted = blockchainService.formatTransactionHash(hash, 6, 6);

      expect(formatted).toBe('0xaaaaaa...aaaaaa');
    });
  });

  describe('error handling', () => {
    it('should throw error for API failures', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        blockchainService.getNetworkStatus(BlockchainNetwork.HYPERLEDGER_FABRIC)
      ).rejects.toThrow();
    });

    it('should throw error for network failures', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        blockchainService.verifyCertificate('0xabc', BlockchainNetwork.HYPERLEDGER_FABRIC)
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        blockchainService.getNetworkStatus(BlockchainNetwork.HYPERLEDGER_FABRIC)
      ).rejects.toThrow();
    });
  });

  describe('API endpoint construction', () => {
    it('should construct correct endpoint for network status', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await blockchainService.getNetworkStatus(BlockchainNetwork.ETHEREUM_MAINNET);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/blockchain/networks/ETHEREUM_MAINNET/status'),
        expect.any(Object)
      );
    });

    it('should construct correct endpoint for certificate data with query params', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await blockchainService.getCertificateBlockchainData(
        'cert-123',
        BlockchainNetwork.POLYGON_MAINNET
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/blockchain\/certificates\/cert-123\?network=POLYGON_MAINNET/),
        expect.any(Object)
      );
    });
  });
});
