import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ClipboardList, Clock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { assignmentsAPI } from '../../api/endpoints'
import { formatDateTime, isOverdue, getErrorMessage } from '../../utils/helpers'

export default function AssignmentAttempt() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentsAPI.get(id).then((r) => r.data.data),
  })

  // Check if already submitted
  const { data: existingResult } = useQuery({
    queryKey: ['my-result', id],
    queryFn: () => assignmentsAPI.myResult(id).then((r) => r.data.data).catch(() => null),
    retry: false,
  })

  const submitMutation = useMutation({
    mutationFn: (data) => assignmentsAPI.submit(id, data),
    onSuccess: () => {
      toast.success('Assignment submitted successfully!')
      navigate(`/student/assignments/${id}/results`)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const handleSubmit = () => {
    if (!assignment) return
    const unanswered = assignment.questions.filter((q) => !answers[q.id])
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`)
      return
    }
    submitMutation.mutate({
      answers: Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id: parseInt(question_id), selected_option,
      })),
    })
  }

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>
  if (!assignment) return (
    <Layout>
      <p className="text-center mt-20 text-gray-400">Assignment not found.</p>
    </Layout>
  )

  // Already submitted — redirect to results
  if (existingResult) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto mt-20 text-center card border border-green-500/30">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Already Submitted</h2>
          <p className="text-gray-400 mt-2">You have already attempted this assignment.</p>
          <p className="text-green-400 font-semibold mt-1">
            Score: {existingResult.score} / {existingResult.total_marks}
          </p>
          <Link
            to={`/student/assignments/${id}/results`}
            className="btn-primary inline-block mt-6 px-8 py-3"
          >
            View My Results →
          </Link>
        </div>
      </Layout>
    )
  }

  const overdue = isOverdue(assignment.due_date)
  const answeredCount = Object.keys(answers).length
  const totalQuestions = assignment.question_count

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              {assignment.description && (
                <p className="text-green-100 mt-1">{assignment.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-green-100 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Due: {formatDateTime(assignment.due_date)}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                  {totalQuestions} questions
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                  {assignment.total_marks} marks
                </span>
              </div>
            </div>
          </div>

          {overdue && (
            <div className="mt-4 flex items-center gap-2 text-red-200 bg-red-500/30 p-3 rounded-lg text-sm border border-red-400/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              This assignment is past its due date. Submission may not be accepted.
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="card border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 font-medium">Progress</span>
            <span className="text-sm font-bold text-green-400">{answeredCount} / {totalQuestions} answered</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        {assignment.questions.map((question, index) => {
          const selected = answers[question.id]
          return (
            <div key={question.id} className="card border border-gray-800 hover:border-green-500/30 transition-all">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-4 text-base">{question.question_text}</p>
                  <div className="space-y-2">
                    {['a', 'b', 'c', 'd'].map((opt) => {
                      const isSelected = selected === opt
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                          style={{
                            border: isSelected ? '1px solid rgba(0,234,100,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(0,234,100,0.1)' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: opt }))}
                            className="hidden"
                          />
                          {/* Custom radio */}
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                            border: isSelected ? '2px solid #00ea64' : '2px solid rgba(255,255,255,0.2)',
                            background: isSelected ? '#00ea64' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000' }} />}
                          </div>
                          <span className="font-bold text-green-400 uppercase w-5">{opt}.</span>
                          <span className="text-white">{question[`option_${opt}`]}</span>
                        </label>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-3">
                    {question.marks} mark{question.marks !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Submit */}
        <div className="card border border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white font-semibold">
                {answeredCount === totalQuestions
                  ? <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> All questions answered!</span>
                  : <span className="text-gray-400">{totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} remaining</span>
                }
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || answeredCount === 0}
              className="btn-primary px-8 py-3 text-base"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
