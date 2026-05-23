import clsx from 'clsx'

export default function ProgressBar({ percent, showLabel = true, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, percent || 0))
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  const color =
    clamped === 100 ? 'bg-green-500' :
    clamped >= 60   ? 'bg-green-400' :
    clamped >= 30   ? 'bg-yellow-400' : 'bg-orange-400'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-green-400">{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-gray-800 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx('rounded-full transition-all duration-500', color, heights[size])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
