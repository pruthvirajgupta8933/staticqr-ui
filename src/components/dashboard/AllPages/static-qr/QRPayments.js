import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash/debounce'
import {
  fetchAllTransactions,
  fetchPaymentsSummary,
  selectTransactions,
  selectPaymentsSummary,
  selectPagination,
  selectLoading,
  setPagination,
  setFilters,
  selectFilters
} from '../../../../slices/sabqr/sabqrSlice'
import sabqrService from '../../../../services/sabqr/sabqr.service'
import TransactionDetailModal from './components/TransactionDetailModal'
import RefundModal from './components/RefundModal'

const QRPayments = () => {
  const dispatch = useDispatch()
  const transactions = useSelector(selectTransactions)
  const paymentsSummary = useSelector(selectPaymentsSummary)
  const pagination = useSelector(selectPagination)
  const loading = useSelector(selectLoading)
  const filters = useSelector(selectFilters)

  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: 'all',
    from_date: '',
    to_date: ''
  })

  // Fetch transactions on mount and filter changes
  useEffect(() => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: localFilters.search || undefined,
      status: localFilters.status === 'all' ? undefined : localFilters.status,
      from_date: localFilters.from_date || undefined,
      to_date: localFilters.to_date || undefined
    }
    dispatch(fetchAllTransactions(params))
    dispatch(fetchPaymentsSummary(params))
  }, [dispatch, pagination.page, pagination.pageSize, localFilters])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setLocalFilters(prev => ({ ...prev, search: value }))
    }, 500),
    []
  )

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value)
  }

  const handleStatusFilter = (e) => {
    setLocalFilters(prev => ({ ...prev, status: e.target.value }))
    dispatch(setPagination({ page: 1 }))
  }

  const handleDateChange = (field) => (e) => {
    setLocalFilters(prev => ({ ...prev, [field]: e.target.value }))
    dispatch(setPagination({ page: 1 }))
  }

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }))
  }

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailModal(true)
  }

  const handleRefundClick = (transaction) => {
    setSelectedTransaction(transaction)
    setShowRefundModal(true)
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

  const renderPagination = () => {
    const pages = []
    const totalPages = pagination.totalPages || 1
    const currentPage = pagination.page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ padding: '0 0.5rem' }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        )}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    )
  }

  return (
    <div className="payments-container">
      {/* Summary Cards */}
      <div className="payments-summary">
        <div className="kpi-card">
          <div className="kpi-card-icon">💰</div>
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(paymentsSummary.total_amount || 0)}
          </div>
          <div className="kpi-card-label">Total Amount</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon">📊</div>
          <div className="kpi-card-value">{paymentsSummary.total_transactions || 0}</div>
          <div className="kpi-card-label">Total Transactions</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon">✅</div>
          <div className="kpi-card-value">{paymentsSummary.success_rate || 0}%</div>
          <div className="kpi-card-label">Success Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="payments-filters">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by Transaction ID, Customer..."
            onChange={handleSearchChange}
          />
        </div>

        <select
          className="form-input filter-select"
          value={localFilters.status}
          onChange={handleStatusFilter}
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <div className="date-range-picker">
          <input
            type="date"
            className="form-input"
            value={localFilters.from_date}
            onChange={handleDateChange('from_date')}
            placeholder="From Date"
          />
          <span className="date-range-separator">to</span>
          <input
            type="date"
            className="form-input"
            value={localFilters.to_date}
            onChange={handleDateChange('to_date')}
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading.payments && (
        <div className="empty-state">
          <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading.payments && transactions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h3 className="empty-state-title">No Transactions Found</h3>
          <p className="empty-state-description">
            {localFilters.search || localFilters.status !== 'all' || localFilters.from_date || localFilters.to_date
              ? 'No transactions match your filters. Try adjusting your search.'
              : 'Transactions will appear here once payments are made through your QR codes.'}
          </p>
        </div>
      )}

      {/* Transactions Table */}
      {!loading.payments && transactions.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transactionId}>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {tx.transactionId}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{tx.customerName || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tx.customerUPI || '-'}
                      </div>
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
                    <div>
                      <div>{sabqrService.formatDate(tx.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sabqrService.formatTime(tx.time)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {tx.referenceNumber || tx.bankRRN || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewDetails(tx)}
                      >
                        Details
                      </button>
                      {tx.status === 'success' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRefundClick(tx)}
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading.payments && transactions.length > 0 && pagination.totalPages > 1 && (
        renderPagination()
      )}

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTransaction(null)
          }}
          onRefund={() => {
            setShowDetailModal(false)
            setShowRefundModal(true)
          }}
        />
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <RefundModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowRefundModal(false)
            setSelectedTransaction(null)
          }}
          onSuccess={() => {
            setShowRefundModal(false)
            setSelectedTransaction(null)
            // Refresh transactions
            dispatch(fetchAllTransactions({
              page: pagination.page,
              pageSize: pagination.pageSize
            }))
          }}
        />
      )}
    </div>
  )
}

export default QRPayments
