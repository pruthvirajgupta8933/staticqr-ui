import React from 'react'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const TransactionDetailModal = ({ transaction, onClose, onRefund }) => {
  if (!transaction) return null

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'badge-success'
      case 'pending':
        return 'badge-warning'
      case 'failed':
        return 'badge-danger'
      case 'refunded':
        return 'badge-info'
      default:
        return 'badge-secondary'
    }
  }

  const DetailRow = ({ label, value, mono = false }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${mono ? 'mono' : ''}`}>{value || '-'}</span>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Transaction Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Status Banner */}
          <div
            className={`status-banner ${transaction.status}`}
            style={{
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              marginBottom: '1.5rem',
              textAlign: 'center',
              background:
                transaction.status === 'success'
                  ? 'var(--success-light)'
                  : transaction.status === 'pending'
                  ? 'var(--warning-light)'
                  : transaction.status === 'refunded'
                  ? 'var(--info-light)'
                  : 'var(--danger-light)'
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.25rem'
              }}
            >
              {sabqrService.formatCurrency(transaction.amount)}
            </div>
            <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
              {transaction.status?.toUpperCase()}
            </span>
          </div>

          {/* Transaction Information */}
          <div className="detail-section">
            <h4 className="detail-section-title">Transaction Information</h4>
            <DetailRow label="Transaction ID" value={transaction.transactionId} mono />
            <DetailRow label="Reference Number" value={transaction.referenceNumber} mono />
            <DetailRow label="Bank RRN" value={transaction.bankRRN} mono />
            <DetailRow label="Transaction Ref" value={transaction.transactionRef} mono />
            <DetailRow label="Payment Mode" value={transaction.paymentMode} />
            <DetailRow
              label="Date & Time"
              value={`${sabqrService.formatDate(transaction.date)} at ${sabqrService.formatTime(transaction.time)}`}
            />
          </div>

          {/* Customer Information */}
          <div className="detail-section">
            <h4 className="detail-section-title">Customer Information</h4>
            <DetailRow label="Customer Name" value={transaction.customerName} />
            <DetailRow label="Customer UPI" value={transaction.customerUPI} mono />
          </div>

          {/* Payment Information */}
          <div className="detail-section">
            <h4 className="detail-section-title">Payment Information</h4>
            <DetailRow
              label="Transaction Amount"
              value={sabqrService.formatCurrency(transaction.amount)}
            />
            <DetailRow
              label="Settlement Amount"
              value={sabqrService.formatCurrency(transaction.settlementAmount || transaction.amount)}
            />
            <DetailRow label="QR ID" value={transaction.qrId} mono />
            <DetailRow label="Merchant" value={transaction.merchantName || 'SabPaisa'} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {transaction.status === 'success' && onRefund && (
            <button className="btn btn-danger" onClick={onRefund}>
              Process Refund
            </button>
          )}
        </div>

        <style>{`
          .detail-section {
            margin-bottom: 1.5rem;
          }

          .detail-section:last-child {
            margin-bottom: 0;
          }

          .detail-section-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.5rem 0;
            border-bottom: 1px dashed var(--border-color);
          }

          .detail-row:last-child {
            border-bottom: none;
          }

          .detail-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .detail-value {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
            text-align: right;
            max-width: 60%;
            word-break: break-all;
          }

          .detail-value.mono {
            font-family: monospace;
            font-size: 0.75rem;
          }
        `}</style>
      </div>
    </div>
  )
}

export default TransactionDetailModal
