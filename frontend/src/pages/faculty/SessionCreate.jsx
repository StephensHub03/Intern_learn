import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Video, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import { sessionsAPI, coursesAPI } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/helpers'

export default function FacultySessionCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['faculty-courses'],
    queryFn: () => coursesAPI.list().then((r) => r.data.data),
  })

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { duration_minutes: 60 } })

  const createMutation = useMutation({
    mutationFn: (data) => sessionsAPI.create(data),
    onSuccess: () => {
      toast.success('Session created! Google Meet link generated.')
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      navigate('/faculty/dashboard')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const onSubmit = (data) => createMutation.mutate({
    ...data,
    course: parseInt(data.course),
    duration_minutes: parseInt(data.duration_minutes),
    // Convert local datetime to UTC ISO string for the backend
    scheduled_at: new Date(data.scheduled_at).toISOString(),
  })

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="card border border-gray-800">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <Video className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Live Session</h1>
              <p className="text-sm text-gray-400">A Google Meet link will be auto-generated</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Course *</label>
              <select
                {...register('course', { required: 'Please select a course' })}
                className="input-field"
                style={{ color: '#ffffff', background: '#1f1f1f' }}
              >
                <option value="" style={{ background: '#1f1f1f', color: '#888' }}>
                  {loadingCourses ? 'Loading courses...' : courses.length === 0 ? 'No courses assigned to you' : 'Select a course'}
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#1f1f1f', color: '#ffffff' }}>
                    {c.title}
                  </option>
                ))}
              </select>
              {courses.length === 0 && !loadingCourses && (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠ No courses are assigned to you. Ask an admin to assign courses.
                </p>
              )}
              {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Session Title *</label>
              <input {...register('title', { required: 'Title is required' })} className="input-field"
                placeholder="e.g., Introduction to React Hooks" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-400 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="input-field resize-none"
                placeholder="What will be covered in this session?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">
                  Date & Time * <span className="text-gray-500 font-normal text-xs">(your local time)</span>
                </label>
                <input {...register('scheduled_at', { required: 'Date and time is required' })}
                  type="datetime-local" className="input-field" />
                {errors.scheduled_at && <p className="text-red-500 text-xs mt-1">{errors.scheduled_at.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Duration (minutes) *</label>
                <input {...register('duration_minutes', { required: 'Required', min: { value: 15, message: 'Min 15 min' } })}
                  type="number" className="input-field" placeholder="60" />
                {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                {createMutation.isPending ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
