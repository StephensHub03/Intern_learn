import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, Video, ClipboardList, Award, ArrowRight, Clock } from 'lucide-react'
import Layout from '../../components/common/Layout'
import StatCard from '../../components/common/StatCard'
import ProgressBar from '../../components/common/ProgressBar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { coursesAPI, sessionsAPI, assignmentsAPI, progressAPI } from '../../api/endpoints'
import { formatDateTime, isOverdue } from '../../utils/helpers'
import { useAuthStore } from '../../store/authStore'

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
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
  const { data: progressList = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressAPI.list().then((r) => r.data.data),
  })

  const enrolledCourses = courses.filter((c) => c.is_enrolled)
  const upcomingSessions = sessions.filter((s) => !isOverdue(s.scheduled_at)).slice(0, 3)
  // Show all assignments — both pending and overdue
  const pendingAssignments = assignments.filter((a) => !isOverdue(a.due_date)).slice(0, 3)
  const overdueAssignments = assignments.filter((a) => isOverdue(a.due_date)).slice(0, 3)
  const allAssignments = [...pendingAssignments, ...overdueAssignments].slice(0, 4)

  if (loadingCourses) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  return (
    <Layout>
      <div className="space-y-8">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-green-100 mt-1 text-lg">Here's what's happening with your learning.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Enrolled Courses" value={enrolledCourses.length} icon={BookOpen} color="teal"
            to="/student/courses?filter=enrolled" />
          <StatCard title="Upcoming Sessions" value={upcomingSessions.length} icon={Video} color="gold"
            to="/student/sessions" />
          <StatCard title="Assignments" value={assignments.length} icon={ClipboardList} color="orange"
            subtitle={`${pendingAssignments.length} pending`}
            to="/student/assignments" />
          <StatCard title="Certificates Earned" value={progressList.filter(p => p.progress_percent >= 100).length} icon={Award} color="green"
            to="/student/certificates" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-xl">Upcoming Sessions</h2>
              <Link to="/student/sessions" className="text-sm text-green-400 font-medium hover:text-green-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start gap-3 p-3 bg-dark-200 rounded-lg border border-gray-800 hover:border-green-500/30 transition-all">
                    <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0 border border-green-500/30">
                      <Video className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{session.title}</p>
                      <p className="text-xs text-gray-400">{session.course_detail?.title}</p>
                      <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />{formatDateTime(session.scheduled_at)}
                      </p>
                    </div>
                    {session.meet_link && (
                      <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-green-500 text-black px-3 py-1.5 rounded-md hover:bg-green-400 whitespace-nowrap font-semibold transition-all">
                        Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-xl">My Assignments</h2>
              <Link to="/student/assignments" className="text-sm text-green-400 font-medium hover:text-green-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {allAssignments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No assignments yet</p>
            ) : (
              <div className="space-y-3">
                {allAssignments.map((assignment) => {
                  const overdue = isOverdue(assignment.due_date)
                  const submitted = assignment.is_submitted
                  return (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 bg-dark-200 rounded-lg border border-gray-800 hover:border-green-500/30 transition-all">
                      <div className={`p-2 rounded-lg flex-shrink-0 border ${submitted ? 'bg-green-500/20 border-green-500/30' : overdue ? 'bg-red-500/20 border-red-500/30' : 'bg-orange-500/20 border-orange-500/30'}`}>
                        <ClipboardList className={`w-4 h-4 ${submitted ? 'text-green-400' : overdue ? 'text-red-400' : 'text-orange-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{assignment.title}</p>
                        <p className="text-xs text-gray-400">{assignment.question_count} questions • {assignment.total_marks} marks</p>
                        <p className={`text-xs mt-1 ${submitted ? 'text-green-400' : overdue ? 'text-red-400' : 'text-green-400'}`}>
                          {submitted ? '✓ Submitted' : overdue ? '⚠ Overdue: ' : 'Due: '}{!submitted && formatDateTime(assignment.due_date)}
                        </p>
                      </div>
                      {submitted ? (
                        <Link to={`/student/assignments/${assignment.id}/results`}
                          className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-md hover:bg-green-500/30 whitespace-nowrap font-semibold transition-all">
                          View Results
                        </Link>
                      ) : (
                        <Link to={`/student/assignments/${assignment.id}`}
                          className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap font-semibold transition-all ${overdue ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-green-500 text-black hover:bg-green-400'}`}>
                          {overdue ? 'View' : 'Attempt'}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Course Progress */}
        {progressList.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-xl">Course Progress</h2>
              <Link to="/student/progress" className="text-sm text-green-400 font-medium hover:text-green-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {progressList.slice(0, 4).map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-white">{p.course_detail?.title}</span>
                    <span className="text-green-400 font-bold">{p.progress_percent.toFixed(0)}%</span>
                  </div>
                  <ProgressBar percent={p.progress_percent} showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
