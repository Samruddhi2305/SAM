import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AssetUsageChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '100px' }}>No usage data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />
        <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={35} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AssetUsageChart
