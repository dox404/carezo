import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token    = localStorage.getItem('carezo_token')
    const userData = localStorage.getItem('carezo_user')
    if (token && userData) {
      try { setUser(JSON.parse(userData)) } catch { }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('carezo_token', token)
    localStorage.setItem('carezo_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('carezo_token')
    localStorage.removeItem('carezo_user')
    setUser(null)
  }

  const updateWallet = (newBalance) => {
    setUser(prev => {
      const updated = { ...prev, wallet: newBalance }
      localStorage.setItem('carezo_user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)