/**
 * Custom hook for authentication actions.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../utils/helpers'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      const { data } = response.data
      setAuth(data.user, data.access, data.refresh)
      toast.success('Welcome back!')
      const role = data.user.role
      if (role === 'student') navigate('/student/dashboard')
      else if (role === 'faculty') navigate('/faculty/dashboard')
      else if (role === 'admin') navigate('/admin/dashboard')
    },
    onError: (error) => {
      const msg = getErrorMessage(error)
      toast.error(msg, {
        duration: 5000,
        style: {
          background: '#1a0a0a',
          color: '#fca5a5',
          border: '1px solid rgba(239,68,68,0.5)',
          fontWeight: '600',
        },
        icon: '🚫',
      })
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      toast.success('Registration successful! Please log in.')
      navigate('/login')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authAPI.logout(refreshToken),
    onSettled: () => {
      // Clear ALL cached queries so next user gets fresh data
      queryClient.clear()
      logout()
      navigate('/login')
      toast.success('Logged out successfully.')
    },
  })
}

export function useMe() {
  const { accessToken } = useAuthStore()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authAPI.me().then((r) => r.data.data),
    enabled: !!accessToken,
  })
}
