import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { generateUPIString, generateVPA } from '../../../../../config/hdfc.config'
import sabqrService from '../../../../../services/sabqr/sabqr.service'

const QRCodeWithBrand = ({
  qrData,
  size = 200,
  showDownload = true,
  showDetails = true,
  template = 'default'
}) => {
  const canvasRef = useRef(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const {
    qr_identifier,
    reference_name,
    full_vpa,
    upi_string,
    max_amount_per_transaction,
    status
  } = qrData || {}

  useEffect(() => {
    const generateQR = async () => {
      if (!qrData) return

      const upiString = upi_string || generateUPIString({
        identifier: qr_identifier,
        amount: max_amount_per_transaction || 0,
        amountType: max_amount_per_transaction ? 'fixed' : 'dynamic'
      })

      try {
        const dataUrl = await QRCode.toDataURL(upiString, {
          width: size,
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
      }
    }

    generateQR()
  }, [qrData, size, qr_identifier, upi_string, max_amount_per_transaction])

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `qr-${qr_identifier || 'code'}.png`
    link.href = qrDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyVPA = () => {
    const vpa = full_vpa || generateVPA(qr_identifier)
    navigator.clipboard.writeText(vpa).catch(console.error)
  }

  const vpa = full_vpa || (qr_identifier ? generateVPA(qr_identifier) : '')

  const getTemplateStyles = () => {
    switch (template) {
      case 'minimal':
        return {
          container: { padding: '1rem' },
          qrWrapper: { padding: '0.5rem' }
        }
      case 'branded':
        return {
          container: {
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px'
          },
          qrWrapper: {
            padding: '1rem',
            background: 'white',
            borderRadius: '12px'
          }
        }
      default:
        return {
          container: {},
          qrWrapper: {}
        }
    }
  }

  const styles = getTemplateStyles()

  if (!qrData) {
    return (
      <div className="qr-code-placeholder" style={{ width: size, height: size }}>
        No QR data
      </div>
    )
  }

  return (
    <div className="qr-with-brand" style={styles.container}>
      <div className="qr-wrapper" style={styles.qrWrapper}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code for ${reference_name}`}
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className="qr-code-placeholder"
            style={{ width: size, height: size }}
          >
            <span className="spinner"></span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="qr-brand-details">
          <div className="qr-brand-name">{reference_name}</div>
          <div
            className="qr-brand-vpa"
            onClick={handleCopyVPA}
            title="Click to copy"
          >
            {vpa}
          </div>
          {max_amount_per_transaction && (
            <div className="qr-brand-amount">
              {sabqrService.formatCurrency(max_amount_per_transaction)}
            </div>
          )}
          {status && (
            <span className={`badge badge-${status === 'active' ? 'success' : 'secondary'}`}>
              {status}
            </span>
          )}
        </div>
      )}

      {showDownload && (
        <div className="qr-brand-actions">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleDownload}
          >
            Download
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleCopyVPA}
          >
            Copy VPA
          </button>
        </div>
      )}

      <style>{`
        .qr-with-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .qr-wrapper {
          background: white;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-sm);
        }

        .qr-brand-details {
          text-align: center;
        }

        .qr-brand-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .qr-brand-vpa {
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          background: var(--bg-tertiary);
          border-radius: var(--border-radius);
          transition: var(--transition);
        }

        .qr-brand-vpa:hover {
          background: var(--border-color);
        }

        .qr-brand-amount {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary-color);
          margin-top: 0.5rem;
        }

        .qr-brand-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default QRCodeWithBrand
