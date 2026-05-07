import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatRelative(date) {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export const STATUS_CONFIG = {
  TODO: { label: 'TODO', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30', dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'IN PROG', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', dot: 'bg-cyan-400' },
  DONE: { label: 'DONE', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', dot: 'bg-emerald-400' },
  OVERDUE: { label: 'OVERDUE', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30', dot: 'bg-rose-400' },
}

export const PRIORITY_CONFIG = {
  LOW: { label: 'LOW', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' },
  MEDIUM: { label: 'MED', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  HIGH: { label: 'HIGH', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
}

export function getErrorMessage(error) {
  return error?.response?.data?.error || error?.message || 'Something went wrong'
}
