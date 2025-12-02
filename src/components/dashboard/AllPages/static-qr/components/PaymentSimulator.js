import React, { useState } from 'react'
import { toast } from 'react-toastify'

const PaymentSimulator = () => {
  const [qrId, setQrId] = useState('')
  const [amount, setAmount] = useState('100')
  const [customerName, setCustomerName] = useState('Test Customer')
  const [customerUPI, setCustomerUPI] = useState('testcustomer@upi')
  const [status, setStatus] = useState('success')

  const handleSimulate = () => {
    if (!qrId) {
      toast.error('Please enter a QR ID')
      return
    }

    const mockTransaction = {
      transactionId: `TXN${Date.now()}`,
      qrId: qrId,
      merchantName: 'SabPaisa',
      customerName: customerName,
      customerUPI: customerUPI,
      amount: parseFloat(amount) || 100,
      status: status,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      referenceNumber: `REF${Date.now()}`,
      bankRRN: `RRN${Date.now()}`,
      paymentMode: 'UPI',
      settlementAmount: parseFloat(amount) || 100,
      transactionRef: `STQ${qrId}`
    }

    window.dispatchEvent(new CustomEvent('qr-payment-webhook', {
      detail: { data: mockTransaction }
    }))

    toast.success(`Simulated ${status} payment of ₹${amount}`)
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Payment Simulator (Dev Tool)</h3>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">QR ID / Identifier</label>
          <input
            type="text"
            className="form-input"
            value={qrId}
            onChange={(e) => setQrId(e.target.value)}
            placeholder="e.g., shop123abc"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Test Customer"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Customer UPI</label>
            <input
              type="text"
              className="form-input"
              value={customerUPI}
              onChange={(e) => setCustomerUPI(e.target.value)}
              placeholder="customer@upi"
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSimulate}
        >
          Simulate Payment
        </button>

        <div
          style={{
            padding: '0.75rem',
            background: 'var(--info-light)',
            borderRadius: 'var(--border-radius)',
            fontSize: '0.75rem',
            color: '#1d4ed8'
          }}
        >
          <strong>Note:</strong> This is a development tool to simulate payment webhooks.
          Use <code>window.simulatePayment('qrId', amount)</code> from console for quick testing.
        </div>
      </div>
    </div>
  )
}

export default PaymentSimulator
