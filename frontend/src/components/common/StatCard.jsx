import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function StatCard({ title, value, icon: Icon, color = 'teal', subtitle, to }) {
  const colors = {
    teal:   'bg-green-500/20 text-green-400 border border-green-500/30',
    gold:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    green:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    red:    'bg-red-500/20 text-red-400 border border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    blue:   'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  }

  const content = (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-green-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={clsx('p-3 rounded-xl', colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="card hover:shadow-lg hover:border-green-500/50 transition-all block cursor-pointer"
        style={{ textDecoration: 'none' }}
      >
        {content}
        <p className="text-xs text-green-500/60 mt-3 font-medium">Click to view →</p>
      </Link>
    )
  }

  return (
    <div className="card hover:shadow-lg hover:border-green-500/30 transition-all">
      {content}
    </div>
  )
}
