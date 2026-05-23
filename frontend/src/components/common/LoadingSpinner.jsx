import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx(
        'animate-spin rounded-full border-2 border-gray-700 border-t-green-500',
        sizes[size]
      )} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-500">
      <LoadingSpinner size="lg" />
    </div>
  )
}
