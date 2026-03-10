import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_REDIRECTS = {
  admin:        '/admin/login',
  distributor:  '/distributor/login',
  dealer_user:  '/dealer/login',
}

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  // Show loading spinner while checking auth
  if (loading) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-dark-400 text-sm font-mono">Loading...</p>
      </div>
    </div>
  )
  
  // If not loading and no user, redirect to login
  if (!user) {
    console.warn(`[ROUTE] No user found, redirecting to ${ROLE_REDIRECTS[role] ?? '/dealer/login'}`)
    return <Navigate to={ROLE_REDIRECTS[role] ?? '/dealer/login'} replace />
  }

  // If user role doesn't match required role, redirect to proper dashboard
  if (user.role !== role) {
    const home = { admin: '/admin', distributor: '/distributor', dealer_user: '/dealer' }
    console.warn(`[ROUTE] User role '${user.role}' doesn't match required role '${role}', redirecting to ${home[user.role] ?? '/dealer/login'}`)
    return <Navigate to={home[user.role] ?? '/dealer/login'} replace />
  }

  return children
}