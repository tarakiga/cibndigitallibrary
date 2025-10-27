import React from 'react'

// Minimal placeholder components to satisfy demo imports used by blockchain demo pages

export function BlockchainVerification(props: {
  certificateId: string
  transactionHash?: string
  network?: any
  showHeader?: boolean
  compact?: boolean
}) {
  return (
    <div data-testid="blockchain-verification">
      <strong>BlockchainVerification</strong>
      <div>Certificate: {props.certificateId}</div>
      {props.transactionHash && <div>Tx: {props.transactionHash}</div>}
    </div>
  )
}

export function TransactionHistory(props: {
  certificateId: string
  network?: any
  maxHeight?: string
}) {
  return (
    <div data-testid="transaction-history">
      <strong>TransactionHistory</strong>
      <div>Certificate: {props.certificateId}</div>
    </div>
  )
}

export function BlockchainStatus(props: {
  network?: any
  variant?: 'default' | 'compact' | 'minimal'
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  return (
    <div data-testid="blockchain-status">
      <strong>BlockchainStatus</strong>
      <div>Variant: {props.variant || 'default'}</div>
    </div>
  )
}

export function MultiNetworkStatus(props: { networks: any[] }) {
  return (
    <div data-testid="multi-network-status">
      <strong>MultiNetworkStatus</strong>
      <div>Networks: {props.networks?.length || 0}</div>
    </div>
  )
}

export function AnchorCertificateModal(props: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <div data-testid="anchor-certificate-modal" hidden={!props.open}>
      <strong>AnchorCertificateModal</strong>
    </div>
  )
}
