import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import reportsService from '../../../../../services/sabqr/reports.service'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const QRPerformanceReport = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    sort_by: 'collections_desc'
  })

  useEffect(() => {
    fetchReport()
  }, [filters])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getQRPerformanceReport(filters)
      setData(response.data || [])
    } catch (err) {
      toast.error('Failed to load QR performance report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      toast.info(`Generating ${format.toUpperCase()} report...`)
      const filename = `qr-performance-report-${new Date().toISOString().split('T')[0]}.${format}`
      let blob

      if (format === 'csv') {
        blob = await reportsService.downloadReportCSV('performance', filters)
      } else if (format === 'xlsx') {
        blob = await reportsService.downloadReportExcel('performance', filters)
      } else {
        blob = await reportsService.downloadReportPDF('performance', filters)
      }

      reportsService.downloadFile(blob, filename)
      toast.success(`${format.toUpperCase()} report downloaded`)
    } catch (err) {
      toast.error(`Failed to export ${format} report`)
    }
  }

  const getPerformanceIndicator = (value, max) => {
    const percentage = max > 0 ? (value / max) * 100 : 0
    return (
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-tertiary)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: percentage > 70 ? 'var(--success-color)' : percentage > 30 ? 'var(--warning-color)' : 'var(--danger-color)',
            transition: 'width 0.3s'
          }}
        />
      </div>
    )
  }

  const maxCollections = Math.max(...data.map(qr => qr.total_collections || 0), 1)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          QR Performance Report
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Analyze individual QR code performance metrics
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
            <label className="form-label">Sort By</label>
            <select
              className="form-input"
              value={filters.sort_by}
              onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
            >
              <option value="collections_desc">Highest Collections</option>
              <option value="collections_asc">Lowest Collections</option>
              <option value="transactions_desc">Most Transactions</option>
              <option value="transactions_asc">Least Transactions</option>
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
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
          <div className="empty-state-icon">📈</div>
          <h3 className="empty-state-title">No Performance Data</h3>
          <p className="empty-state-description">
            QR performance data will appear here once transactions are processed
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>QR Code</th>
                <th>Status</th>
                <th>Total Collections</th>
                <th>Transactions</th>
                <th>Avg. Value</th>
                <th>Performance</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((qr) => (
                <tr key={qr.id || qr.qr_identifier}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{qr.reference_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {qr.qr_identifier}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${qr.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {qr.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {sabqrService.formatCurrency(qr.total_collections || 0)}
                  </td>
                  <td>{qr.transaction_count || 0}</td>
                  <td>
                    {sabqrService.formatCurrency(
                      qr.transaction_count > 0
                        ? (qr.total_collections || 0) / qr.transaction_count
                        : 0
                    )}
                  </td>
                  <td style={{ width: '150px' }}>
                    {getPerformanceIndicator(qr.total_collections || 0, maxCollections)}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {sabqrService.formatDate(qr.created_at)}
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

export default QRPerformanceReport
