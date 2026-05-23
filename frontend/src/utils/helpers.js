/**
 * Utility helper functions.
 */
import { format, formatDistanceToNow, isPast } from 'date-fns'

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  // Converts UTC from server to user's local timezone automatically
  return format(new Date(dateStr), 'MMM dd, yyyy • h:mm a')
}

export const formatDateTimeWithZone = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return date.toLocaleString('en-IN', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatRelative = (dateStr) => {
  if (!dateStr) return 'N/A'
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export const isOverdue = (dateStr) => {
  if (!dateStr) return false
  return isPast(new Date(dateStr))
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    'An unexpected error occurred.'
  )
}
