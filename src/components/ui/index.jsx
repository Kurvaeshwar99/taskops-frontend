import { cn } from '../../lib/utils'

export function Spinner({ className }) {
  return (
    <svg className={cn('animate-spin', className || 'w-4 h-4')} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-12 rounded" />
      </div>
    </div>
  )
}

export function StatCard({ label, value, sub, accent }) {
  const accentMap = {
    cyan: 'border-cyan-400/40 shadow-glow-cyan',
    amber: 'border-amber-400/40 shadow-glow-amber',
    emerald: 'border-emerald-400/40',
    rose: 'border-rose-400/40',
  }
  const textMap = {
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
  }

  return (
    <div className={cn('card p-5 border animate-fade-in', accentMap[accent] || 'border-slate-700/50')}>
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={cn('text-3xl font-display font-700 tabular-nums', textMap[accent] || 'text-slate-100')}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-500">
        {icon}
      </div>
      <h3 className="font-display text-slate-200 font-600 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 font-body mb-5 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-white font-700">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    TODO: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
    IN_PROGRESS: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
    DONE: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
    OVERDUE: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
  }
  const labels = { TODO: 'TODO', IN_PROGRESS: 'IN PROG', DONE: 'DONE', OVERDUE: 'OVERDUE' }
  return (
    <span className={cn('badge border', map[status] || 'bg-slate-400/10 text-slate-400 border-slate-400/30')}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const map = {
    LOW: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
    MEDIUM: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
    HIGH: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
  }
  const labels = { LOW: 'LOW', MEDIUM: 'MED', HIGH: 'HIGH' }
  return (
    <span className={cn('badge border', map[priority] || '')}>
      {labels[priority] || priority}
    </span>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl font-800 text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 font-mono mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
