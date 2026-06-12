import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          color: '#fff'
        }}>
          S
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          SAM Platform
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        {user?.role === 'admin' && (
          <>
            <div style={{ padding: '0 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '16px', marginBottom: '8px' }}>
              Management
            </div>
            <Link to="/dashboard" className="btn" style={{
              justifyContent: 'flex-start',
              background: isActive('/dashboard') ? 'var(--accent-primary-glow)' : 'transparent',
              color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              padding: '12px 16px'
            }}>
              Analytics Dashboard
            </Link>
            <Link to="/admin/assets" className="btn" style={{
              justifyContent: 'flex-start',
              background: isActive('/admin/assets') ? 'var(--accent-primary-glow)' : 'transparent',
              color: isActive('/admin/assets') ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: isActive('/admin/assets') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              padding: '12px 16px'
            }}>
              Inventory Manager
            </Link>
            <Link to="/admin/requests" className="btn" style={{
              justifyContent: 'flex-start',
              background: isActive('/admin/requests') ? 'var(--accent-primary-glow)' : 'transparent',
              color: isActive('/admin/requests') ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: isActive('/admin/requests') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              padding: '12px 16px'
            }}>
              Request Approvals
            </Link>
          </>
        )}

        <div style={{ padding: '0 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '24px', marginBottom: '8px' }}>
          Assets Discovery
        </div>
        
        <Link to="/assets" className="btn" style={{
          justifyContent: 'flex-start',
          background: isActive('/assets') ? 'var(--accent-primary-glow)' : 'transparent',
          color: isActive('/assets') ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderColor: isActive('/assets') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
          padding: '12px 16px'
        }}>
          Search & Browse
        </Link>
        <Link to="/my-bookings" className="btn" style={{
          justifyContent: 'flex-start',
          background: isActive('/my-bookings') ? 'var(--accent-primary-glow)' : 'transparent',
          color: isActive('/my-bookings') ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderColor: isActive('/my-bookings') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
          padding: '12px 16px'
        }}>
          My Bookings
        </Link>
      </nav>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        v1.0.0 &bull; Cultural Council
      </div>
    </aside>
  )
}

export default Sidebar
