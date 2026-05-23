import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />
    if (user?.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
