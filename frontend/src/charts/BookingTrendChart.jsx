import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BookingTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '100px' }}>No trend data available</div>
  }

  const chartData = data.map(item => {
    try {
      const date = new Date(item.date)
      const formatted = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      return { ...item, displayDate: formatted }
    } catch (e) {
      return { ...item, displayDate: item.date }
    }
  })

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />
        <Area type="monotone" dataKey="bookings" stroke="#10b981" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default BookingTrendChart
