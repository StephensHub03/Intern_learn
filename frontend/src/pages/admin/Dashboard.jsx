import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, ClipboardList, TrendingUp } from 'lucide-react'
import Layout from '../../components/common/Layout'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { authAPI, coursesAPI, assignmentsAPI } from '../../api/endpoints'
import clsx from 'clsx'

export default function AdminDashboard() {
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authAPI.listUsers().then((r) => r.data.data),
  })
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => coursesAPI.list().then((r) => r.data.data),
    staleTime: 0,
  })
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsAPI.list().then((r) => r.data.data),
  })

  if (loadingUsers || loadingCourses) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  const students = users.filter((u) => u.role === 'student')
  const faculty = users.filter((u) => u.role === 'faculty')
  const activeCourses = courses.filter((c) => c.is_active)

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-green-100 mt-1 text-lg">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={students.length} icon={Users} color="teal"
            subtitle={`${users.filter(u => u.is_active && u.role === 'student').length} active`} />
          <StatCard title="Faculty Members" value={faculty.length} icon={Users} color="gold" />
          <StatCard title="Active Courses" value={activeCourses.length} icon={BookOpen} color="green"
            subtitle={`${courses.length} total`} />
          <StatCard title="Assignments" value={assignments.length} icon={ClipboardList} color="orange" />
        </div>

        {/* Recent users */}
        <div className="card">
          <h2 className="font-bold text-white text-xl mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-green-400 border-b border-gray-700">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="hover:bg-dark-200 transition-colors">
                    <td className="py-3 font-semibold text-white">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-3 text-gray-300">{user.email}</td>
                    <td className="py-3">
                      <span className={clsx('badge capitalize', {
                        'bg-red-500/20 text-red-400 border border-red-500/30': user.role === 'admin',
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30': user.role === 'faculty',
                        'bg-green-500/20 text-green-400 border border-green-500/30': user.role === 'student',
                      })}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={clsx('badge', {
                        'bg-green-500/20 text-green-400 border border-green-500/30': user.is_active,
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30': !user.is_active,
                      })}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses overview */}
        <div className="card">
          <h2 className="font-bold text-white text-xl mb-4">Courses Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <div key={course.id} className="p-4 bg-dark-200 rounded-xl border border-gray-800 hover:border-green-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">{course.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {course.faculty_detail
                        ? `${course.faculty_detail.first_name} ${course.faculty_detail.last_name}`
                        : 'No faculty assigned'}
                    </p>
                  </div>
                  <span className={clsx('badge text-xs', {
                    'bg-green-500/20 text-green-400 border border-green-500/30': course.is_active,
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30': !course.is_active,
                  })}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-green-400 font-medium mt-2">{course.enrollment_count} enrolled</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
