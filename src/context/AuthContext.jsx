import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token    = localStorage.getItem('carezo_token')
        const userData = localStorage.getItem('carezo_user')
        
        if (token && userData) {
          const user = JSON.parse(userData)
          setUser(user)
          console.log('[AUTH] Session restored from localStorage')
        }
      } catch (err) {
        console.error('[AUTH] Failed to restore session:', err)
        localStorage.removeItem('carezo_token')
        localStorage.removeItem('carezo_user')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback((token, userData) => {
    console.log('[AUTH] Login successful for user:', userData.name)
    localStorage.setItem('carezo_token', token)
    localStorage.setItem('carezo_user', JSON.stringify(userData))
    setUser(userData)
    setIsLoggedOut(false)
  }, [])

  const logout = useCallback(() => {
    console.log('[AUTH] Logging out user')
    localStorage.removeItem('carezo_token')
    localStorage.removeItem('carezo_user')
    setUser(null)
    setIsLoggedOut(true)
  }, [])

  const updateWallet = useCallback((newBalance) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, wallet: newBalance }
      localStorage.setItem('carezo_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateWallet, isLoggedOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)