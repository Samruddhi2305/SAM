import React, { useState, useEffect } from 'react'
import DashboardCards from '../components/DashboardCards'
import CategoryChart from '../charts/CategoryChart'
import BookingTrendChart from '../charts/BookingTrendChart'
import AssetUsageChart from '../charts/AssetUsageChart'
import { getDashboardStats } from '../services/bookingApi'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (err) {
      setError('Failed to fetch dashboard statistics.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        Loading dashboard metrics...
      </div>
    )
  }

  if (error) {
    return (
      <div className="badge badge-danger" style={{ display: 'block', padding: '16px', borderRadius: '8px', textAlign: 'center', textTransform: 'none' }}>
        ⚠️ {error}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Operational Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real-time metrics and utilization insights for all shared Cultural Council assets.
        </p>
      </div>

      {/* Metrics Summary Cards */}
      <DashboardCards stats={stats?.summary} />

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <h3>Category Distribution</h3>
          <CategoryChart data={stats?.category_distribution} />
        </div>

        <div className="chart-card glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <h3>Top 5 Frequently Utilized Assets</h3>
          <AssetUsageChart data={stats?.asset_utilization} />
        </div>
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="chart-card glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <h3>Recent Booking Activity Trend</h3>
          <BookingTrendChart data={stats?.booking_trends} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
