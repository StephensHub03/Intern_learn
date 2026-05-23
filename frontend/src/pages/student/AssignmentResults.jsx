import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { assignmentsAPI } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'

export default function AssignmentResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isStudent = user?.role === 'student'

  // Students use my-result endpoint; faculty/admin use results endpoint
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-result', id],
    queryFn: () => isStudent
      ? assignmentsAPI.myResult(id).then((r) => r.data.data)
      : assignmentsAPI.results(id).then((r) => r.data.data[0]),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  if (isError || !data) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto mt-20 text-center card border border-gray-800">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-white font-semibold text-lg">No submission found</p>
          <p className="text-gray-400 mt-1">Please attempt the assignment first.</p>
          <button onClick={() => navigate(`/student/assignments/${id}`)}
            className="btn-primary mt-4 px-6">
            Go to Assignment
          </button>
        </div>
      </Layout>
    )
  }

  const mySubmission = data

  const percentage = mySubmission.total_marks > 0
    ? (mySubmission.score / mySubmission.total_marks) * 100 : 0

  const grade =
    percentage >= 90 ? { label: 'Excellent 🏆', color: '#00ea64', bg: 'rgba(0,234,100,0.1)', border: 'rgba(0,234,100,0.3)' } :
    percentage >= 75 ? { label: 'Good 👍', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' } :
    percentage >= 50 ? { label: 'Average 📚', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' } :
    { label: 'Needs Improvement 💪', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        <button onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Score card */}
        <div className="card text-center border border-gray-800" style={{ borderColor: grade.border }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: grade.bg, border: `2px solid ${grade.border}` }}>
            <Trophy className="w-10 h-10" style={{ color: grade.color }} />
          </div>
          <h1 className="text-2xl font-bold text-white">{mySubmission.assignment_title}</h1>

          {/* Big score */}
          <div className="mt-6 mb-4">
            <p className="text-6xl font-bold" style={{ color: grade.color }}>
              {mySubmission.score}
              <span className="text-3xl text-gray-500">/{mySubmission.total_marks}</span>
            </p>
          </div>

          {/* Grade badge */}
          <div className="inline-block px-5 py-2 rounded-full text-base font-bold mb-3"
            style={{ background: grade.bg, color: grade.color, border: `1px solid ${grade.border}` }}>
            {grade.label}
          </div>

          <p className="text-gray-400 font-semibold">{percentage.toFixed(1)}% correct</p>

          {/* Score bar */}
          <div className="mt-4 w-full bg-gray-800 rounded-full h-3">
            <div className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${percentage}%`, background: grade.color }} />
          </div>
        </div>

        {/* Answer breakdown */}
        <div className="card border border-gray-800">
          <h2 className="font-bold text-white text-xl mb-4">Answer Breakdown</h2>
          <div className="space-y-4">
            {mySubmission.answers?.map((answer, index) => (
              <div key={answer.id}
                className="p-4 rounded-xl border transition-all"
                style={{
                  border: answer.is_correct ? '1px solid rgba(0,234,100,0.3)' : '1px solid rgba(248,113,113,0.3)',
                  background: answer.is_correct ? 'rgba(0,234,100,0.05)' : 'rgba(248,113,113,0.05)',
                }}>
                <div className="flex items-start gap-3">
                  {answer.is_correct
                    ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-semibold text-white">Q{index + 1}. {answer.question_text}</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p className="flex items-center gap-2 font-medium"
                        style={{ color: answer.is_correct ? '#4ade80' : '#f87171' }}>
                        Your answer:
                        <span className="font-bold uppercase px-2 py-0.5 rounded"
                          style={{ background: answer.is_correct ? 'rgba(0,234,100,0.15)' : 'rgba(248,113,113,0.15)' }}>
                          {answer.selected_option}
                        </span>
                      </p>
                      {!answer.is_correct && (
                        <p className="flex items-center gap-2 font-medium text-green-400">
                          Correct answer:
                          <span className="font-bold uppercase px-2 py-0.5 rounded bg-green-500/15">
                            {answer.correct_option}
                          </span>
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-semibold mt-2"
                      style={{ color: answer.is_correct ? '#00ea64' : '#9ca3af' }}>
                      {answer.is_correct ? `+${answer.marks}` : '0'} / {answer.marks} marks
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
