import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'

export default function RegisterPage() {
  const registerMutation = useRegister()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'student' } })
  const password = watch('password')
  const onSubmit = (data) => registerMutation.mutate(data)

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-dark-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-green-300 mt-1">Join the InternLearn platform</p>
        </div>

        <div className="bg-dark-300 rounded-2xl shadow-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">First Name</label>
                <input {...register('first_name', { required: 'Required' })} className="input-field" placeholder="John" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Last Name</label>
                <input {...register('last_name', { required: 'Required' })} className="input-field" placeholder="Doe" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Username</label>
              <input {...register('username', { required: 'Username is required' })} className="input-field" placeholder="johndoe" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                type="email" className="input-field" placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Role</label>
              <select {...register('role')} className="input-field">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Password</label>
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                type="password" className="input-field" placeholder="Min. 8 characters"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Confirm Password</label>
              <input
                {...register('password2', { required: 'Please confirm your password', validate: (val) => val === password || 'Passwords do not match' })}
                type="password" className="input-field" placeholder="Repeat password"
              />
              {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2.message}</p>}
            </div>

            <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full py-3 text-base mt-2">
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-green-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 font-semibold hover:text-green-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
