import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectApi, taskApi } from '../api/client'
import { PageHeader, SkeletonCard, EmptyState, Spinner } from '../components/ui'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskFilterBar from '../components/tasks/TaskFilterBar'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import MembersTab from '../components/projects/MembersTab'
import { getErrorMessage } from '../lib/utils'

const TABS = ['TASKS', 'MEMBERS']

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('TASKS')
  const [filters, setFilters] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [view, setView] = useState('kanban') // 'kanban' | 'list'
  const [selectedTask, setSelectedTask] = useState(null)

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.get(id).then((r) => r.data.data),
  })

  const queryParams = {}
  if (filters.status) queryParams.status = filters.status
  if (filters.priority) queryParams.priority = filters.priority
  if (filters.assigneeId) queryParams.assigneeId = filters.assigneeId
  if (filters.overdue) queryParams.overdue = 'true'

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', id, queryParams],
    queryFn: () => taskApi.list(id, queryParams).then((r) => r.data.data),
    enabled: !!project,
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectApi.delete(id),
    onSuccess: () => {
      toast.success('Project deleted')
      navigate('/projects')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const projectRole = project?.myRole
  const isAdmin = projectRole === 'ADMIN'

  if (loadingProject) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded mb-8" />
        <div className="grid grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">Project not found</div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors mb-3 inline-flex items-center gap-1">
          ← PROJECTS
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-800 text-white tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-500 font-body mt-1 max-w-xl">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge border text-xs ${isAdmin ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-slate-400/10 text-slate-400 border-slate-400/30'}`}>
                {projectRole}
              </span>
              <span className="text-xs font-mono text-slate-600">{project.members?.length} members</span>
              <span className="text-xs font-mono text-slate-600">{tasks.length} tasks</span>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm('Delete this project? This cannot be undone.')) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
              className="btn-danger flex items-center gap-2 text-xs"
            >
              {deleteMutation.isPending ? <Spinner className="w-3 h-3" /> : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              DELETE
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-700/50 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono transition-all duration-150 border-b-2 -mb-px ${
              tab === t
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {tab === 'TASKS' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <TaskFilterBar
              filters={filters}
              onChange={setFilters}
              members={project.members}
            />

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {/* View toggle */}
              <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700/50">
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${view === 'kanban' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  KANBAN
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${view === 'list' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  LIST
                </button>
              </div>

              {isAdmin && (
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  NEW TASK
                </button>
              )}
            </div>
          </div>

          {loadingTasks ? (
            <div className="grid grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="No tasks yet"
              description={isAdmin ? "Create the first task for this project." : "No tasks match your filters."}
              action={isAdmin && <button onClick={() => setShowCreate(true)} className="btn-primary">CREATE TASK →</button>}
            />
          ) : view === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              projectId={id}
              projectRole={projectRole}
              members={project.members}
            />
          ) : (
            // List view
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="card-hover p-4 flex items-center gap-4 cursor-pointer group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'DONE' ? 'bg-emerald-400' :
                    task.status === 'IN_PROGRESS' ? 'bg-cyan-400' :
                    task.status === 'OVERDUE' ? 'bg-rose-400' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-slate-200 group-hover:text-white transition-colors truncate">{task.title}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`badge border text-xs ${task.priority === 'HIGH' ? 'bg-rose-400/10 text-rose-400 border-rose-400/30' : task.priority === 'MEDIUM' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-slate-400/10 text-slate-400 border-slate-400/30'}`}>
                      {task.priority === 'MEDIUM' ? 'MED' : task.priority}
                    </span>
                    {task.assignee && (
                      <span className="text-xs font-mono text-slate-500">{task.assignee.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'MEMBERS' && (
        <MembersTab project={project} projectRole={projectRole} />
      )}

      {showCreate && (
        <CreateTaskModal
          projectId={id}
          members={project.members}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={id}
          projectRole={projectRole}
          members={project.members}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
