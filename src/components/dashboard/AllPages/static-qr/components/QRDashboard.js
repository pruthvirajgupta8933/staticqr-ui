import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { fetchDashboardSummary, selectDashboard, selectLoading } from '../../../../../slices/sabqr/sabqrSlice'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const QRDashboard = ({ onNavigate }) => {
  const dispatch = useDispatch()
  const dashboard = useSelector(selectDashboard)
  const loading = useSelector(selectLoading)
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    // Initial fetch
    dispatch(fetchDashboardSummary())

    // Set up polling every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      dispatch(fetchDashboardSummary())
    }, 30000)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [dispatch])

  const { summary, collection_trend, top_performing_qrs, recent_payments } = dashboard

  // Collection Trend Chart Data
  const trendChartData = {
    labels: collection_trend?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Collections',
        data: collection_trend?.map(item => item.amount) || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => sabqrService.formatCurrency(context.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => sabqrService.formatCurrency(value)
        }
      }
    }
  }

  // Top QR Performance Chart Data
  const topQRChartData = {
    labels: top_performing_qrs?.map(qr => qr.identifier?.substring(0, 10) || 'QR') || [],
    datasets: [
      {
        label: 'Collections',
        data: top_performing_qrs?.map(qr => qr.collections) || [],
        backgroundColor: '#2563eb',
        borderRadius: 4
      }
    ]
  }

  const topQRChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => sabqrService.formatCurrency(context.raw)
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => sabqrService.formatCurrency(value)
        }
      }
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

  if (loading.dashboard && !summary.total_qr_codes) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="qr-dashboard-container">
      {/* KPI Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--primary-light)' }}>
            💰
          </div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.total_collections || 0)}
          </div>
          <div className="kpi-card-label">Total Collections</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--success-light)' }}>
            📈
          </div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.today_collections || 0)}
          </div>
          <div className="kpi-card-label">Today's Collections</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--info-light)' }}>
            📱
          </div>
          <div className="kpi-card-value">{summary.total_qr_codes || 0}</div>
          <div className="kpi-card-label">Total QR Codes</div>
          <div className="kpi-card-trend positive">
            <span>{summary.active_qr_codes || 0} active</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--warning-light)' }}>
            📊
          </div>
          <div className="kpi-card-value">{summary.total_transactions || 0}</div>
          <div className="kpi-card-label">Total Transactions</div>
          <div className="kpi-card-trend positive">
            <span>+{summary.today_transactions || 0} today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--success-light)' }}>
            ✅
          </div>
          <div className="kpi-card-value">{summary.success_rate || 0}%</div>
          <div className="kpi-card-label">Success Rate</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: 'var(--primary-light)' }}>
            💵
          </div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.average_transaction_value || 0)}
          </div>
          <div className="kpi-card-label">Avg. Transaction Value</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        {/* Collection Trend Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Collection Trend (Last 7 Days)</h3>
          </div>
          <div className="chart-container">
            {collection_trend && collection_trend.length > 0 ? (
              <Line data={trendChartData} options={trendChartOptions} />
            ) : (
              <div className="empty-state">
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing QRs */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Top Performing QR Codes</h3>
          </div>
          <div className="chart-container">
            {top_performing_qrs && top_performing_qrs.length > 0 ? (
              <Bar data={topQRChartData} options={topQRChartOptions} />
            ) : (
              <div className="empty-state">
                <p>No QR performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Recent Payments</h3>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onNavigate && onNavigate('payments')}
          >
            View All
          </button>
        </div>

        {recent_payments && recent_payments.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent_payments.slice(0, 5).map((payment, idx) => (
                  <tr key={payment.transactionId || idx}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {payment.transactionId}
                    </td>
                    <td>{payment.customerName || 'Unknown'}</td>
                    <td style={{ fontWeight: 600 }}>
                      {sabqrService.formatCurrency(payment.amount)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {sabqrService.formatDate(payment.date)} {sabqrService.formatTime(payment.time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <h3 className="empty-state-title">No Recent Payments</h3>
            <p className="empty-state-description">
              Payments will appear here once customers start paying through your QR codes.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('generation')}
          >
            + Create New QR
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate && onNavigate('management')}
          >
            Manage QR Codes
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate && onNavigate('reports')}
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRDashboard
