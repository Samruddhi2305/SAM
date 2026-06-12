import api from './api'

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData)
  return response.data
}

export const getBookings = async () => {
  const response = await api.get('/bookings')
  return response.data
}

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my')
  return response.data
}

export const updateBookingStatus = async (id, status, notes = '') => {
  const response = await api.put(`/bookings/${id}/status`, { status, notes })
  return response.data
}

// Dashboard Analytics
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats')
  return response.data
}

// Notifications
export const getNotifications = async () => {
  const response = await api.get('/notifications')
  return response.data
}

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`)
  return response.data
}

export const markAllNotificationsRead = async () => {
  const response = await api.post('/notifications/read-all')
  return response.data
}

// Audit Trail
export const getAuditLogs = async () => {
  const response = await api.get('/audit')
  return response.data
}
