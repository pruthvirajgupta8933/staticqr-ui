import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import sabqrService from '../../services/sabqr/sabqr.service'

// Initial state
const initialState = {
  // QR Data
  qrList: [],
  currentQR: null,
  qrSummary: {
    total_active: 0,
    total_inactive: 0,
    total_collections: 0,
    total_transactions: 0
  },

  // Transactions
  transactions: [],
  payments: [],
  paymentsSummary: {
    total_amount: 0,
    total_transactions: 0,
    success_rate: 0
  },

  // Dashboard
  dashboard: {
    summary: {
      total_qr_codes: 0,
      active_qr_codes: 0,
      inactive_qr_codes: 0,
      total_collections: 0,
      today_collections: 0,
      total_transactions: 0,
      today_transactions: 0,
      average_transaction_value: 0,
      success_rate: 0
    },
    collection_trend: [],
    top_performing_qrs: [],
    recent_payments: []
  },

  // Pagination
  pagination: {
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0
  },

  // Batch Management
  batches: [],
  currentBatch: null,

  // Filters
  filters: {
    status: 'all',
    search: '',
    category: 'all',
    from_date: null,
    to_date: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  },

  // Identifier Validation
  identifierValidation: {
    identifier: '',
    available: null, // null=unknown, true=available, false=taken
    alternatives: [],
    message: ''
  },

  // Loading flags per operation
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    details: false,
    payments: false,
    dashboard: false,
    validation: false,
    refund: false,
    batches: false
  },

  // Error states
  error: {
    list: null,
    create: null,
    update: null,
    delete: null,
    details: null,
    payments: null,
    dashboard: null,
    validation: null,
    refund: null,
    batches: null
  }
}

// Async Thunks

// Create QR
export const createQR = createAsyncThunk(
  'sabqr/createQR',
  async (data, { rejectWithValue }) => {
    try {
      const response = await sabqrService.createQR(data)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create QR' })
    }
  }
)

// Fetch QR List
export const fetchQRList = createAsyncThunk(
  'sabqr/fetchQRList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getQRList(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch QR list' })
    }
  }
)

// Fetch QR Details
export const fetchQRDetails = createAsyncThunk(
  'sabqr/fetchQRDetails',
  async (qrId, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getQRDetails(qrId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch QR details' })
    }
  }
)

// Update QR
export const updateQR = createAsyncThunk(
  'sabqr/updateQR',
  async ({ qrId, data }, { rejectWithValue }) => {
    try {
      const response = await sabqrService.updateQR(qrId, data)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update QR' })
    }
  }
)

// Delete QR
export const deleteQR = createAsyncThunk(
  'sabqr/deleteQR',
  async (qrId, { rejectWithValue }) => {
    try {
      await sabqrService.deleteQR(qrId)
      return qrId
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete QR' })
    }
  }
)

// Validate QR Identifier
export const validateQRIdentifier = createAsyncThunk(
  'sabqr/validateQRIdentifier',
  async (identifier, { rejectWithValue }) => {
    try {
      const response = await sabqrService.validateQRIdentifier(identifier)
      return { identifier, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to validate identifier' })
    }
  }
)

// Fetch All Transactions
export const fetchAllTransactions = createAsyncThunk(
  'sabqr/fetchAllTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getAllTransactions(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch transactions' })
    }
  }
)

// Fetch Payments
export const fetchPayments = createAsyncThunk(
  'sabqr/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getPayments(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch payments' })
    }
  }
)

// Fetch Payments Summary
export const fetchPaymentsSummary = createAsyncThunk(
  'sabqr/fetchPaymentsSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getPaymentsSummary(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch payments summary' })
    }
  }
)

// Process Refund
export const processQRRefund = createAsyncThunk(
  'sabqr/processQRRefund',
  async ({ transactionId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await sabqrService.processRefund(transactionId, amount, reason)
      return { transactionId, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to process refund' })
    }
  }
)

// Fetch Dashboard Summary
export const fetchDashboardSummary = createAsyncThunk(
  'sabqr/fetchDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getDashboardSummary()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard summary' })
    }
  }
)

// Fetch Batch List
export const fetchBatchList = createAsyncThunk(
  'sabqr/fetchBatchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getBatches(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch batches' })
    }
  }
)

// Fetch Batch Details
export const fetchBatchDetails = createAsyncThunk(
  'sabqr/fetchBatchDetails',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await sabqrService.getBatchDetails(batchId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch batch details' })
    }
  }
)

// Create Bulk QR
export const createBulkQR = createAsyncThunk(
  'sabqr/createBulkQR',
  async (data, { rejectWithValue }) => {
    try {
      const response = await sabqrService.createBulkQR(data)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create bulk QR' })
    }
  }
)

