import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, Video, ClipboardList, Plus } from 'lucide-react'
import Layout from '../../components/common/Layout'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { coursesAPI, sessionsAPI, assignmentsAPI } from '../../api/endpoints'
import { formatDateTime, isOverdue } from '../../utils/helpers'
import { useAuthStore } from '../../store/authStore'

export default function FacultyDashboard() {
  const { user } = useAuthStore()

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.list().then((r) => r.data.data),
  })
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsAPI.list().then((r) => r.data.data),
  })
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsAPI.list().then((r) => r.data.data),
  })

  const upcomingSessions = sessions.filter((s) => !isOverdue(s.scheduled_at))

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="text-green-100 mt-1 text-lg">Welcome, {user?.first_name}!</p>
          </div>
          <div className="flex gap-3">
            <Link to="/faculty/sessions/create" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Session
            </Link>
            <Link to="/faculty/assignments/create"
              className="bg-white text-black hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg border-2 border-white transition-all flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Assignment
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Courses" value={courses.length} icon={BookOpen} color="teal" />
          <StatCard title="Upcoming Sessions" value={upcomingSessions.length} icon={Video} color="gold"
            to="/faculty/sessions" />
          <StatCard title="Assignments" value={assignments.length} icon={ClipboardList} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Courses */}
          <div className="card">
            <h2 className="font-bold text-white text-xl mb-4">My Courses</h2>
            {courses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No courses assigned yet</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-3 p-3 bg-dark-200 rounded-lg border border-gray-800 hover:border-green-500/30 transition-all">
                    <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                      <BookOpen className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{course.title}</p>
                      <p className="text-xs text-green-400">{course.enrollment_count} students enrolled</p>
                    </div>
                    <Link to="/faculty/assignments/create"
                      className="text-xs text-green-400 hover:text-green-300 font-medium hover:underline">
                      Add Assignment
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-xl">Upcoming Sessions</h2>
              <Link to="/faculty/sessions" className="text-sm text-green-400 font-medium hover:text-green-300 flex items-center gap-1">
                View all →
              </Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-start gap-3 p-3 bg-dark-200 rounded-lg border border-gray-800 hover:border-green-500/30 transition-all">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <Video className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{session.title}</p>
                      <p className="text-xs text-gray-400">{session.course_detail?.title}</p>
                      <p className="text-xs text-green-400 mt-1">{formatDateTime(session.scheduled_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignments table */}
        <div className="card">
          <h2 className="font-bold text-white text-xl mb-4">My Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No assignments created yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-green-400 border-b border-gray-700">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Questions</th>
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-dark-200 transition-colors">
                      <td className="py-3 font-semibold text-white">{a.title}</td>
                      <td className="py-3 text-gray-300">{a.question_count}</td>
                      <td className="py-3 text-gray-300">{formatDateTime(a.due_date)}</td>
                      <td className="py-3">
                        <Link to={`/faculty/assignments/${a.id}/submissions`}
                          className="text-green-400 hover:text-green-300 font-semibold text-xs hover:underline">
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
