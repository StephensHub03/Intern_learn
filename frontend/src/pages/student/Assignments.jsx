import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { assignmentsAPI } from '../../api/endpoints'
import { formatDateTime, isOverdue } from '../../utils/helpers'

export default function StudentAssignments() {
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsAPI.list().then((r) => r.data.data),
    staleTime: 0,
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  const pending = assignments.filter((a) => !isOverdue(a.due_date))
  const overdue = assignments.filter((a) => isOverdue(a.due_date))

  return (
    <Layout>
      <div className="space-y-8">

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">My Assignments</h1>
          <p className="text-green-100 mt-1 text-lg">
            {assignments.length} total · {pending.length} pending · {overdue.length} overdue
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="card text-center py-16 border border-gray-800">
            <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">No assignments yet</p>
            <p className="text-gray-400 mt-1">Enroll in courses to see assignments here.</p>
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" /> Pending Assignments
                </h2>
                <div className="space-y-3">
                  {pending.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} overdue={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Overdue */}
            {overdue.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" /> Overdue Assignments
                </h2>
                <div className="space-y-3">
                  {overdue.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} overdue={true} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

function AssignmentCard({ assignment, overdue }) {
  const submitted = assignment.is_submitted

  return (
    <div className="card border transition-all hover:shadow-lg"
      style={{
        border: submitted
          ? '1px solid rgba(0,234,100,0.25)'
          : overdue
          ? '1px solid rgba(248,113,113,0.25)'
          : '1px solid rgba(255,255,255,0.08)',
        background: submitted
          ? 'rgba(0,234,100,0.03)'
          : overdue
          ? 'rgba(248,113,113,0.03)'
          : '#111111',
      }}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl flex-shrink-0"
          style={{
            background: submitted
              ? 'rgba(0,234,100,0.15)'
              : overdue
              ? 'rgba(248,113,113,0.15)'
              : 'rgba(0,234,100,0.15)',
            border: submitted
              ? '1px solid rgba(0,234,100,0.3)'
              : overdue
              ? '1px solid rgba(248,113,113,0.3)'
              : '1px solid rgba(0,234,100,0.3)',
          }}>
          <ClipboardList className="w-5 h-5"
            style={{ color: submitted ? '#00ea64' : overdue ? '#f87171' : '#00ea64' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white text-lg">{assignment.title}</h3>
            {submitted && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(0,234,100,0.15)', color: '#00ea64', border: '1px solid rgba(0,234,100,0.3)' }}>
                ✓ Submitted
              </span>
            )}
          </div>
          {assignment.description && (
            <p className="text-gray-400 text-sm mt-1">{assignment.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-xs font-medium flex items-center gap-1"
              style={{ color: submitted ? '#4ade80' : overdue ? '#f87171' : '#4ade80' }}>
              <Clock className="w-3 h-3" />
              {submitted ? 'Submitted ✓' : overdue ? 'Overdue: ' : 'Due: '}
              {!submitted && formatDateTime(assignment.due_date)}
            </span>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
              {assignment.question_count} questions
            </span>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
              {assignment.total_marks} marks
            </span>
          </div>
        </div>

        {submitted ? (
          <Link
            to={`/student/assignments/${assignment.id}/results`}
            className="flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{ background: 'rgba(0,234,100,0.15)', color: '#00ea64', border: '1px solid rgba(0,234,100,0.3)' }}
          >
            View Results →
          </Link>
        ) : (
          <Link
            to={`/student/assignments/${assignment.id}`}
            className="flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: overdue ? 'rgba(248,113,113,0.15)' : '#00ea64',
              color: overdue ? '#f87171' : '#000',
              border: overdue ? '1px solid rgba(248,113,113,0.3)' : 'none',
            }}
          >
            {overdue ? 'View' : 'Attempt →'}
          </Link>
        )}
      </div>
    </div>
  )
}
