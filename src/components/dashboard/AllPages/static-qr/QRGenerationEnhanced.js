import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import debounce from 'lodash/debounce'
import {
  createQR,
  validateQRIdentifier,
  clearIdentifierValidation,
  selectIdentifierValidation,
  selectLoading,
  selectError,
  clearError
} from '../../../../slices/sabqr/sabqrSlice'
import sabqrService from '../../../../services/sabqr/sabqr.service'
import HDFC_CONFIG from '../../../../config/hdfc.config'
import LiveQRPreview from './components/LiveQRPreview'

const QRGenerationEnhanced = ({ onSuccess }) => {
  const dispatch = useDispatch()
  const identifierValidation = useSelector(selectIdentifierValidation)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  // Form state
  const [identifier, setIdentifier] = useState('')
  const [referenceName, setReferenceName] = useState('')
  const [paymentType, setPaymentType] = useState('dynamic')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  // Local validation state
  const [localValidation, setLocalValidation] = useState({
    identifier: { valid: true, message: '' },
    referenceName: { valid: true, message: '' },
    amount: { valid: true, message: '' }
  })

  // Debounced identifier validation
  const debouncedValidate = useCallback(
    debounce((value) => {
      if (value.length >= HDFC_CONFIG.VALIDATION.IDENTIFIER.MIN_LENGTH) {
        dispatch(validateQRIdentifier(value))
      }
    }, HDFC_CONFIG.VALIDATION.IDENTIFIER.DEBOUNCE_MS),
    [dispatch]
  )

  // Validate identifier on change
  useEffect(() => {
    if (identifier) {
      const validation = sabqrService.validateIdentifierFormat(identifier)
      setLocalValidation(prev => ({ ...prev, identifier: validation }))

      if (validation.valid) {
        debouncedValidate(identifier)
      } else {
        dispatch(clearIdentifierValidation())
      }
    } else {
      setLocalValidation(prev => ({
        ...prev,
        identifier: { valid: true, message: '' }
      }))
      dispatch(clearIdentifierValidation())
    }

    return () => {
      debouncedValidate.cancel()
    }
  }, [identifier, debouncedValidate, dispatch])

  // Validate reference name
  const validateReferenceName = (value) => {
    const { REFERENCE_NAME } = HDFC_CONFIG.VALIDATION
    if (!value) {
      return { valid: false, message: 'Reference name is required' }
    }
    if (value.length < REFERENCE_NAME.MIN_LENGTH) {
      return { valid: false, message: `Minimum ${REFERENCE_NAME.MIN_LENGTH} characters` }
    }
    if (value.length > REFERENCE_NAME.MAX_LENGTH) {
      return { valid: false, message: `Maximum ${REFERENCE_NAME.MAX_LENGTH} characters` }
    }
    return { valid: true, message: '' }
  }

  // Validate amount
  const validateAmount = (value) => {
    if (paymentType === 'dynamic') {
      return { valid: true, message: '' }
    }

    const { AMOUNT } = HDFC_CONFIG.VALIDATION
    if (!value) {
      return { valid: false, message: 'Amount is required for fixed payment' }
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return { valid: false, message: 'Invalid amount' }
    }
    if (numValue < AMOUNT.MIN) {
      return { valid: false, message: `Minimum amount is ${sabqrService.formatCurrency(AMOUNT.MIN)}` }
    }
    if (numValue > AMOUNT.MAX) {
      return { valid: false, message: `Maximum amount is ${sabqrService.formatCurrency(AMOUNT.MAX)}` }
    }
    return { valid: true, message: '' }
  }

  // Handle reference name change
  const handleReferenceNameChange = (e) => {
    const value = e.target.value
    setReferenceName(value)
    setLocalValidation(prev => ({
      ...prev,
      referenceName: validateReferenceName(value)
    }))
  }

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    setAmount(value)
    setLocalValidation(prev => ({
      ...prev,
      amount: validateAmount(value)
    }))
  }

  // Check if form is valid
  const isFormValid = () => {
    const identifierOk = localValidation.identifier.valid && identifierValidation.available === true
    const referenceOk = localValidation.referenceName.valid && referenceName.length >= 3
    const amountOk = paymentType === 'dynamic' || (localValidation.amount.valid && amount)

    return identifierOk && referenceOk && amountOk && !loading.create
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const refValidation = validateReferenceName(referenceName)
    const amtValidation = validateAmount(amount)

    setLocalValidation(prev => ({
      ...prev,
      referenceName: refValidation,
      amount: amtValidation
    }))

    if (!isFormValid()) {
      toast.error('Please fix the form errors')
      return
    }

    try {
      const payload = {
        qr_identifier: identifier,
        reference_name: referenceName,
        category: category || undefined,
        description: description || undefined,
        max_amount_per_transaction: paymentType === 'fixed' ? parseFloat(amount) : null,
        min_amount_per_transaction: null
      }

      await dispatch(createQR(payload)).unwrap()
      toast.success('QR Code created successfully!')

      // Reset form
      setIdentifier('')
      setReferenceName('')
      setPaymentType('dynamic')
      setAmount('')
      setCategory('')
      setDescription('')
      dispatch(clearIdentifierValidation())

      // Navigate to management
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create QR Code')
    }
  }

  // Handle form reset
  const handleReset = () => {
    setIdentifier('')
    setReferenceName('')
    setPaymentType('dynamic')
    setAmount('')
    setCategory('')
    setDescription('')
    setLocalValidation({
      identifier: { valid: true, message: '' },
      referenceName: { valid: true, message: '' },
      amount: { valid: true, message: '' }
    })
    dispatch(clearIdentifierValidation())
    dispatch(clearError('create'))
  }

  // Render validation status
  const renderValidationStatus = () => {
    if (!identifier || identifier.length < 4) return null

    if (!localValidation.identifier.valid) {
      return (
        <div className="validation-status unavailable">
          <span>✗</span>
          <span>{localValidation.identifier.message}</span>
        </div>
      )
    }

    if (loading.validation) {
      return (
        <div className="validation-status checking">
          <span className="spinner" style={{ width: '12px', height: '12px' }}></span>
          <span>Checking availability...</span>
        </div>
      )
    }

    if (identifierValidation.available === true) {
      return (
        <div className="validation-status available">
          <span>✓</span>
          <span>Identifier is available</span>
        </div>
      )
    }

    if (identifierValidation.available === false) {
      return (
        <div className="validation-status unavailable">
          <span>✗</span>
          <span>{identifierValidation.message || 'Identifier is already taken'}</span>
          {identifierValidation.alternatives?.length > 0 && (
            <div className="alternatives">
              <span>Try: </span>
              {identifierValidation.alternatives.map((alt, i) => (
                <button
                  key={alt}
                  type="button"
                  className="alternative-btn"
                  onClick={() => setIdentifier(alt)}
                >
                  {alt}
                  {i < identifierValidation.alternatives.length - 1 && ', '}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="qr-generation-container">
      <form className="qr-form-section" onSubmit={handleSubmit}>
        {/* Identifier Section */}
        <div className="form-section">
          <h3 className="form-section-title">
            <span>🔗</span>
            QR Identifier
          </h3>

          <div className="form-group">
            <label className="form-label">
              Unique Identifier <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <div className="identifier-input-wrapper">
              <span className="identifier-prefix">sabpaisa.</span>
              <input
                type="text"
                className={`form-input identifier-input ${
                  !localValidation.identifier.valid || identifierValidation.available === false
                    ? 'error'
                    : identifierValidation.available === true
                    ? 'success'
                    : ''
                }`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="shop123abc"
                maxLength={HDFC_CONFIG.VALIDATION.IDENTIFIER.MAX_LENGTH}
              />
              <span className="identifier-suffix">@hdfcbank</span>
            </div>
            {renderValidationStatus()}
            <p className="form-helper">
              4-15 characters, lowercase letters and numbers only. Must contain both letters AND numbers.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Reference Name <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${!localValidation.referenceName.valid ? 'error' : ''}`}
              value={referenceName}
              onChange={handleReferenceNameChange}
              placeholder="e.g., Main Counter QR, Shop Front QR"
              maxLength={HDFC_CONFIG.VALIDATION.REFERENCE_NAME.MAX_LENGTH}
            />
            {!localValidation.referenceName.valid && (
              <p className="form-error">{localValidation.referenceName.message}</p>
            )}
            <p className="form-helper">
              A friendly name to identify this QR code (3-100 characters)
            </p>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="form-section">
          <h3 className="form-section-title">
            <span>💰</span>
            Payment Configuration
          </h3>

          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <div className="payment-type-options">
              <label
                className={`payment-type-option ${paymentType === 'dynamic' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="dynamic"
                  checked={paymentType === 'dynamic'}
                  onChange={(e) => {
                    setPaymentType(e.target.value)
                    setAmount('')
                    setLocalValidation(prev => ({ ...prev, amount: { valid: true, message: '' } }))
                  }}
                  className="payment-type-radio"
                />
                <div className="payment-type-content">
                  <h4>Dynamic Amount</h4>
                  <p>Customer enters any amount at payment time</p>
                </div>
              </label>
              <label
                className={`payment-type-option ${paymentType === 'fixed' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="fixed"
                  checked={paymentType === 'fixed'}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="payment-type-radio"
                />
                <div className="payment-type-content">
                  <h4>Fixed Amount</h4>
                  <p>Pre-set amount that cannot be changed</p>
                </div>
              </label>
            </div>
          </div>

          {paymentType === 'fixed' && (
            <div className="form-group">
              <label className="form-label">
                Fixed Amount (₹) <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input
                type="text"
                className={`form-input ${!localValidation.amount.valid ? 'error' : ''}`}
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
              />
              {!localValidation.amount.valid && (
                <p className="form-error">{localValidation.amount.message}</p>
              )}
              <p className="form-helper">
                Amount between ₹{HDFC_CONFIG.VALIDATION.AMOUNT.MIN} and ₹{HDFC_CONFIG.VALIDATION.AMOUNT.MAX.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="form-section">
          <h3 className="form-section-title">
            <span>📝</span>
            Additional Details (Optional)
          </h3>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {HDFC_CONFIG.CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this QR code"
              rows={3}
              maxLength={HDFC_CONFIG.VALIDATION.DESCRIPTION.MAX_LENGTH}
            />
            <p className="form-helper">
              {description.length}/{HDFC_CONFIG.VALIDATION.DESCRIPTION.MAX_LENGTH} characters
            </p>
          </div>
        </div>

        {/* Error display */}
        {error.create && (
          <div className="form-error" style={{ padding: '1rem', background: 'var(--danger-light)', borderRadius: 'var(--border-radius)' }}>
            {error.create}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isFormValid()}
          >
            {loading.create ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              'Create QR Code'
            )}
          </button>
        </div>
      </form>

      {/* Live QR Preview */}
      <div className="qr-preview-section">
        <LiveQRPreview
          identifier={identifier}
          referenceName={referenceName}
          amount={amount}
          amountType={paymentType}
          isValid={localValidation.identifier.valid && identifierValidation.available !== false}
        />
      </div>
    </div>
  )
}

export default QRGenerationEnhanced