// Slice
const sabqrSlice = createSlice({
  name: 'sabqr',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      // Reset pagination when filters change
      state.pagination.page = 1
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },

    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },

    // Set current QR
    setCurrentQR: (state, action) => {
      state.currentQR = action.payload
    },

    // Clear current QR
    clearCurrentQR: (state) => {
      state.currentQR = null
    },

    // Set identifier validation
    setIdentifierValidation: (state, action) => {
      state.identifierValidation = { ...state.identifierValidation, ...action.payload }
    },

    // Clear identifier validation
    clearIdentifierValidation: (state) => {
      state.identifierValidation = initialState.identifierValidation
    },

    // Add payment in realtime (from webhook)
    addPaymentRealtime: (state, action) => {
      const payment = action.payload
      // Add to recent payments at the beginning
      state.dashboard.recent_payments = [payment, ...state.dashboard.recent_payments.slice(0, 9)]
      // Update summary
      state.dashboard.summary.today_transactions += 1
      state.dashboard.summary.today_collections += payment.amount || 0
      state.dashboard.summary.total_transactions += 1
      state.dashboard.summary.total_collections += payment.amount || 0
    },

    // Add transaction (from webhook)
    addTransaction: (state, action) => {
      const transaction = action.payload
      // Deduplicate by transactionId
      const exists = state.transactions.find(t => t.transactionId === transaction.transactionId)
      if (!exists) {
        state.transactions = [transaction, ...state.transactions]
      }
      // Also update payments
      const paymentExists = state.payments.find(p => p.transactionId === transaction.transactionId)
      if (!paymentExists) {
        state.payments = [transaction, ...state.payments]
      }
    },

    // Update QR status in realtime
    updateQRStatusRealtime: (state, action) => {
      const { qrId, status } = action.payload
      const qrIndex = state.qrList.findIndex(qr => qr.id === qrId || qr.qr_identifier === qrId)
      if (qrIndex !== -1) {
        state.qrList[qrIndex].status = status
      }
      if (state.currentQR && (state.currentQR.id === qrId || state.currentQR.qr_identifier === qrId)) {
        state.currentQR.status = status
      }
    },

    // Update transaction status (for refunds)
    updateTransactionStatus: (state, action) => {
      const { transactionId, status } = action.payload
      const txIndex = state.transactions.findIndex(t => t.transactionId === transactionId)
      if (txIndex !== -1) {
        state.transactions[txIndex].status = status
      }
      const paymentIndex = state.payments.findIndex(p => p.transactionId === transactionId)
      if (paymentIndex !== -1) {
        state.payments[paymentIndex].status = status
      }
    },

    // Clear errors
    clearError: (state, action) => {
      const key = action.payload
      if (key && state.error[key]) {
        state.error[key] = null
      } else {
        state.error = initialState.error
      }
    },

    // Reset state
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Create QR
      .addCase(createQR.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createQR.fulfilled, (state, action) => {
        state.loading.create = false
        if (action.payload.qr) {
          state.qrList = [action.payload.qr, ...state.qrList]
          state.currentQR = action.payload.qr
        }
      })
      .addCase(createQR.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.payload?.message || 'Failed to create QR'
      })

      // Fetch QR List
      .addCase(fetchQRList.pending, (state) => {
        state.loading.list = true
        state.error.list = null
      })
      .addCase(fetchQRList.fulfilled, (state, action) => {
        state.loading.list = false
        // Deduplicate by qr_identifier
        const uniqueQRs = action.payload.data?.reduce((acc, qr) => {
          if (!acc.find(q => q.qr_identifier === qr.qr_identifier)) {
            acc.push(qr)
          }
          return acc
        }, []) || []
        state.qrList = uniqueQRs
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination
          }
        }
        if (action.payload.summary) {
          state.qrSummary = action.payload.summary
        }
      })
      .addCase(fetchQRList.rejected, (state, action) => {
        state.loading.list = false
        state.error.list = action.payload?.message || 'Failed to fetch QR list'
      })

      // Fetch QR Details
      .addCase(fetchQRDetails.pending, (state) => {
        state.loading.details = true
        state.error.details = null
      })
      .addCase(fetchQRDetails.fulfilled, (state, action) => {
        state.loading.details = false
        state.currentQR = action.payload.qr || action.payload
      })
      .addCase(fetchQRDetails.rejected, (state, action) => {
        state.loading.details = false
        state.error.details = action.payload?.message || 'Failed to fetch QR details'
      })

      // Update QR
      .addCase(updateQR.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateQR.fulfilled, (state, action) => {
        state.loading.update = false
        const updatedQR = action.payload.qr || action.payload
        const index = state.qrList.findIndex(qr => qr.id === updatedQR.id)
        if (index !== -1) {
          state.qrList[index] = updatedQR
        }
        if (state.currentQR?.id === updatedQR.id) {
          state.currentQR = updatedQR
        }
      })
      .addCase(updateQR.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.payload?.message || 'Failed to update QR'
      })

      // Delete QR
      .addCase(deleteQR.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteQR.fulfilled, (state, action) => {
        state.loading.delete = false
        state.qrList = state.qrList.filter(qr => qr.id !== action.payload)
        if (state.currentQR?.id === action.payload) {
          state.currentQR = null
        }
      })
      .addCase(deleteQR.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.payload?.message || 'Failed to delete QR'
      })

      // Validate Identifier
      .addCase(validateQRIdentifier.pending, (state) => {
        state.loading.validation = true
        state.error.validation = null
      })
      .addCase(validateQRIdentifier.fulfilled, (state, action) => {
        state.loading.validation = false
        state.identifierValidation = {
          identifier: action.payload.identifier,
          available: action.payload.available,
          alternatives: action.payload.alternatives || [],
          message: action.payload.message || (action.payload.available ? 'Identifier is available' : 'Identifier is already taken')
        }
      })
      .addCase(validateQRIdentifier.rejected, (state, action) => {
        state.loading.validation = false
        state.error.validation = action.payload?.message || 'Failed to validate identifier'
        state.identifierValidation.available = null
      })

      // Fetch Transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading.payments = true
        state.error.payments = null
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading.payments = false
        state.transactions = action.payload.data || []
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination }
        }
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading.payments = false
        state.error.payments = action.payload?.message || 'Failed to fetch transactions'
      })

      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading.payments = true
        state.error.payments = null
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading.payments = false
        state.payments = action.payload.data || []
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination }
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading.payments = false
        state.error.payments = action.payload?.message || 'Failed to fetch payments'
      })

      // Fetch Payments Summary
      .addCase(fetchPaymentsSummary.fulfilled, (state, action) => {
        state.paymentsSummary = action.payload
      })

      // Process Refund
      .addCase(processQRRefund.pending, (state) => {
        state.loading.refund = true
        state.error.refund = null
      })
      .addCase(processQRRefund.fulfilled, (state, action) => {
        state.loading.refund = false
        // Update transaction status to refunded
        const { transactionId } = action.payload
        const txIndex = state.transactions.findIndex(t => t.transactionId === transactionId)
        if (txIndex !== -1) {
          state.transactions[txIndex].status = 'refunded'
        }
        const paymentIndex = state.payments.findIndex(p => p.transactionId === transactionId)
        if (paymentIndex !== -1) {
          state.payments[paymentIndex].status = 'refunded'
        }
      })
      .addCase(processQRRefund.rejected, (state, action) => {
        state.loading.refund = false
        state.error.refund = action.payload?.message || 'Failed to process refund'
      })

      // Fetch Dashboard Summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading.dashboard = true
        state.error.dashboard = null
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading.dashboard = false
        state.dashboard = {
          summary: action.payload.summary || initialState.dashboard.summary,
          collection_trend: action.payload.collection_trend || [],
          top_performing_qrs: action.payload.top_performing_qrs || [],
          recent_payments: action.payload.recent_payments || []
        }
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading.dashboard = false
        state.error.dashboard = action.payload?.message || 'Failed to fetch dashboard summary'
      })

      // Fetch Batch List
      .addCase(fetchBatchList.pending, (state) => {
        state.loading.batches = true
        state.error.batches = null
      })
      .addCase(fetchBatchList.fulfilled, (state, action) => {
        state.loading.batches = false
        state.batches = action.payload.data || []
      })
      .addCase(fetchBatchList.rejected, (state, action) => {
        state.loading.batches = false
        state.error.batches = action.payload?.message || 'Failed to fetch batches'
      })

      // Fetch Batch Details
      .addCase(fetchBatchDetails.fulfilled, (state, action) => {
        state.currentBatch = action.payload
      })

      // Create Bulk QR
      .addCase(createBulkQR.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createBulkQR.fulfilled, (state, action) => {
        state.loading.create = false
        if (action.payload.batch) {
          state.batches = [action.payload.batch, ...state.batches]
        }
      })
      .addCase(createBulkQR.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.payload?.message || 'Failed to create bulk QR'
      })
  }
})

