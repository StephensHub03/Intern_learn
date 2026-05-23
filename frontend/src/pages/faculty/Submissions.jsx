import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Trophy, User } from 'lucide-react'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { assignmentsAPI } from '../../api/endpoints'
import { formatDateTime } from '../../utils/helpers'
import clsx from 'clsx'

export default function FacultySubmissions() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['assignment-results', id],
    queryFn: () => assignmentsAPI.results(id).then((r) => r.data.data),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  const avgScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length : 0
  const totalMarks = submissions[0]?.total_marks || 0

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-3 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold">{submissions[0]?.assignment_title || 'Assignment Results'}</h1>
          <p className="text-green-100 mt-1 text-lg">{submissions.length} submissions</p>
        </div>

        {submissions.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center border border-gray-800 hover:border-green-500/30 transition-all">
              <p className="text-3xl font-bold text-white">{submissions.length}</p>
              <p className="text-sm text-gray-400 mt-1 font-medium">Total Submissions</p>
            </div>
            <div className="card text-center border border-gray-800 hover:border-green-500/30 transition-all">
              <p className="text-3xl font-bold text-green-400">{avgScore.toFixed(1)}</p>
              <p className="text-sm text-gray-400 mt-1 font-medium">Avg Score / {totalMarks}</p>
            </div>
            <div className="card text-center border border-gray-800 hover:border-green-500/30 transition-all">
              <p className="text-3xl font-bold text-blue-400">
                {totalMarks > 0 ? ((avgScore / totalMarks) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-sm text-gray-400 mt-1 font-medium">Average Percentage</p>
            </div>
          </div>
        )}

        <div className="card border border-gray-800">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-green-400 border-b border-gray-700">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Submitted At</th>
                    <th className="pb-3 font-semibold">Score</th>
                    <th className="pb-3 font-semibold">Percentage</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {submissions.map((sub) => {
                    const pct = totalMarks > 0 ? (sub.score / totalMarks) * 100 : 0
                    return (
                      <tr key={sub.id} className="hover:bg-dark-200 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                              <User className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="font-semibold text-white">{sub.student_name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-300">{formatDateTime(sub.submitted_at)}</td>
                        <td className="py-3 font-bold text-white">{sub.score} / {totalMarks}</td>
                        <td className="py-3">
                          <span className={clsx('font-bold', {
                            'text-green-400': pct >= 75,
                            'text-yellow-400': pct >= 50 && pct < 75,
                            'text-red-400': pct < 50,
                          })}>
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={clsx('badge', {
                            'bg-green-500/20 text-green-400 border border-green-500/30': sub.is_evaluated,
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': !sub.is_evaluated,
                          })}>
                            {sub.is_evaluated ? 'Evaluated' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
