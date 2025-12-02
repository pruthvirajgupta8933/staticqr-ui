import axios from 'axios'
import HDFC_CONFIG, { generateUPIString, generateVPA, generateTransactionRef } from '../../config/hdfc.config'

class SabQRService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://cob-static-qr-stage.sabpaisa.in/api',
      timeout: HDFC_CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // QR Operations
  async createQR(data) {
    const response = await this.api.post('/qr/create', data)
    return response.data
  }

  async getQRList(params = {}) {
    const response = await this.api.get('/qr/list', { params })
    return response.data
  }

  async getQRDetails(qrId) {
    const response = await this.api.get(`/qr/details/${qrId}`)
    return response.data
  }

  async updateQR(qrId, data) {
    const response = await this.api.put(`/qr/update/${qrId}`, data)
    return response.data
  }

  async deleteQR(qrId) {
    const response = await this.api.delete(`/qr/delete/${qrId}`)
    return response.data
  }

  async validateQRIdentifier(identifier) {
    const response = await this.api.post('/qr/validate', { identifier })
    return response.data
  }

  // Dashboard
  async getDashboardSummary() {
    const response = await this.api.get('/qr/dashboard/summary')
    return response.data
  }

  // Transactions
  async getAllTransactions(params = {}) {
    const response = await this.api.get('/qr/transactions', { params })
    return response.data
  }

  async getPayments(params = {}) {
    const response = await this.api.get('/qr/payments', { params })
    return response.data
  }

  async getPaymentsSummary(params = {}) {
    const response = await this.api.get('/qr/payments/summary', { params })
    return response.data
  }

  async processRefund(transactionId, amount, reason) {
    const response = await this.api.post(`/qr/transactions/${transactionId}/refund`, {
      amount,
      reason
    })
    return response.data
  }

  // Bulk Operations
  async createBulkQR(data) {
    const response = await this.api.post('/bulk-qr/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async getBatches(params = {}) {
    const response = await this.api.get('/bulk-qr/batches', { params })
    return response.data
  }

  async getBatchDetails(batchId) {
    const response = await this.api.get(`/bulk-qr/batches/${batchId}`)
    return response.data
  }

  // Utility methods
  generateUPIString(params) {
    return generateUPIString(params)
  }

  generateVPA(identifier) {
    return generateVPA(identifier)
  }

  generateTransactionRef(identifier) {
    return generateTransactionRef(identifier)
  }

  // Validate identifier format (client-side)
  validateIdentifierFormat(identifier) {
    const { IDENTIFIER } = HDFC_CONFIG.VALIDATION

    if (!identifier) {
      return { valid: false, message: 'Identifier is required' }
    }

    if (identifier.length < IDENTIFIER.MIN_LENGTH) {
      return { valid: false, message: `Identifier must be at least ${IDENTIFIER.MIN_LENGTH} characters` }
    }

    if (identifier.length > IDENTIFIER.MAX_LENGTH) {
      return { valid: false, message: `Identifier must not exceed ${IDENTIFIER.MAX_LENGTH} characters` }
    }

    if (!IDENTIFIER.PATTERN.test(identifier)) {
      return { valid: false, message: 'Identifier must contain only lowercase letters and numbers' }
    }

    // Check for both letters and numbers
    const hasLetters = /[a-z]/.test(identifier)
    const hasNumbers = /[0-9]/.test(identifier)
    if (!hasLetters || !hasNumbers) {
      return { valid: false, message: 'Identifier must contain both letters and numbers' }
    }

    return { valid: true, message: 'Valid identifier format' }
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Format date
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Format time
  formatTime(timeString) {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }
}

const sabqrService = new SabQRService()
export default sabqrService
