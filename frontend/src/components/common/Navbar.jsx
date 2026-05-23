import { Link, useLocation } from 'react-router-dom'
import { LogOut, BookOpen } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../hooks/useAuth'
import { getInitials } from '../../utils/helpers'
import clsx from 'clsx'

const NAV_LINKS = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/courses', label: 'Courses' },
    { to: '/student/sessions', label: 'Sessions' },
    { to: '/student/assignments', label: 'Assignments' },
    { to: '/student/progress', label: 'Progress' },
    { to: '/student/certificates', label: 'Certificates' },
  ],
  faculty: [
    { to: '/faculty/dashboard', label: 'Dashboard' },
    { to: '/faculty/sessions', label: 'Sessions' },
    { to: '/faculty/sessions/create', label: 'New Session' },
    { to: '/faculty/assignments/create', label: 'New Assignment' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/courses', label: 'Courses' },
  ],
}

export default function Navbar() {
  const { user } = useAuthStore()
  const logoutMutation = useLogout()
  const location = useLocation()
  const links = NAV_LINKS[user?.role] || []

  return (
    <nav className="bg-dark-300 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-green-400 text-xl tracking-wide">
            <div className="p-1.5 bg-green-500 rounded-lg">
              <BookOpen className="w-5 h-5 text-dark-900" />
            </div>
            <span className="hidden sm:block">InternLearn</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-green-500 text-dark-900 shadow-sm'
                      : 'text-gray-300 hover:bg-dark-200 hover:text-green-400'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-dark-900 text-xs font-bold border-2 border-green-400">
                {getInitials(user ? `${user.first_name} ${user.last_name}` : user?.username)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">
                  {user?.first_name || user?.username}
                </p>
                <p className="text-xs text-green-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}
