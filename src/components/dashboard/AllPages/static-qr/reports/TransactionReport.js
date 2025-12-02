import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import reportsService from '../../../../../services/sabqr/reports.service'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const TransactionReport = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: 'all'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1
  })

  useEffect(() => {
    fetchReport()
  }, [pagination.page, filters])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        status: filters.status === 'all' ? undefined : filters.status
      }
      const response = await reportsService.getTransactionReport(params)
      setData(response.data || [])
      if (response.pagination) {
        setPagination(prev => ({ ...prev, ...response.pagination }))
      }
    } catch (err) {
      toast.error('Failed to load transaction report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      toast.info(`Generating ${format.toUpperCase()} report...`)
      let blob
      const filename = `transaction-report-${new Date().toISOString().split('T')[0]}.${format}`

      if (format === 'csv') {
        blob = await reportsService.downloadReportCSV('transactions', filters)
      } else if (format === 'xlsx') {
        blob = await reportsService.downloadReportExcel('transactions', filters)
      } else {
        blob = await reportsService.downloadReportPDF('transactions', filters)
      }

      reportsService.downloadFile(blob, filename)
      toast.success(`${format.toUpperCase()} report downloaded`)
    } catch (err) {
      toast.error(`Failed to export ${format} report`)
    }
  }

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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Transaction Report
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed view of all transactions with filtering and export options
        </p>
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
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
              Export CSV
            </button>
            <button className="btn btn-secondary" onClick={() => handleExport('xlsx')}>
              Export Excel
            </button>
            <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
              Export PDF
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
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Data Found</h3>
          <p className="empty-state-description">
            No transactions found for the selected filters
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>QR ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr key={tx.transactionId}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {tx.transactionId}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {tx.qrId}
                  </td>
                  <td>
                    <div>{tx.customerName || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.customerUPI || '-'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {sabqrService.formatCurrency(tx.amount)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <div>{sabqrService.formatDate(tx.date)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {sabqrService.formatTime(tx.time)}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {tx.referenceNumber || tx.bankRRN || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            &lt;
          </button>
          <span style={{ padding: '0 1rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  )
}

export default TransactionReport
