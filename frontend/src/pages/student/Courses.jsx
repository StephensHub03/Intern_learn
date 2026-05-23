import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Users, CheckCircle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { coursesAPI } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/helpers'

export default function StudentCourses() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  // Read filter from URL — default to 'enrolled' if ?filter=enrolled
  const initialTab = searchParams.get('filter') === 'enrolled' ? 'enrolled' : 'all'
  const [activeTab, setActiveTab] = useState(initialTab)

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.list().then((r) => r.data.data),
    staleTime: 0,
  })

  const enrollMutation = useMutation({
    mutationFn: (courseId) => coursesAPI.enroll(courseId),
    onSuccess: () => {
      toast.success('Enrolled successfully!')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  const enrolledCourses = courses.filter((c) => c.is_enrolled)
  const allCourses = courses

  const displayed = (activeTab === 'enrolled' ? enrolledCourses : allCourses)
    .filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()))

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'enrolled') {
      setSearchParams({ filter: 'enrolled' })
    } else {
      setSearchParams({})
    }
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-green-100 mt-1 text-lg">
            {enrolledCourses.length} enrolled · {allCourses.length} total available
          </p>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => handleTabChange('all')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === 'all' ? '#00ea64' : 'transparent',
                color: activeTab === 'all' ? '#000' : '#888',
              }}
            >
              All Courses ({allCourses.length})
            </button>
            <button
              onClick={() => handleTabChange('enrolled')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === 'enrolled' ? '#00ea64' : 'transparent',
                color: activeTab === 'enrolled' ? '#000' : '#888',
              }}
            >
              Enrolled ({enrolledCourses.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {/* Course Grid */}
        {displayed.length === 0 ? (
          <div className="card text-center py-16 border border-gray-800">
            <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">
              {activeTab === 'enrolled' ? 'No enrolled courses yet' : 'No courses found'}
            </p>
            <p className="text-gray-400 mt-1">
              {activeTab === 'enrolled'
                ? 'Switch to "All Courses" to browse and enroll.'
                : 'Try a different search term.'}
            </p>
            {activeTab === 'enrolled' && (
              <button
                onClick={() => handleTabChange('all')}
                className="btn-primary mt-4 px-6"
              >
                Browse All Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((course) => (
              <div key={course.id}
                className="card flex flex-col transition-all hover:shadow-lg"
                style={{
                  border: course.is_enrolled
                    ? '1px solid rgba(0,234,100,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: course.is_enrolled ? 'rgba(0,234,100,0.03)' : '#111111',
                }}>

                {/* Thumbnail */}
                <div className="h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                  style={{
                    background: course.is_enrolled
                      ? 'linear-gradient(135deg, rgba(0,234,100,0.2), rgba(0,234,100,0.1))'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    border: course.is_enrolled
                      ? '1px solid rgba(0,234,100,0.2)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <BookOpen className="w-12 h-12" style={{ color: course.is_enrolled ? '#00ea64' : '#374151' }} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-white text-base leading-tight">{course.title}</h3>
                    {course.is_enrolled && (
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(0,234,100,0.15)', color: '#00ea64', border: '1px solid rgba(0,234,100,0.3)' }}>
                        Enrolled
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-green-400">
                      <Users className="w-3 h-3" />{course.enrollment_count} enrolled
                    </span>
                    {course.faculty_detail && (
                      <span className="text-gray-400">
                        by {course.faculty_detail.first_name} {course.faculty_detail.last_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {course.is_enrolled ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" /> You are enrolled in this course
                    </div>
                  ) : (
                    <button
                      onClick={() => enrollMutation.mutate(course.id)}
                      disabled={enrollMutation.isPending}
                      className="btn-primary w-full"
                    >
                      {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
