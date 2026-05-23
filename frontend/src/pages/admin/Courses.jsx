import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { BookOpen, Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { coursesAPI, authAPI } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/helpers'
import clsx from 'clsx'

export default function AdminCourses() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => coursesAPI.list().then((r) => r.data.data),
    staleTime: 0, // always fetch fresh for admin
  })
  const { data: facultyList = [] } = useQuery({
    queryKey: ['faculty-list'],
    queryFn: () => authAPI.listUsers({ role: 'faculty' }).then((r) => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const saveMutation = useMutation({
    mutationFn: (data) => editingCourse
      ? coursesAPI.update(editingCourse.id, data)
      : coursesAPI.create(data),
    onSuccess: () => {
      toast.success(editingCourse ? 'Course updated!' : 'Course created!')
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      closeModal()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => coursesAPI.delete(id),
    onSuccess: () => {
      toast.success('Course deleted.')
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const openCreate = () => {
    setEditingCourse(null)
    reset({ title: '', description: '', faculty: '', is_active: true })
    setShowModal(true)
  }
  const openEdit = (course) => {
    setEditingCourse(course)
    reset({ title: course.title, description: course.description, faculty: course.faculty || '', is_active: course.is_active })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditingCourse(null); reset() }
  const onSubmit = (data) => saveMutation.mutate({ ...data, faculty: data.faculty ? parseInt(data.faculty) : null })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Management</h1>
            <p className="text-green-100 mt-1 text-lg">{courses.length} courses</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No courses yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="card hover:shadow-lg transition-all border border-gray-800 hover:border-green-500/50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white flex-1 pr-2 text-lg">{course.title}</h3>
                  <span className={clsx('badge flex-shrink-0', {
                    'bg-green-500/20 text-green-400 border border-green-500/30': course.is_active,
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30': !course.is_active,
                  })}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{course.description}</p>
                <div className="mt-3 text-xs text-gray-400 font-medium space-y-1">
                  <p className="text-green-400">Faculty: {course.faculty_detail
                    ? `${course.faculty_detail.first_name} ${course.faculty_detail.last_name}`
                    : 'Not assigned'}</p>
                  <p className="text-gray-400">{course.enrollment_count} students enrolled</p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
                  <button onClick={() => openEdit(course)}
                    className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(course.id) }}
                    className="btn-danger flex items-center justify-center gap-1 text-sm px-3">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-800">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-green-500/20 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Title *</label>
                <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="Course title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Description *</label>
                <textarea {...register('description', { required: 'Description is required' })}
                  rows={3} className="input-field resize-none" placeholder="Course description" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Assign Faculty</label>
                <select {...register('faculty')} className="input-field">
                  <option value="">No faculty assigned</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.first_name} {f.last_name} ({f.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input {...register('is_active')} type="checkbox" id="is_active"
                  className="w-4 h-4 text-green-600 rounded border-gray-700 bg-dark-200" />
                <label htmlFor="is_active" className="text-sm font-medium text-white">
                  Active (visible to students)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1">
                  {saveMutation.isPending ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
