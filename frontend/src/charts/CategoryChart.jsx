import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6']

const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '100px' }}>No category data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            color: 'var(--text-primary)' 
          }} 
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CategoryChart
