import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Video, Clock, ExternalLink, CheckCircle, Lock, Timer } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { sessionsAPI, progressAPI } from '../../api/endpoints'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'
import clsx from 'clsx'

// ── Session status logic ──────────────────────────────────────────────────────
function getSessionStatus(session) {
  const now = new Date()
  const start = new Date(session.scheduled_at)
  const end = new Date(start.getTime() + session.duration_minutes * 60 * 1000)

  if (now < start) {
    // Not started yet — show countdown if within 15 min
    const minsUntil = Math.floor((start - now) / 60000)
    return { status: 'upcoming', minsUntil }
  }
  if (now >= start && now <= end) {
    // Currently live
    const minsLeft = Math.floor((end - now) / 60000)
    return { status: 'live', minsLeft }
  }
  // Ended
  return { status: 'ended' }
}

// ── Live countdown hook ───────────────────────────────────────────────────────
function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000) // update every 30s
    return () => clearInterval(t)
  }, [])
  return now
}

export default function StudentSessions() {
  const queryClient = useQueryClient()
  const now = useNow()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsAPI.list().then((r) => r.data.data),
    refetchInterval: 60000, // refetch every minute
  })

  const markCompleteMutation = useMutation({
    mutationFn: (sessionId) => progressAPI.markSessionComplete(sessionId),
    onSuccess: () => {
      toast.success('Session marked as completed!')
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  // Split by status
  const liveSessions     = sessions.filter(s => getSessionStatus(s).status === 'live')
  const upcomingSessions = sessions.filter(s => getSessionStatus(s).status === 'upcoming')
  const endedSessions    = sessions.filter(s => getSessionStatus(s).status === 'ended')

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Live Sessions</h1>
          <p className="text-green-100 mt-1 text-lg">Join live sessions for your enrolled courses</p>
        </div>

        {/* LIVE NOW */}
        {liveSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessions.map(s => (
                <SessionCard key={s.id} session={s}
                  onMarkComplete={() => markCompleteMutation.mutate(s.id)}
                  isMarkingComplete={markCompleteMutation.isPending} />
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <div className="card text-center py-10 border border-gray-800">
              <Video className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No upcoming sessions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map(s => (
                <SessionCard key={s.id} session={s}
                  onMarkComplete={() => markCompleteMutation.mutate(s.id)}
                  isMarkingComplete={markCompleteMutation.isPending} />
              ))}
            </div>
          )}
        </section>

        {/* ENDED */}
        {endedSessions.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Past Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endedSessions.map(s => (
                <SessionCard key={s.id} session={s}
                  onMarkComplete={() => markCompleteMutation.mutate(s.id)}
                  isMarkingComplete={markCompleteMutation.isPending} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}

function SessionCard({ session, onMarkComplete, isMarkingComplete }) {
  const { status, minsUntil, minsLeft } = getSessionStatus(session)
  const isLive     = status === 'live'
  const isUpcoming = status === 'upcoming'
  const isEnded    = status === 'ended'

  const endTime = new Date(
    new Date(session.scheduled_at).getTime() + session.duration_minutes * 60 * 1000
  )

  return (
    <div className={clsx(
      'card border transition-all',
      isLive    && 'border-red-500/50 shadow-lg shadow-red-500/10',
      isUpcoming && 'border-gray-800 hover:border-green-500/50',
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

      <div className="flex items-start gap-3">
        <div className={clsx('p-2 rounded-lg flex-shrink-0 border', {
          'bg-red-500/20 border-red-500/30':   isLive,
          'bg-green-500/20 border-green-500/30': isUpcoming,
          'bg-gray-700 border-gray-600':         isEnded,
        })}>
          <Video className={clsx('w-5 h-5', {
            'text-red-400':   isLive,
            'text-green-400': isUpcoming,
            'text-gray-400':  isEnded,
          })} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">{session.title}</h3>
          <p className="text-sm text-green-400 font-medium">{session.course_detail?.title}</p>
          {session.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{session.description}</p>
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
                Ends at {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {isEnded && (
              <span className="text-gray-500">
                Ended at {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action area */}
      <div className="mt-4 pt-4 border-t border-gray-800">

        {/* LIVE — show Join button */}
        {isLive && session.meet_link && (
          <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: '#ef4444', color: '#fff', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>
            <ExternalLink className="w-4 h-4" />
            Join Live Session
          </a>
        )}

        {/* UPCOMING — show countdown or "starts soon" */}
        {isUpcoming && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Lock className="w-4 h-4 text-gray-500" />
              {minsUntil <= 15
                ? <span className="text-green-400 font-semibold">Starting in {minsUntil} min</span>
                : <span>Join link available at session start</span>
              }
            </div>
            {minsUntil <= 15 && session.meet_link && (
              <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
                className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-500/30 transition-all">
                Join Early
              </a>
            )}
          </div>
        )}

        {/* ENDED — show mark attended */}
        {isEnded && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Session ended — link no longer active
            </span>
            <button onClick={onMarkComplete} disabled={isMarkingComplete}
              className="text-xs bg-gray-700 text-gray-300 border border-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Mark Attended
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
