import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/bookingApi'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchNotes = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotes()
    // Poll notifications every 15 seconds for real-time feel
    const interval = setInterval(fetchNotes, 15000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      fetchNotes()
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      fetchNotes()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <nav className="navbar glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Smart Asset Manager</h2>
        {user?.role === 'admin' && (
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Admin Mode</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
        {/* Notification Bell */}
        <div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>

        {/* Notifications Dropdown */}
        {showDropdown && (
          <div className="notification-dropdown glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                No notifications
              </div>
            ) : (
              notifications.map((note) => (
                <div 
                  key={note._id} 
                  className={`notification-item ${!note.is_read ? 'unread' : ''}`}
                  onClick={() => !note.is_read && handleMarkRead(note._id)}
                  style={{ cursor: !note.is_read ? 'pointer' : 'default' }}
                >
                  <p style={{ margin: 0, color: note.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{note.message}</p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
