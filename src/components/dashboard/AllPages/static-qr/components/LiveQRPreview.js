import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { generateUPIString, generateVPA } from '../../../../../config/hdfc.config'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const LiveQRPreview = ({
  identifier,
  referenceName,
  amount,
  amountType,
  isValid = true
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [upiString, setUpiString] = useState('')

  useEffect(() => {
    const generateQR = async () => {
      if (identifier && identifier.length >= 4 && isValid) {
        const upi = generateUPIString({
          identifier,
          amount: amountType === 'fixed' ? parseFloat(amount) || 0 : 0,
          amountType
        })
        setUpiString(upi)

        try {
          const dataUrl = await QRCode.toDataURL(upi, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
          })
          setQrDataUrl(dataUrl)
        } catch (err) {
          console.error('QR generation error:', err)
          setQrDataUrl('')
        }
      } else {
        setQrDataUrl('')
        setUpiString('')
      }
    }

    generateQR()
  }, [identifier, amount, amountType, isValid])

  const vpa = identifier ? generateVPA(identifier) : ''

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `qr-${identifier || 'preview'}.png`
    link.href = qrDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyVPA = () => {
    if (vpa) {
      navigator.clipboard.writeText(vpa)
        .then(() => {
          // Could add toast here
        })
        .catch(console.error)
    }
  }

  return (
    <div className="qr-preview-card">
      <div className="qr-preview-header">
        <h3>Live Preview</h3>
      </div>

      <div className="qr-preview-body">
        <div className="qr-code-container">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code Preview"
              className="qr-code-image"
            />
          ) : (
            <div className="qr-code-placeholder">
              <span>
                {!identifier
                  ? 'Enter identifier to preview QR'
                  : identifier.length < 4
                  ? 'Identifier needs 4+ characters'
                  : !isValid
                  ? 'Fix validation errors'
                  : 'Generating QR...'}
              </span>
            </div>
          )}
        </div>

        {vpa && (
          <div
            className="vpa-display"
            onClick={handleCopyVPA}
            style={{ cursor: 'pointer' }}
            title="Click to copy"
          >
            {vpa}
          </div>
        )}

        <div className="qr-preview-info">
          <div className="qr-preview-info-row">
            <span className="qr-preview-info-label">Reference Name</span>
            <span className="qr-preview-info-value">
              {referenceName || '-'}
            </span>
          </div>
          <div className="qr-preview-info-row">
            <span className="qr-preview-info-label">Payment Type</span>
            <span className="qr-preview-info-value">
              {amountType === 'fixed' ? 'Fixed Amount' : 'Dynamic Amount'}
            </span>
          </div>
          {amountType === 'fixed' && amount && (
            <div className="qr-preview-info-row">
              <span className="qr-preview-info-label">Amount</span>
              <span className="qr-preview-info-value">
                {sabqrService.formatCurrency(parseFloat(amount))}
              </span>
            </div>
          )}
          <div className="qr-preview-info-row">
            <span className="qr-preview-info-label">Transaction Ref</span>
            <span className="qr-preview-info-value">
              {identifier ? `STQ${identifier}` : '-'}
            </span>
          </div>
        </div>

        {qrDataUrl && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownload}
            style={{ width: '100%' }}
          >
            Download Preview
          </button>
        )}
      </div>
    </div>
  )
}

export default LiveQRPreview
