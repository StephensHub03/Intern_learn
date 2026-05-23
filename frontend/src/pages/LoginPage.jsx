import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/helpers'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => loginMutation.mutate(data)

  const loginError = loginMutation.isError
    ? getErrorMessage(loginMutation.error)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative', overflow: 'hidden' }}>

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,234,100,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,234,100,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#00ea64', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 0 32px rgba(0,234,100,0.5)' }}>
            <BookOpen style={{ width: '32px', height: '32px', color: '#000' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0 }}>InternLearn</h1>
          <p style={{ color: '#00ea64', marginTop: '6px', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#111111', borderRadius: '20px', padding: '32px', border: loginError ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)', boxShadow: loginError ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 20px 60px rgba(0,0,0,0.5)', transition: 'border 0.3s, box-shadow 0.3s' }}>

          {/* ── ERROR BANNER ── */}
          {loginError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ color: '#f87171', fontWeight: '700', fontSize: '14px', margin: 0 }}>Invalid Credentials</p>
                <p style={{ color: '#fca5a5', fontSize: '13px', margin: '4px 0 0 0' }}>{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#00ea64', marginBottom: '6px' }}>Username</label>
              <input
                {...register('username', { required: 'Username is required' })}
                placeholder="Enter your username"
                autoComplete="username"
                style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: errors.username ? '1px solid rgba(239,68,68,0.6)' : loginError ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
              />
              {errors.username && (
                <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>⚠ {errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#00ea64', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '10px 44px 10px 14px', background: '#1a1a1a', border: errors.password ? '1px solid rgba(239,68,68,0.6)' : loginError ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}
                >
                  {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{ width: '100%', padding: '12px', background: loginMutation.isPending ? 'rgba(0,234,100,0.6)' : '#00ea64', border: 'none', borderRadius: '10px', color: '#000', fontSize: '15px', fontWeight: '700', cursor: loginMutation.isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(0,234,100,0.3)' }}
            >
              {loginMutation.isPending ? (
                <>
                  <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: '#555', fontSize: '12px', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#00ea64', fontWeight: '600', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