// Export actions
export const {
  setFilters,
  clearFilters,
  setPagination,
  setCurrentQR,
  clearCurrentQR,
  setIdentifierValidation,
  clearIdentifierValidation,
  addPaymentRealtime,
  addTransaction,
  updateQRStatusRealtime,
  updateTransactionStatus,
  clearError,
  resetState
} = sabqrSlice.actions

// Selectors
export const selectQRList = (state) => state.sabqr.qrList
export const selectCurrentQR = (state) => state.sabqr.currentQR
export const selectQRSummary = (state) => state.sabqr.qrSummary
export const selectTransactions = (state) => state.sabqr.transactions
export const selectPayments = (state) => state.sabqr.payments
export const selectPaymentsSummary = (state) => state.sabqr.paymentsSummary
export const selectDashboard = (state) => state.sabqr.dashboard
export const selectPagination = (state) => state.sabqr.pagination
export const selectFilters = (state) => state.sabqr.filters
export const selectIdentifierValidation = (state) => state.sabqr.identifierValidation
export const selectLoading = (state) => state.sabqr.loading
export const selectError = (state) => state.sabqr.error
export const selectBatches = (state) => state.sabqr.batches
export const selectCurrentBatch = (state) => state.sabqr.currentBatch

export default sabqrSlice.reducer
