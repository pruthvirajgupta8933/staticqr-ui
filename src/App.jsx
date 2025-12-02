import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import StaticQR from './components/dashboard/AllPages/static-qr/StaticQR'

// Simple layout component
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">SabPaisa</h1>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard/static-qr" className="sidebar-link active">
            <span className="sidebar-icon">📱</span>
            <span>Static QR</span>
          </a>
          <a href="#" className="sidebar-link">
            <span className="sidebar-icon">📊</span>
            <span>Analytics</span>
          </a>
          <a href="#" className="sidebar-link">
            <span className="sidebar-icon">⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 240px;
          background: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .sidebar-nav {
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
        }

        .sidebar-link:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
          text-decoration: none;
        }

        .sidebar-link.active {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .sidebar-icon {
          font-size: 1.125rem;
        }

        .main-content {
          flex: 1;
          background: var(--bg-secondary);
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

// Home page that redirects to static-qr
const Home = () => {
  return <Navigate to="/dashboard/static-qr" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard/static-qr/*"
        element={
          <DashboardLayout>
            <StaticQR />
          </DashboardLayout>
        }
      />
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
