import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { addTransaction, addPaymentRealtime } from '../../../../../slices/sabqr/sabqrSlice'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const WebhookHandler = () => {
  const dispatch = useDispatch()

  // Handle incoming webhook payment
  const handleWebhook = useCallback((event) => {
    const { encryptedData, data } = event.detail || {}

    let transactionData = data

    // If encrypted data is provided, decrypt it (placeholder - actual decryption would be server-side)
    if (encryptedData && !data) {
      // In production, encrypted data would be decrypted server-side
      // This is a placeholder for client-side handling
      console.log('Received encrypted webhook data')
      return
    }

    if (!transactionData) {
      console.warn('Webhook received without transaction data')
      return
    }

    // Normalize transaction data
    const normalizedTransaction = {
      transactionId: transactionData.transactionId || transactionData.txnId,
      qrId: transactionData.qrId || transactionData.merchantTxnId,
      merchantName: transactionData.merchantName || 'SabPaisa',
      customerName: transactionData.customerName || transactionData.payerName || 'Unknown',
      customerUPI: transactionData.customerUPI || transactionData.payerVPA || '',
      amount: parseFloat(transactionData.amount) || 0,
      status: (transactionData.status || transactionData.transactionStatus || 'success').toLowerCase(),
      date: transactionData.date || new Date().toISOString().split('T')[0],
      time: transactionData.time || new Date().toTimeString().split(' ')[0],
      referenceNumber: transactionData.referenceNumber || transactionData.rrn || '',
      bankRRN: transactionData.bankRRN || transactionData.rrn || '',
      paymentMode: transactionData.paymentMode || 'UPI',
      settlementAmount: parseFloat(transactionData.settlementAmount || transactionData.amount) || 0,
      transactionRef: transactionData.transactionRef || ''
    }

    // Dispatch to Redux
    dispatch(addTransaction(normalizedTransaction))
    dispatch(addPaymentRealtime(normalizedTransaction))

    // Show toast notification
    if (normalizedTransaction.status === 'success') {
      toast.success(
        `Payment received: ${sabqrService.formatCurrency(normalizedTransaction.amount)}`,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        }
      )
    } else if (normalizedTransaction.status === 'failed') {
      toast.error(
        `Payment failed: ${sabqrService.formatCurrency(normalizedTransaction.amount)}`,
        {
          position: 'top-right',
          autoClose: 5000
        }
      )
    }
  }, [dispatch])

  // Handle postMessage events (for iframe/cross-origin communication)
  const handlePostMessage = useCallback((event) => {
    // Validate origin in production
    // if (event.origin !== 'https://trusted-domain.com') return

    const { type, payload } = event.data || {}

    if (type === 'QR_PAYMENT_RECEIVED') {
      handleWebhook({ detail: { data: payload } })
    }
  }, [handleWebhook])

  useEffect(() => {
    // Listen for custom events
    window.addEventListener('qr-payment-webhook', handleWebhook)

    // Listen for postMessage events
    window.addEventListener('message', handlePostMessage)

    // Expose simulate function for testing
    window.simulatePayment = (qrId, amount = 100) => {
      const mockTransaction = {
        transactionId: `TXN${Date.now()}`,
        qrId: qrId || 'test123',
        merchantName: 'SabPaisa',
        customerName: 'Test Customer',
        customerUPI: 'testcustomer@upi',
        amount: amount,
        status: 'success',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        referenceNumber: `REF${Date.now()}`,
        bankRRN: `RRN${Date.now()}`,
        paymentMode: 'UPI',
        settlementAmount: amount,
        transactionRef: `STQ${qrId || 'test123'}`
      }

      window.dispatchEvent(new CustomEvent('qr-payment-webhook', {
        detail: { data: mockTransaction }
      }))

      console.log('Simulated payment:', mockTransaction)
    }

    // Cleanup
    return () => {
      window.removeEventListener('qr-payment-webhook', handleWebhook)
      window.removeEventListener('message', handlePostMessage)
      delete window.simulatePayment
    }
  }, [handleWebhook, handlePostMessage])

  // This component doesn't render anything
  return null
}

export default WebhookHandler
