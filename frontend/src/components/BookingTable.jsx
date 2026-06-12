import React from 'react'

const BookingTable = ({ bookings, isAdmin = false, onApprove, onReject, onIssue, onReturn }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      case 'approved':
        return <span className="badge badge-info">Approved</span>
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>
      case 'issued':
        return <span className="badge badge-primary" style={{ background: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>Issued</span>
      case 'returned':
        return <span className="badge badge-success">Returned</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="table-container">
      {bookings.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No bookings recorded.
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              {!isAdmin ? null : <th>User Email</th>}
              <th>Quantity</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Notes</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td style={{ fontWeight: 600 }}>{booking.asset_name}</td>
                {!isAdmin ? null : <td>{booking.user_email}</td>}
                <td>{booking.quantity}</td>
                <td>{formatDate(booking.start_date)}</td>
                <td>{formatDate(booking.end_date)}</td>
                <td>{getStatusBadge(booking.status)}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {booking.notes || '-'}
                </td>
                {isAdmin && (
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => onApprove(booking._id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => onReject(booking._id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => onIssue(booking._id)}
                        >
                          Check Out
                        </button>
                      )}
                      {booking.status === 'issued' && (
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => onReturn(booking._id)}
                        >
                          Check In
                        </button>
                      )}
                      {['rejected', 'returned'].includes(booking.status) && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default BookingTable
