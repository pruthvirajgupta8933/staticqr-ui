import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { processQRRefund, selectLoading } from '../../../../../slices/sabqr/sabqrSlice'
import sabqrService from '../../../../../services/sabqr/sabqr.service'
import HDFC_CONFIG from '../../../../../config/hdfc.config'

const RefundModal = ({ transaction, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const loading = useSelector(selectLoading)

  const [refundAmount, setRefundAmount] = useState(transaction?.amount?.toString() || '')
  const [refundReason, setRefundReason] = useState('')
  const [isFullRefund, setIsFullRefund] = useState(true)
  const [errors, setErrors] = useState({})

  if (!transaction) return null

  const maxAmount = transaction.amount || 0

  const validateForm = () => {
    const newErrors = {}

    // Validate amount
    const amount = parseFloat(refundAmount)
    if (!refundAmount || isNaN(amount)) {
      newErrors.amount = 'Refund amount is required'
    } else if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else if (amount > maxAmount) {
      newErrors.amount = `Amount cannot exceed ${sabqrService.formatCurrency(maxAmount)}`
    }

    // Validate reason
    if (!refundReason || refundReason.trim().length === 0) {
      newErrors.reason = 'Refund reason is required'
    } else if (refundReason.trim().length < HDFC_CONFIG.VALIDATION.REFUND_REASON.MIN_LENGTH) {
      newErrors.reason = `Reason must be at least ${HDFC_CONFIG.VALIDATION.REFUND_REASON.MIN_LENGTH} characters`
    } else if (refundReason.length > HDFC_CONFIG.VALIDATION.REFUND_REASON.MAX_LENGTH) {
      newErrors.reason = `Reason cannot exceed ${HDFC_CONFIG.VALIDATION.REFUND_REASON.MAX_LENGTH} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    setRefundAmount(value)
    setIsFullRefund(parseFloat(value) === maxAmount)
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }))
    }
  }

  const handleReasonChange = (e) => {
    setRefundReason(e.target.value)
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: '' }))
    }
  }

  const handleFullRefundToggle = () => {
    const newIsFullRefund = !isFullRefund
    setIsFullRefund(newIsFullRefund)
    if (newIsFullRefund) {
      setRefundAmount(maxAmount.toString())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await dispatch(processQRRefund({
        transactionId: transaction.transactionId,
        amount: parseFloat(refundAmount),
        reason: refundReason.trim()
      })).unwrap()

      toast.success('Refund processed successfully')
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process refund')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Process Refund</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Transaction Summary */}
            <div
              style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {transaction.transactionId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Original Amount</span>
                <span style={{ fontWeight: 600 }}>
                  {sabqrService.formatCurrency(maxAmount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
                <span>{transaction.customerName || 'Unknown'}</span>
              </div>
            </div>

            {/* Full Refund Toggle */}
            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={isFullRefund}
                  onChange={handleFullRefundToggle}
                />
                <span>Full Refund</span>
              </label>
            </div>

            {/* Refund Amount */}
            <div className="form-group">
              <label className="form-label">
                Refund Amount <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.amount ? 'error' : ''}`}
                value={refundAmount}
                onChange={handleAmountChange}
                placeholder="Enter refund amount"
                disabled={isFullRefund}
              />
              {errors.amount && <p className="form-error">{errors.amount}</p>}
              <p className="form-helper">
                Maximum refundable amount: {sabqrService.formatCurrency(maxAmount)}
              </p>
            </div>

            {/* Refund Reason */}
            <div className="form-group">
              <label className="form-label">
                Reason for Refund <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <textarea
                className={`form-input ${errors.reason ? 'error' : ''}`}
                value={refundReason}
                onChange={handleReasonChange}
                placeholder="Please provide a detailed reason for this refund"
                rows={4}
                maxLength={HDFC_CONFIG.VALIDATION.REFUND_REASON.MAX_LENGTH}
              />
              {errors.reason && <p className="form-error">{errors.reason}</p>}
              <p className="form-helper">
                {refundReason.length}/{HDFC_CONFIG.VALIDATION.REFUND_REASON.MAX_LENGTH} characters
                (minimum {HDFC_CONFIG.VALIDATION.REFUND_REASON.MIN_LENGTH})
              </p>
            </div>

            {/* Warning */}
            <div
              style={{
                padding: '0.75rem',
                background: 'var(--warning-light)',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.75rem',
                color: '#b45309'
              }}
            >
              <strong>Warning:</strong> This action cannot be undone. The refund will be
              processed immediately and the funds will be returned to the customer's account.
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading.refund}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading.refund}
            >
              {loading.refund ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Refund ${sabqrService.formatCurrency(parseFloat(refundAmount) || 0)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RefundModal
