import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute() {
  const { accessToken } = useAuthStore()

  if (!accessToken) {
    // No session → go to landing page
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
