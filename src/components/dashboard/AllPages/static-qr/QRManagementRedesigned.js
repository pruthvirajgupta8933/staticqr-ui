import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import debounce from 'lodash/debounce'
import {
  fetchQRList,
  deleteQR,
  updateQR,
  setFilters,
  setPagination,
  selectQRList,
  selectFilters,
  selectPagination,
  selectLoading,
  selectQRSummary
} from '../../../../slices/sabqr/sabqrSlice'
import sabqrService from '../../../../services/sabqr/sabqr.service'
import HDFC_CONFIG from '../../../../config/hdfc.config'
import QRCodeWithBrand from './components/QRCodeWithBrand'

const QRManagementRedesigned = ({ onNavigate }) => {
  const dispatch = useDispatch()
  const qrList = useSelector(selectQRList)
  const filters = useSelector(selectFilters)
  const pagination = useSelector(selectPagination)
  const loading = useSelector(selectLoading)
  const summary = useSelector(selectQRSummary)

  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedQR, setSelectedQR] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  // Load QR list on mount and filter changes
  useEffect(() => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      status: filters.status === 'all' ? undefined : filters.status,
      category: filters.category === 'all' ? undefined : filters.category
    }
    dispatch(fetchQRList(params))
  }, [dispatch, pagination.page, pagination.pageSize, filters])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(setFilters({ search: value }))
    }, 500),
    [dispatch]
  )

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value)
  }

  const handleStatusFilter = (e) => {
    dispatch(setFilters({ status: e.target.value }))
  }

  const handleCategoryFilter = (e) => {
    dispatch(setFilters({ category: e.target.value }))
  }

  const handleSortChange = (e) => {
    const [sort_by, sort_order] = e.target.value.split('_')
    dispatch(setFilters({ sort_by, sort_order }))
  }

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }))
  }

  const handleViewQR = (qr) => {
    setSelectedQR(qr)
    setShowQRModal(true)
  }

  const handleDeleteClick = (qr) => {
    setSelectedQR(qr)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedQR) return

    try {
      await dispatch(deleteQR(selectedQR.id)).unwrap()
      toast.success('QR Code deleted successfully')
      setShowDeleteModal(false)
      setSelectedQR(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete QR')
    }
  }

  const handleToggleStatus = async (qr) => {
    const newStatus = qr.status === 'active' ? 'archived' : 'active'
    try {
      await dispatch(updateQR({
        qrId: qr.id,
        data: { status: newStatus }
      })).unwrap()
      toast.success(`QR Code ${newStatus === 'active' ? 'activated' : 'archived'}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const renderQRCard = (qr) => (
    <div key={qr.id} className="qr-card">
      <div className="qr-card-header">
        <div>
          <h3 className="qr-card-title">{qr.reference_name}</h3>
          <p className="qr-card-identifier">{qr.full_vpa || `sabpaisa.${qr.qr_identifier}@hdfcbank`}</p>
        </div>
        <span className={`badge badge-${qr.status === 'active' ? 'success' : 'secondary'}`}>
          {qr.status}
        </span>
      </div>

      <div className="qr-card-stats">
        <div className="qr-stat">
          <div className="qr-stat-label">Collections</div>
          <div className="qr-stat-value">
            {sabqrService.formatCurrency(qr.total_collections || 0)}
          </div>
        </div>
        <div className="qr-stat">
          <div className="qr-stat-label">Transactions</div>
          <div className="qr-stat-value">{qr.transaction_count || 0}</div>
        </div>
        <div className="qr-stat">
          <div className="qr-stat-label">Amount Type</div>
          <div className="qr-stat-value">
            {qr.max_amount_per_transaction ? 'Fixed' : 'Dynamic'}
          </div>
        </div>
        <div className="qr-stat">
          <div className="qr-stat-label">Created</div>
          <div className="qr-stat-value">
            {sabqrService.formatDate(qr.created_at)}
          </div>
        </div>
      </div>

      <div className="qr-card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => handleViewQR(qr)}
        >
          View QR
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => handleToggleStatus(qr)}
        >
          {qr.status === 'active' ? 'Archive' : 'Activate'}
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDeleteClick(qr)}
        >
          Delete
        </button>
      </div>
    </div>
  )

  const renderTableRow = (qr) => (
    <tr key={qr.id}>
      <td>
        <div>
          <div style={{ fontWeight: 500 }}>{qr.reference_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {qr.qr_identifier}
          </div>
        </div>
      </td>
      <td>
        <span className={`badge badge-${qr.status === 'active' ? 'success' : 'secondary'}`}>
          {qr.status}
        </span>
      </td>
      <td>{sabqrService.formatCurrency(qr.total_collections || 0)}</td>
      <td>{qr.transaction_count || 0}</td>
      <td>{qr.max_amount_per_transaction ? sabqrService.formatCurrency(qr.max_amount_per_transaction) : 'Dynamic'}</td>
      <td>{sabqrService.formatDate(qr.created_at)}</td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleViewQR(qr)}
          >
            View
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleToggleStatus(qr)}
          >
            {qr.status === 'active' ? 'Archive' : 'Activate'}
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteClick(qr)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )

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
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
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
    <div className="qr-management-container">
      {/* Summary Stats */}
      <div className="kpi-cards" style={{ marginBottom: '1rem' }}>
        <div className="kpi-card">
          <div className="kpi-card-value">{summary.total_active || 0}</div>
          <div className="kpi-card-label">Active QR Codes</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value">{summary.total_inactive || 0}</div>
          <div className="kpi-card-label">Archived QR Codes</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value">
            {sabqrService.formatCurrency(summary.total_collections || 0)}
          </div>
          <div className="kpi-card-label">Total Collections</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value">{summary.total_transactions || 0}</div>
          <div className="kpi-card-label">Total Transactions</div>
        </div>
      </div>

      {/* Header with Filters */}
      <div className="qr-management-header">
        <div className="qr-management-filters">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search QR codes..."
              defaultValue={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          <select
            className="form-input filter-select"
            value={filters.status}
            onChange={handleStatusFilter}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className="form-input filter-select"
            value={filters.category}
            onChange={handleCategoryFilter}
          >
            <option value="all">All Categories</option>
            {HDFC_CONFIG.CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            className="form-input filter-select"
            value={`${filters.sort_by}_${filters.sort_order}`}
            onChange={handleSortChange}
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="total_collections_desc">Highest Collections</option>
            <option value="total_collections_asc">Lowest Collections</option>
            <option value="transaction_count_desc">Most Transactions</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('generation')}
          >
            + New QR
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading.list && (
        <div className="empty-state">
          <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
          <p>Loading QR codes...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading.list && qrList.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📱</div>
          <h3 className="empty-state-title">No QR Codes Found</h3>
          <p className="empty-state-description">
            {filters.search || filters.status !== 'all' || filters.category !== 'all'
              ? 'No QR codes match your filters. Try adjusting your search.'
              : 'Get started by creating your first static QR code.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('generation')}
            style={{ marginTop: '1rem' }}
          >
            Create QR Code
          </button>
        </div>
      )}

      {/* QR Grid View */}
      {!loading.list && qrList.length > 0 && viewMode === 'grid' && (
        <div className="qr-grid">
          {qrList.map(renderQRCard)}
        </div>
      )}

      {/* QR List View */}
      {!loading.list && qrList.length > 0 && viewMode === 'list' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>QR Code</th>
                <th>Status</th>
                <th>Collections</th>
                <th>Transactions</th>
                <th>Amount</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qrList.map(renderTableRow)}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading.list && qrList.length > 0 && pagination.totalPages > 1 && (
        renderPagination()
      )}

      {/* QR View Modal */}
      {showQRModal && selectedQR && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedQR.reference_name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <QRCodeWithBrand
                qrData={selectedQR}
                size={250}
                showDownload={true}
                showDetails={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedQR && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete QR Code</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>{selectedQR.reference_name}</strong>?
              </p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={loading.delete}
              >
                {loading.delete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRManagementRedesigned
