import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import { assignmentsAPI, coursesAPI } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/helpers'

const DEFAULT_QUESTION = {
  question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
  correct_option: 'a', marks: 1,
}

export default function FacultyAssignmentCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['faculty-courses'],
    queryFn: () => coursesAPI.list().then((r) => r.data.data),
  })

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { questions: [{ ...DEFAULT_QUESTION }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  const createMutation = useMutation({
    mutationFn: (data) => assignmentsAPI.create(data),
    onSuccess: () => {
      toast.success('Assignment created successfully!')
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      navigate('/faculty/dashboard')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const onSubmit = (data) => createMutation.mutate({
    ...data,
    course: parseInt(data.course),
    questions: data.questions.map((q) => ({ ...q, marks: parseInt(q.marks) })),
  })

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Assignment details */}
          <div className="card border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                <ClipboardList className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Create Assignment</h1>
                <p className="text-sm text-gray-400">Add MCQ questions for students</p>
              </div>
            </div>

            <div className="space-y-4">
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
                <label className="block text-sm font-semibold text-green-400 mb-1">Title *</label>
                <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="e.g., Week 1 Quiz" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Description</label>
                <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Instructions for students..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-1">Due Date *</label>
                <input {...register('due_date', { required: 'Due date is required' })} type="datetime-local" className="input-field" />
                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date.message}</p>}
              </div>
            </div>
          </div>

          {/* Questions */}
          {fields.map((field, index) => (
            <div key={field.id} className="card border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">Question {index + 1}</h3>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-300 p-1 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-green-400 mb-1">Question Text *</label>
                  <textarea {...register(`questions.${index}.question_text`, { required: 'Required' })}
                    rows={2} className="input-field resize-none text-sm" placeholder="Enter your question..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt}>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Option {opt} *</label>
                      <input {...register(`questions.${index}.option_${opt}`, { required: 'Required' })}
                        className="input-field text-sm" placeholder={`Option ${opt.toUpperCase()}`} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-green-400 mb-1">Correct Answer *</label>
                    <select {...register(`questions.${index}.correct_option`)} className="input-field text-sm">
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-green-400 mb-1">Marks *</label>
                    <input {...register(`questions.${index}.marks`, { required: 'Required', min: { value: 1, message: 'Min 1' } })}
                      type="number" className="input-field text-sm" defaultValue={1} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={() => append({ ...DEFAULT_QUESTION })}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </button>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? 'Creating...' : `Create Assignment (${fields.length} questions)`}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
