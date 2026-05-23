import { useQuery } from '@tanstack/react-query'
import { TrendingUp, CheckCircle } from 'lucide-react'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ProgressBar from '../../components/common/ProgressBar'
import { progressAPI } from '../../api/endpoints'

export default function StudentProgress() {
  const { data: progressList = [], isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressAPI.list().then((r) => r.data.data),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-green-100 mt-1 text-lg">Track your learning journey across all courses</p>
        </div>

        {progressList.length === 0 ? (
          <div className="card text-center py-16">
            <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mt-2">No progress data yet.</p>
            <p className="text-gray-500 text-sm mt-1">Enroll in a course to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {progressList.map((progress) => (
              <div key={progress.id} className="card border border-gray-800 hover:border-green-500/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{progress.course_detail?.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {progress.course_detail?.faculty_detail?.first_name}{' '}
                      {progress.course_detail?.faculty_detail?.last_name}
                    </p>
                  </div>
                  {progress.progress_percent >= 100 && (
                    <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>

                <ProgressBar percent={progress.progress_percent} size="lg" />

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-2xl font-bold text-green-400">
                      {progress.completed_sessions?.length || 0}
                      <span className="text-sm text-gray-400 font-normal">/{progress.total_sessions}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Sessions Attended</p>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-2xl font-bold text-blue-400">
                      {progress.completed_assignments?.length || 0}
                      <span className="text-sm text-gray-400 font-normal">/{progress.total_assignments}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Assignments Done</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
