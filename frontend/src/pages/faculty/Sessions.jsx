import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Video, Clock, Timer, ExternalLink, Plus, Trash2, Users, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { sessionsAPI } from '../../api/endpoints'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'
import clsx from 'clsx'

// ── Session status ────────────────────────────────────────────────────────────
function getSessionStatus(session) {
  const now   = new Date()
  const start = new Date(session.scheduled_at)
  const end   = new Date(start.getTime() + session.duration_minutes * 60 * 1000)

  if (now < start) {
    const minsUntil = Math.floor((start - now) / 60000)
    return { status: 'upcoming', minsUntil, end }
  }
  if (now >= start && now <= end) {
    const minsLeft = Math.floor((end - now) / 60000)
    return { status: 'live', minsLeft, end }
  }
  return { status: 'ended', end }
}

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function FacultySessions() {
  useNow() // triggers re-render every 30s

  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['faculty-sessions'],
    queryFn: () => sessionsAPI.list().then((r) => r.data.data),
    refetchInterval: 60000,
    staleTime: 0,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionsAPI.delete(id),
    onSuccess: () => {
      toast.success('Session deleted.')
      queryClient.invalidateQueries({ queryKey: ['faculty-sessions'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  const live     = sessions.filter(s => getSessionStatus(s).status === 'live')
  const upcoming = sessions.filter(s => getSessionStatus(s).status === 'upcoming')
  const ended    = sessions.filter(s => getSessionStatus(s).status === 'ended')

  return (
    <Layout>
      <div className="space-y-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <p className="text-green-100 mt-1 text-lg">
              {live.length > 0 && `${live.length} live · `}
              {upcoming.length} upcoming · {ended.length} past
            </p>
          </div>
          <Link to="/faculty/sessions/create" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Session
          </Link>
        </div>

        {/* LIVE NOW */}
        {live.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {live.map(s => (
                <FacultySessionCard key={s.id} session={s}
                  onDelete={() => { if (confirm('Delete this session?')) deleteMutation.mutate(s.id) }} />
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Scheduled Sessions
          </h2>
          {upcoming.length === 0 ? (
            <div className="card text-center py-12 border border-gray-800">
              <Video className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-white font-semibold">No upcoming sessions</p>
              <p className="text-gray-400 text-sm mt-1">Create a new session to get started.</p>
              <Link to="/faculty/sessions/create" className="btn-primary inline-flex items-center gap-2 mt-4 px-6">
                <Plus className="w-4 h-4" /> Create Session
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map(s => (
                <FacultySessionCard key={s.id} session={s}
                  onDelete={() => { if (confirm('Delete this session?')) deleteMutation.mutate(s.id) }} />
              ))}
            </div>
          )}
        </section>

        {/* PAST */}
        {ended.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-500" />
              Past Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ended.map(s => (
                <FacultySessionCard key={s.id} session={s}
                  onDelete={() => { if (confirm('Delete this session?')) deleteMutation.mutate(s.id) }} />
              ))}
            </div>
          </section>
        )}

      </div>
    </Layout>
  )
}

function FacultySessionCard({ session, onDelete }) {
  const { status, minsUntil, minsLeft, end } = getSessionStatus(session)
  const isLive     = status === 'live'
  const isUpcoming = status === 'upcoming'
  const isEnded    = status === 'ended'

  return (
    <div className={clsx(
      'card border transition-all',
      isLive    && 'border-red-500/50 shadow-lg shadow-red-500/10',
      isUpcoming && 'border-gray-800 hover:border-green-500/40',
      isEnded   && 'border-gray-800 opacity-70',
    )}>

      {/* Live badge */}
      {isLive && (
        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg w-fit"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-bold uppercase tracking-wide">
            Live · {minsLeft} min remaining
          </span>
        </div>
      )}

      {/* Starting soon badge */}
      {isUpcoming && minsUntil <= 15 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg w-fit"
          style={{ background: 'rgba(0,234,100,0.1)', border: '1px solid rgba(0,234,100,0.3)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-bold">Starting in {minsUntil} min</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={clsx('p-2 rounded-lg flex-shrink-0 border', {
          'bg-red-500/20 border-red-500/30':    isLive,
          'bg-green-500/20 border-green-500/30': isUpcoming,
          'bg-gray-700 border-gray-600':          isEnded,
        })}>
          <Video className={clsx('w-5 h-5', {
            'text-red-400':   isLive,
            'text-green-400': isUpcoming,
            'text-gray-400':  isEnded,
          })} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{session.title}</h3>
          <p className="text-sm text-green-400 font-medium">{session.course_detail?.title}</p>
          {session.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{session.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(session.scheduled_at)}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {session.duration_minutes} min
            </span>
            {isLive && (
              <span className="text-red-400 font-medium">
                Ends {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {isEnded && (
              <span className="text-gray-500">
                Ended {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meet link + actions */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">

        {/* Join button — only during live window */}
        {isLive && session.meet_link && (
          <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: '#ef4444', color: '#fff', boxShadow: '0 0 16px rgba(239,68,68,0.4)' }}>
            <ExternalLink className="w-4 h-4" />
            Start Meeting
          </a>
        )}

        {/* Upcoming — show meet link info */}
        {isUpcoming && (
          <div className="flex-1 flex items-center gap-2 text-xs text-gray-400">
            {session.meet_link ? (
              <>
                <span className="text-green-400">✓ Meet link ready</span>
                <span className="text-gray-600">·</span>
                <span>Available at session start</span>
              </>
            ) : (
              <span className="text-yellow-400">⚠ Meet link pending</span>
            )}
          </div>
        )}

        {/* Ended */}
        {isEnded && (
          <div className="flex-1 flex items-center gap-1 text-xs text-gray-500">
            <Lock className="w-3 h-3" /> Session ended
          </div>
        )}

        {/* Delete button */}
        <button onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
          title="Delete session">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
