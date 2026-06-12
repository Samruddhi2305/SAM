import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import MyBookings from './pages/MyBookings'
import AdminAssets from './pages/AdminAssets'
import AdminRequests from './pages/AdminRequests'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

const ProtectedLayout = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-primary)',
        background: 'var(--bg-primary)'
      }}>
        <div className="spinner">Loading Platform...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/assets" replace />
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-body">
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedLayout adminOnly={true}>
              <Dashboard />
            </ProtectedLayout>
          } />
          
          <Route path="/assets" element={
            <ProtectedLayout>
              <Assets />
            </ProtectedLayout>
          } />
          
          <Route path="/my-bookings" element={
            <ProtectedLayout>
              <MyBookings />
            </ProtectedLayout>
          } />
          
          <Route path="/admin/assets" element={
            <ProtectedLayout adminOnly={true}>
              <AdminAssets />
            </ProtectedLayout>
          } />
          
          <Route path="/admin/requests" element={
            <ProtectedLayout adminOnly={true}>
              <AdminRequests />
            </ProtectedLayout>
          } />

          <Route path="*" element={<Navigate to="/assets" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
