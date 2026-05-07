export default function TaskFilterBar({ filters, onChange, members }) {
  const set = (key, val) => onChange({ ...filters, [key]: val })

  return (
    <div className="flex items-center gap-3 flex-wrap mb-5">
      {/* Status */}
      <select
        value={filters.status || ''}
        onChange={(e) => set('status', e.target.value)}
        className="input w-auto text-xs py-1.5"
      >
        <option value="">All Status</option>
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN PROGRESS</option>
        <option value="DONE">DONE</option>
        <option value="OVERDUE">OVERDUE</option>
      </select>

      {/* Priority */}
      <select
        value={filters.priority || ''}
        onChange={(e) => set('priority', e.target.value)}
        className="input w-auto text-xs py-1.5"
      >
        <option value="">All Priority</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      {/* Assignee */}
      <select
        value={filters.assigneeId || ''}
        onChange={(e) => set('assigneeId', e.target.value)}
        className="input w-auto text-xs py-1.5"
      >
        <option value="">All Members</option>
        {members?.map((m) => (
          <option key={m.userId} value={m.userId}>{m.user?.name}</option>
        ))}
      </select>

      {/* Overdue toggle */}
      <button
        onClick={() => set('overdue', !filters.overdue)}
        className={`badge border text-xs cursor-pointer transition-all ${
          filters.overdue
            ? 'bg-rose-400/20 text-rose-400 border-rose-400/40'
            : 'bg-slate-400/10 text-slate-500 border-slate-600/40 hover:text-rose-400'
        }`}
      >
        ⚠ OVERDUE ONLY
      </button>

      {/* Clear */}
      {(filters.status || filters.priority || filters.assigneeId || filters.overdue) && (
        <button
          onClick={() => onChange({})}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          CLEAR ×
        </button>
      )}
    </div>
  )
}
