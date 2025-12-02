import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import reportsService from '../../../../../services/sabqr/reports.service'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const SettlementReport = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({
    total_settled: 0,
    pending_settlement: 0,
    total_transactions: 0
  })
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    settlement_status: 'all'
  })

  useEffect(() => {
    fetchReport()
  }, [filters])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await reportsService.getSettlementReport(filters)
      setData(response.data || [])
      if (response.summary) {
        setSummary(response.summary)
      }
    } catch (err) {
      toast.error('Failed to load settlement report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      toast.info(`Generating ${format.toUpperCase()} report...`)
      const filename = `settlement-report-${new Date().toISOString().split('T')[0]}.${format}`
      let blob

      if (format === 'csv') {
        blob = await reportsService.downloadReportCSV('settlements', filters)
      } else if (format === 'xlsx') {
        blob = await reportsService.downloadReportExcel('settlements', filters)
      } else {
        blob = await reportsService.downloadReportPDF('settlements', filters)
      }

      reportsService.downloadFile(blob, filename)
      toast.success(`${format.toUpperCase()} report downloaded`)
    } catch (err) {
      toast.error(`Failed to export ${format} report`)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Settlement Report
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track settlement status and reconciliation details
        </p>
      </div>

      {/* Summary Cards */}
      <div className="kpi-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--success-light)' }}>
            ✅
          </div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.total_settled || 0)}
          </div>
          <div className="kpi-card-label">Total Settled</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--warning-light)' }}>
            ⏳
          </div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.pending_settlement || 0)}
          </div>
          <div className="kpi-card-label">Pending Settlement</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--info-light)' }}>
            📊
          </div>
          <div className="kpi-card-value">{summary.total_transactions || 0}</div>
          <div className="kpi-card-label">Total Transactions</div>
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
            <label className="form-label">Settlement Status</label>
            <select
              className="form-input"
              value={filters.settlement_status}
              onChange={(e) => setFilters(prev => ({ ...prev, settlement_status: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="settled">Settled</option>
              <option value="pending">Pending</option>
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
          <div className="empty-state-icon">🏦</div>
          <h3 className="empty-state-title">No Settlement Data</h3>
          <p className="empty-state-description">
            Settlement data will appear here once transactions are processed
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Settlement Date</th>
                <th>Transaction Count</th>
                <th>Gross Amount</th>
                <th>Fees</th>
                <th>Net Amount</th>
                <th>Status</th>
                <th>UTR</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td>{sabqrService.formatDate(row.settlement_date)}</td>
                  <td>{row.transaction_count || 0}</td>
                  <td>{sabqrService.formatCurrency(row.gross_amount || 0)}</td>
                  <td style={{ color: 'var(--danger-color)' }}>
                    -{sabqrService.formatCurrency(row.fees || 0)}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {sabqrService.formatCurrency(row.net_amount || 0)}
                  </td>
                  <td>
                    <span className={`badge ${row.status === 'settled' ? 'badge-success' : 'badge-warning'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {row.utr || '-'}
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

export default SettlementReport
