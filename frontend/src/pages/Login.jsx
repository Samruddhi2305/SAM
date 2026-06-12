import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login, verifyOTP } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpRequired, setOtpRequired] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      if (data.status === 'otp_required') {
        setOtpRequired(true)
      } else {
        if (data.role === 'admin') {
          navigate('/dashboard')
        } else {
          navigate('/assets')
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await verifyOTP(email, otp)
      if (data.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/assets')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="auth-header">
          <h2>Welcome to SAM</h2>
          <p>Smart Asset Management & Allocation</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', textAlign: 'center', textTransform: 'none' }}>
            {error}
          </div>
        )}

        {!otpRequired ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                required 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px', height: '48px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                A 6-digit OTP has been sent. For demonstration, check the **backend server console terminal log** to retrieve the simulated code.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                id="otp" 
                className="form-input" 
                required 
                maxLength="6"
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px', height: '48px' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '12px', height: '40px' }}
              onClick={() => {
                setOtpRequired(false)
                setError('')
              }}
            >
              Back to Password
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
