import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatusBadge, PriorityBadge } from '../ui'
import { formatDate, isOverdue } from '../../lib/utils'

export default function TaskCard({ task, onClick, projectRole }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="card p-3.5 cursor-pointer group hover:border-cyan-400/30 hover:shadow-glow-cyan transition-all duration-200"
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a1 1 0 100-2 1 1 0 000 2zM8 13a1 1 0 100-2 1 1 0 000 2zM8 20a1 1 0 100-2 1 1 0 000 2zM16 6a1 1 0 100-2 1 1 0 000 2zM16 13a1 1 0 100-2 1 1 0 000 2zM16 20a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      </div>

      <div className="relative pr-5" onClick={onClick}>
        <p className="text-sm text-slate-200 font-body group-hover:text-white transition-colors mb-2 line-clamp-2">
          {task.title}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          <PriorityBadge priority={task.priority} />
          {task._count?.comments > 0 && (
            <span className="badge bg-slate-700/50 text-slate-500 text-xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {task._count.comments}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-xs text-slate-950 font-mono font-bold">{task.assignee.name?.charAt(0)}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono truncate max-w-[80px]">{task.assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-600 font-mono">Unassigned</span>
          )}

          {task.dueDate && (
            <span className={`text-xs font-mono ${overdue ? 'text-rose-400' : 'text-slate-500'}`}>
              {overdue && '⚠ '}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
