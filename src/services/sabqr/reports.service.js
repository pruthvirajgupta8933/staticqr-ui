import axios from 'axios'
import HDFC_CONFIG from '../../config/hdfc.config'

class ReportsService {
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
  }

  // Get transaction report
  async getTransactionReport(params = {}) {
    const response = await this.api.get('/qr/reports/transactions', { params })
    return response.data
  }

  // Get settlement report
  async getSettlementReport(params = {}) {
    const response = await this.api.get('/qr/reports/settlements', { params })
    return response.data
  }

  // Get QR performance report
  async getQRPerformanceReport(params = {}) {
    const response = await this.api.get('/qr/reports/performance', { params })
    return response.data
  }

  // Get refund report
  async getRefundReport(params = {}) {
    const response = await this.api.get('/qr/reports/refunds', { params })
    return response.data
  }

  // Download report as CSV
  async downloadReportCSV(reportType, params = {}) {
    const response = await this.api.get(`/qr/reports/${reportType}/export`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    })
    return response.data
  }

  // Download report as Excel
  async downloadReportExcel(reportType, params = {}) {
    const response = await this.api.get(`/qr/reports/${reportType}/export`, {
      params: { ...params, format: 'xlsx' },
      responseType: 'blob'
    })
    return response.data
  }

  // Download report as PDF
  async downloadReportPDF(reportType, params = {}) {
    const response = await this.api.get(`/qr/reports/${reportType}/export`, {
      params: { ...params, format: 'pdf' },
      responseType: 'blob'
    })
    return response.data
  }

  // Utility function to trigger download
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Get analytics data
  async getAnalytics(params = {}) {
    const response = await this.api.get('/qr/analytics', { params })
    return response.data
  }

  // Get daily summary
  async getDailySummary(date) {
    const response = await this.api.get('/qr/reports/daily-summary', {
      params: { date }
    })
    return response.data
  }

  // Get monthly summary
  async getMonthlySummary(month, year) {
    const response = await this.api.get('/qr/reports/monthly-summary', {
      params: { month, year }
    })
    return response.data
  }
}

const reportsService = new ReportsService()
export default reportsService
