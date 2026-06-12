import React, { useState, useEffect } from 'react'
import { getMyBookings } from '../services/bookingApi'
import BookingTable from '../components/BookingTable'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings()
      setBookings(data)
    } catch (err) {
      setError('Failed to fetch your booking records.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Filter lists
  const pending = bookings.filter(b => b.status === 'pending')
  const active = bookings.filter(b => ['approved', 'issued'].includes(b.status))
  const history = bookings.filter(b => ['returned', 'rejected'].includes(b.status))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          My Borrowing History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track active resource allocations, pending requests, and your past returns.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your records...</div>
      ) : error ? (
        <div className="badge badge-danger" style={{ display: 'block', padding: '16px', borderRadius: '8px', textAlign: 'center', textTransform: 'none' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Active Allocations */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Active Allocations & Approvals
              <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{active.length}</span>
            </h3>
            <BookingTable bookings={active} isAdmin={false} />
          </div>

          {/* Pending Requests */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Pending Approval
              <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{pending.length}</span>
            </h3>
            <BookingTable bookings={pending} isAdmin={false} />
          </div>

          {/* Past Requests */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Past History & Closed Requests
              <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{history.length}</span>
            </h3>
            <BookingTable bookings={history} isAdmin={false} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
