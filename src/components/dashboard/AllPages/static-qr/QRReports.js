import React, { useState } from 'react'
import TransactionReport from './reports/TransactionReport'
import SettlementReport from './reports/SettlementReport'
import QRPerformanceReport from './reports/QRPerformanceReport'
import RefundReport from './reports/RefundReport'

const REPORT_TYPES = [
  {
    id: 'transactions',
    title: 'Transaction Report',
    description: 'Detailed view of all transactions with filtering and export options',
    icon: '💳',
    component: TransactionReport
  },
  {
    id: 'settlements',
    title: 'Settlement Report',
    description: 'Track settlement status and reconciliation details',
    icon: '🏦',
    component: SettlementReport
  },
  {
    id: 'performance',
    title: 'QR Performance Report',
    description: 'Analyze individual QR code performance metrics',
    icon: '📈',
    component: QRPerformanceReport
  },
  {
    id: 'refunds',
    title: 'Refund Report',
    description: 'View all refund transactions and their status',
    icon: '↩️',
    component: RefundReport
  }
]

const QRReports = () => {
  const [selectedReport, setSelectedReport] = useState(null)

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId)
  }

  const handleBack = () => {
    setSelectedReport(null)
  }

  // Render selected report component
  if (selectedReport) {
    const report = REPORT_TYPES.find(r => r.id === selectedReport)
    if (report) {
      const ReportComponent = report.component
      return (
        <div className="reports-container">
          <div style={{ marginBottom: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleBack}>
              ← Back to Reports
            </button>
          </div>
          <ReportComponent />
        </div>
      )
    }
  }

  return (
    <div className="reports-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Reports
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Generate and download detailed reports for your QR code transactions
        </p>
      </div>

      <div className="reports-grid">
        {REPORT_TYPES.map((report) => (
          <div
            key={report.id}
            className="report-card"
            onClick={() => handleReportSelect(report.id)}
          >
            <div className="report-card-icon">{report.icon}</div>
            <h3 className="report-card-title">{report.title}</h3>
            <p className="report-card-description">{report.description}</p>
            <button className="btn btn-sm btn-primary" style={{ marginTop: 'auto' }}>
              View Report
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="chart-card" style={{ marginTop: '1.5rem' }}>
        <div className="chart-card-header">
          <h3 className="chart-card-title">Export Options</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              flex: '1 1 200px',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontWeight: 500 }}>CSV Export</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Spreadsheet compatible
            </div>
          </div>
          <div
            style={{
              flex: '1 1 200px',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📑</div>
            <div style={{ fontWeight: 500 }}>Excel Export</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              With formatting
            </div>
          </div>
          <div
            style={{
              flex: '1 1 200px',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            <div style={{ fontWeight: 500 }}>PDF Export</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Print ready format
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRReports
