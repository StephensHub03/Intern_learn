import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { authAPI } from '../../api/endpoints'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import clsx from 'clsx'

// Button that shows current state and hints at the action on hover
function ToggleButton({ isActive, isPending, onClick }) {
  const [hovered, setHovered] = useState(false)

  // When active: default = red "Deactivate", hover = darker red
  // When inactive: default = green "Activate", hover = darker green
  const style = isActive
    ? {
        background: hovered ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.15)',
        color: '#f87171',
        border: '1px solid rgba(239,68,68,0.4)',
      }
    : {
        background: hovered ? 'rgba(0,234,100,0.25)' : 'rgba(0,234,100,0.12)',
        color: '#4ade80',
        border: '1px solid rgba(0,234,100,0.35)',
      }

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        padding: '6px 12px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {isActive
        ? <><UserX style={{ width: 12, height: 12 }} /> Deactivate</>
        : <><UserCheck style={{ width: 12, height: 12 }} /> Activate</>}
    </button>
  )
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authAPI.listUsers().then((r) => r.data.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => authAPI.toggleUserActive(id),
    onSuccess: (response) => {
      toast.success(response.data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !roleFilter || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-green-100 mt-1 text-lg">{users.length} total users</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name, email, or username..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field sm:w-40">
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-500/20 border-b border-green-500/30">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-green-400">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-green-400">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-green-400">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold text-green-400">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-green-400">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-green-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-gray-500" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-200 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('badge capitalize', {
                          'bg-red-500/20 text-red-400 border border-red-500/30': user.role === 'admin',
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30': user.role === 'faculty',
                          'bg-green-500/20 text-green-400 border border-green-500/30': user.role === 'student',
                        })}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.phone_number || '—'}</td>
                      <td className="px-6 py-4 text-gray-300">{formatDate(user.date_joined)}</td>
                      <td className="px-6 py-4">
                        <span className={clsx('badge', {
                          'bg-green-500/20 text-green-400 border border-green-500/30': user.is_active,
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30': !user.is_active,
                        })}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ToggleButton
                          isActive={user.is_active}
                          isPending={toggleMutation.isPending}
                          onClick={() => toggleMutation.mutate(user.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
