import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import reportsService from '../../../../../services/sabqr/reports.service'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const RefundReport = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({
    total_refunds: 0,
    total_amount: 0,
    pending_refunds: 0
  })
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: 'all'
  })

  useEffect(() => {
    fetchReport()
  }, [filters])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getRefundReport(filters)
      setData(response.data || [])
      if (response.summary) {
        setSummary(response.summary)
      }
    } catch (err) {
      toast.error('Failed to load refund report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      toast.info(`Generating ${format.toUpperCase()} report...`)
      const filename = `refund-report-${new Date().toISOString().split('T')[0]}.${format}`
      let blob

      if (format === 'csv') {
        blob = await reportsService.downloadReportCSV('refunds', filters)
      } else if (format === 'xlsx') {
        blob = await reportsService.downloadReportExcel('refunds', filters)
      } else {
        blob = await reportsService.downloadReportPDF('refunds', filters)
      }

      reportsService.downloadFile(blob, filename)
      toast.success(`${format.toUpperCase()} report downloaded`)
    } catch (err) {
      toast.error(`Failed to export ${format} report`)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'badge-success'
      case 'pending':
      case 'processing':
        return 'badge-warning'
      case 'failed':
        return 'badge-danger'
      default:
        return 'badge-secondary'
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Refund Report
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          View all refund transactions and their status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="kpi-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--info-light)' }}>
            ↩️
          </div>
          <div className="kpi-card-value">{summary.total_refunds || 0}</div>
          <div className="kpi-card-label">Total Refunds</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--danger-light)' }}>
            💸
          </div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.total_amount || 0)}
          </div>
          <div className="kpi-card-label">Total Refunded Amount</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--warning-light)' }}>
            ⏳
          </div>
          <div className="kpi-card-value">{summary.pending_refunds || 0}</div>
          <div className="kpi-card-label">Pending Refunds</div>
        </div>
      </div>

      {/* Filters */}
      <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.from_date}
              onChange={(e) => setFilters(prev => ({ ...prev, from_date: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.to_date}
              onChange={(e) => setFilters(prev => ({ ...prev, to_date: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
              Export CSV
            </button>
            <button className="btn btn-secondary" onClick={() => handleExport('xlsx')}>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
          <p>Loading report...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">↩️</div>
          <h3 className="empty-state-title">No Refunds Found</h3>
          <p className="empty-state-description">
            No refund transactions found for the selected filters
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Original Transaction</th>
                <th>Customer</th>
                <th>Refund Amount</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((refund) => (
                <tr key={refund.refundId || refund.transactionId}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {refund.refundId || refund.transactionId}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {refund.originalTransactionId}
                  </td>
                  <td>
                    <div>{refund.customerName || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {refund.customerUPI || '-'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--danger-color)' }}>
                    -{sabqrService.formatCurrency(refund.amount || 0)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(refund.status)}`}>
                      {refund.status}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={refund.reason}
                    >
                      {refund.reason || '-'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {sabqrService.formatDate(refund.date || refund.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RefundReport
