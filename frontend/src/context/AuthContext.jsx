import React, { createContext, useState, useEffect, useContext } from 'react'
import { getMe, login as apiLogin, register as apiRegister, verifyOtp as apiVerifyOtp } from '../services/authApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          localStorage.setItem('token', token)
          const data = await getMe()
          setUser(data)
        } catch (error) {
          console.error("Failed to load user profile:", error)
          logout()
        }
      } else {
        setUser(null)
        localStorage.removeItem('token')
      }
      setLoading(false)
    }

    fetchUser()
  }, [token])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      setLoading(false)
      // If OTP is required, we don't log in yet
      if (data.status === 'otp_required') {
        return data
      }
      setToken(data.access_token)
      setUser({
        email: data.email,
        name: data.name,
        role: data.role
      })
      return data
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const verifyOTP = async (email, otp) => {
    setLoading(true)
    try {
      const data = await apiVerifyOtp(email, otp)
      setToken(data.access_token)
      setUser({
        email: data.email,
        name: data.name,
        role: data.role
      })
      setLoading(false)
      return data
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const data = await apiRegister(name, email, password)
      setLoading(false)
      return data
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verifyOTP, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
