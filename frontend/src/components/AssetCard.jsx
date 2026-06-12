import React from 'react'
import { useAuth } from '../context/AuthContext'

const AssetCard = ({ asset, onBook, onEdit, onDelete, onViewQR }) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="badge badge-success">Available</span>
      case 'Maintenance':
        return <span className="badge badge-warning">Maintenance</span>
      case 'Damaged':
        return <span className="badge badge-danger">Damaged</span>
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'Good':
        return <span style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>Good</span>
      case 'Fair':
        return <span style={{ color: 'var(--accent-warning)', fontWeight: 500 }}>Fair</span>
      case 'Poor':
        return <span style={{ color: 'var(--accent-danger)', fontWeight: 500 }}>Poor</span>
      default:
        return <span>{condition}</span>
    }
  }

  return (
    <div className="asset-card glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden', padding: 0 }}>
      {/* Asset Image Header */}
      <div style={{ width: '100%', height: '150px', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
        {asset.image_url ? (
          <img 
            src={asset.image_url} 
            alt={asset.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ 
          display: asset.image_url ? 'none' : 'flex', 
          width: '100%', 
          height: '100%', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          fontWeight: 500
        }}>
          No Asset Image Available
        </div>
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          <span className="badge badge-info" style={{ fontSize: '0.65rem', pointerEvents: 'auto' }}>{asset.category}</span>
          <span style={{ pointerEvents: 'auto' }}>{getStatusBadge(asset.status)}</span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{asset.name}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4', minHeight: '40px' }}>{asset.description}</p>

        <div className="asset-meta" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Quantity: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{asset.quantity}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Condition: </span>
            {getConditionBadge(asset.condition)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {isAdmin ? (
            <>
              <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => onEdit(asset)}>
                Edit
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => onViewQR(asset)}>
                QR
              </button>
              <button className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => onDelete(asset._id)}>
                Delete
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '10px 16px' }}
              onClick={() => onBook(asset)}
              disabled={asset.status !== 'Available'}
            >
              {asset.status === 'Available' ? 'Request Booking' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssetCard
