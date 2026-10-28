import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authApi.me()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (email, username, password, full_name) => {
    const { data } = await authApi.register({ email, username, password, full_name })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = async (updates) => {
    const { data } = await authApi.update(updates)
    setUser(data)
    return data
  }

  // Returns the verified user without storing it, so the OTP screen can play its
  // success animation before the route guard moves on to the dashboard.
  const verifyOtp = async (code) => (await authApi.verifyOtp(code)).data.user

  const completeVerification = (verifiedUser) => {
    localStorage.setItem('user', JSON.stringify(verifiedUser))
    setUser(verifiedUser)
  }

  const resendOtp = async () => (await authApi.resendOtp()).data

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, verifyOtp, completeVerification, resendOtp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
