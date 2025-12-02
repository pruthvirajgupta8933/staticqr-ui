const HDFC_CONFIG = {
  MERCHANT_ID: import.meta.env.VITE_HDFC_MERCHANT_ID || 'HDFC000010380443',
  MERCHANT_NAME: import.meta.env.VITE_HDFC_MERCHANT_NAME || 'SabPaisa',
  API_BASE_URL: import.meta.env.VITE_HDFC_API_URL || 'https://api.hdfcbank.com',
  VPA_SUFFIX: '@hdfcbank',
  VPA_PREFIX: 'sabpaisa',
  QR_SIZE: 400,
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
  DEFAULT_CURRENCY: 'INR',
  MCC: import.meta.env.VITE_QR_MCC || '6012',
  API_TIMEOUT: 30000,

  STATUS: {
    SUCCESS: 'SUCCESS',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED'
  },

  TRANSACTION_STATUS: {
    SUCCESS: 'success',
    PENDING: 'pending',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  QR_STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived'
  },

  CATEGORIES: [
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'service', label: 'Service' },
    { value: 'donation', label: 'Donation' },
    { value: 'billing', label: 'Billing' },
    { value: 'other', label: 'Other' }
  ],

  VALIDATION: {
    IDENTIFIER: {
      MIN_LENGTH: 4,
      MAX_LENGTH: 15,
      PATTERN: /^[a-z0-9]+$/,
      DEBOUNCE_MS: 800
    },
    REFERENCE_NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100
    },
    AMOUNT: {
      MIN: 0.01,
      MAX: 1000000
    },
    DESCRIPTION: {
      MAX_LENGTH: 500
    },
    REFUND_REASON: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 500
    }
  }
}

export default HDFC_CONFIG

// Helper function to generate VPA
export const generateVPA = (identifier) => {
  return `${HDFC_CONFIG.VPA_PREFIX}.${identifier}${HDFC_CONFIG.VPA_SUFFIX}`
}

// Helper function to generate transaction reference
export const generateTransactionRef = (identifier) => {
  return `STQ${identifier}`
}

// Helper function to generate UPI string
export const generateUPIString = ({ identifier, amount, amountType }) => {
  const vpa = generateVPA(identifier)
  const ref = generateTransactionRef(identifier)
  let upiString = `upi://pay?pa=${vpa}&pn=&tr=${ref}`

  if (amountType === 'fixed' && amount > 0) {
    upiString += `&am=${amount}`
  } else {
    upiString += '&am='
  }

  upiString += `&cu=${HDFC_CONFIG.DEFAULT_CURRENCY}&mc=${HDFC_CONFIG.MCC}&mode=01&qrMedium=06`

  return upiString
}
