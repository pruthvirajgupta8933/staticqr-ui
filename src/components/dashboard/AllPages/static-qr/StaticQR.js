import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRDashboard from './components/QRDashboard'
import QRGenerationEnhanced from './QRGenerationEnhanced'
import QRManagementRedesigned from './QRManagementRedesigned'
import QRPayments from './QRPayments'
import QRReports from './QRReports'
import WebhookHandler from './components/WebhookHandler'
import TabHeader from './headers/TabHeader'
import './StaticQR.css'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'generation', label: 'Generate QR', icon: '➕' },
  { id: 'management', label: 'Manage QRs', icon: '📋' },
  { id: 'payments', label: 'Transactions', icon: '💰' },
  { id: 'reports', label: 'Reports', icon: '📈' }
]

const StaticQR = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && TABS.find(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <QRDashboard onNavigate={handleTabChange} />
      case 'generation':
        return <QRGenerationEnhanced onSuccess={() => handleTabChange('management')} />
      case 'management':
        return <QRManagementRedesigned onNavigate={handleTabChange} />
      case 'payments':
        return <QRPayments />
      case 'reports':
        return <QRReports />
      default:
        return <QRDashboard onNavigate={handleTabChange} />
    }
  }

  return (
    <div className="static-qr-container">
      <div className="static-qr-header">
        <h1 className="static-qr-title">Static QR Code Management</h1>
        <p className="static-qr-subtitle">
          Create, manage, and track static QR codes for seamless UPI payments
        </p>
      </div>

      <TabHeader
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <div className="static-qr-content">
        {renderActiveComponent()}
      </div>

      {/* Webhook handler for real-time payment updates */}
      <WebhookHandler />
    </div>
  )
}

export default StaticQR
