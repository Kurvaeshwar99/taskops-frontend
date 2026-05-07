import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskApi } from '../../api/client'
import TaskCard from './TaskCard'
import TaskDetailModal from './TaskDetailModal'
import CreateTaskModal from './CreateTaskModal'
import { getErrorMessage } from '../../lib/utils'
import { PriorityBadge } from '../ui'

const COLUMNS = [
  { id: 'TODO', label: 'TODO', color: 'border-slate-500/40' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS', color: 'border-cyan-400/40' },
  { id: 'DONE', label: 'DONE', color: 'border-emerald-400/40' },
]

function Column({ id, label, color, tasks, onTaskClick, projectRole, members, onCreateTask }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={`flex-1 min-w-[280px] max-w-sm`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{label}</span>
          <span className="badge bg-slate-800 text-slate-500 border border-slate-700/50 text-xs">{tasks.length}</span>
        </div>
        {projectRole === 'ADMIN' && (
          <button
            onClick={onCreateTask}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2.5 min-h-[200px] rounded-xl p-2 transition-colors duration-150 ${isOver ? 'bg-slate-800/40 ring-1 ring-cyan-400/20' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectRole={projectRole}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg">
            <p className="text-xs text-slate-700 font-mono">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, projectId, projectRole, members }) {
  const qc = useQueryClient()
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const updateMutation = useMutation({
    mutationFn: ({ taskId, status }) => taskApi.update(projectId, taskId, { status }),
    onSuccess: () => {
      qc.invalidateQueries(['tasks', projectId])
      qc.invalidateQueries(['dashboard'])
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  }

  const overdueCount = tasks.filter((t) => t.status === 'OVERDUE').length

  const findTaskStatus = (taskId) => {
    for (const [status, list] of Object.entries(tasksByStatus)) {
      if (list.find((t) => t.id === taskId)) return status
    }
    return null
  }

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id))
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const fromStatus = findTaskStatus(active.id)
    const toStatus = COLUMNS.find((c) => c.id === over.id)?.id

    if (toStatus && fromStatus !== toStatus) {
      updateMutation.mutate({ taskId: active.id, status: toStatus })
    }
  }

  return (
    <div>
      {/* Overdue banner */}
      {overdueCount > 0 && (
        <div className="mb-4 px-4 py-2.5 bg-rose-400/5 border border-rose-400/20 rounded-lg flex items-center gap-2">
          <span className="text-rose-400 text-xs">⚠</span>
          <span className="text-xs font-mono text-rose-400">
            {overdueCount} overdue task{overdueCount > 1 ? 's' : ''} — check filters to view
          </span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              {...col}
              tasks={tasksByStatus[col.id] || []}
              onTaskClick={setSelectedTask}
              projectRole={projectRole}
              members={members}
              onCreateTask={() => setShowCreate(true)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="card p-3.5 shadow-xl opacity-90 rotate-1">
              <p className="text-sm text-slate-200">{activeTask.title}</p>
              <div className="mt-2">
                <PriorityBadge priority={activeTask.priority} />
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          projectRole={projectRole}
          members={members}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
