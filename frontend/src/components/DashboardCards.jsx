import React from 'react'

const DashboardCards = ({ stats }) => {
  return (
    <div className="metrics-grid">
      <div className="metric-card glass-panel">
        <h3>Asset Profiles</h3>
        <div className="metric-value">{stats?.total_assets || 0}</div>
      </div>
      <div className="metric-card glass-panel">
        <h3>Total Inventory</h3>
        <div className="metric-value">{stats?.total_quantity || 0}</div>
      </div>
      <div className="metric-card glass-panel success">
        <h3>Available Inventory</h3>
        <div className="metric-value">{stats?.available_assets || 0}</div>
      </div>
      <div className="metric-card glass-panel">
        <h3>Active Bookings</h3>
        <div className="metric-value">{stats?.active_bookings || 0}</div>
      </div>
      <div className="metric-card glass-panel warning">
        <h3>Pending Requests</h3>
        <div className="metric-value">{stats?.pending_bookings || 0}</div>
      </div>
      <div className="metric-card glass-panel danger">
        <h3>Overdue Returns</h3>
        <div className="metric-value">{stats?.overdue_bookings || 0}</div>
      </div>
    </div>
  )
}

export default DashboardCards
