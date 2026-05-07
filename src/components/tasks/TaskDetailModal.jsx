import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { taskApi } from '../../api/client'
import { Modal, StatusBadge, PriorityBadge, Spinner } from '../ui'
import { formatDate, formatRelative, getErrorMessage } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE']

export default function TaskDetailModal({ task, projectId, projectRole, members, onClose }) {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isAdmin = projectRole === 'ADMIN'
  const isAssignee = task.assigneeId === user?.id
  const canEditStatus = isAdmin || isAssignee

  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    assigneeId: task.assigneeId || '',
    dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
  })
  const [comment, setComment] = useState('')

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => taskApi.getComments(projectId, task.id).then((r) => r.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => taskApi.update(projectId, task.id, data),
    onSuccess: () => {
      qc.invalidateQueries(['tasks', projectId])
      qc.invalidateQueries(['dashboard'])
      toast.success('Task updated')
      setEditing(false)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const commentMutation = useMutation({
    mutationFn: (content) => taskApi.addComment(projectId, task.id, { content }),
    onSuccess: () => {
      qc.invalidateQueries(['comments', task.id])
      qc.invalidateQueries(['tasks', projectId])
      setComment('')
      toast.success('Comment added')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleStatusChange = (status) => {
    updateMutation.mutate({ status })
  }

  const handleSave = () => {
    const data = { ...editData }
    if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString()
    else data.dueDate = null
    if (!data.assigneeId) data.assigneeId = null
    updateMutation.mutate(data)
  }

  return (
    <Modal title={editing ? 'Edit Task' : 'Task Detail'} onClose={onClose}>
      <div className="space-y-5">
        {/* Title & edit toggle */}
        {editing && isAdmin ? (
          <div>
            <label className="label">Title</label>
            <input value={editData.title} onChange={(e) => setEditData(p => ({ ...p, title: e.target.value }))} className="input" />
          </div>
        ) : (
          <h3 className="text-base font-body text-slate-100 leading-snug">{task.title}</h3>
        )}

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className="text-xs font-mono text-slate-500">{formatDate(task.dueDate)}</span>
          )}
        </div>

        {/* Status quick-update */}
        {canEditStatus && !editing && (
          <div>
            <label className="label">Update Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={task.status === s || updateMutation.isPending}
                  className={`badge border text-xs cursor-pointer transition-all ${
                    task.status === s
                      ? 'opacity-50 cursor-not-allowed border-slate-600/30 bg-slate-400/10 text-slate-500'
                      : 'hover:opacity-80 border-slate-500/40 bg-slate-400/10 text-slate-400'
                  }`}
                >
                  {s === 'IN_PROGRESS' ? 'IN PROG' : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Edit fields (admin only) */}
        {editing && isAdmin && (
          <>
            <div>
              <label className="label">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(p => ({ ...p, description: e.target.value }))}
                className="input resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Priority</label>
                <select value={editData.priority} onChange={(e) => setEditData(p => ({ ...p, priority: e.target.value }))} className="input">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select value={editData.status} onChange={(e) => setEditData(p => ({ ...p, status: e.target.value }))} className="input">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="datetime-local" value={editData.dueDate} onChange={(e) => setEditData(p => ({ ...p, dueDate: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Assignee</label>
                <select value={editData.assigneeId} onChange={(e) => setEditData(p => ({ ...p, assigneeId: e.target.value }))} className="input">
                  <option value="">Unassigned</option>
                  {members?.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Description (view) */}
        {!editing && task.description && (
          <div>
            <label className="label">Description</label>
            <p className="text-sm text-slate-400 font-body whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Meta */}
        {!editing && (
          <div className="flex gap-4 py-3 border-t border-slate-700/50 text-xs font-mono text-slate-500">
            <span>Created by <span className="text-slate-400">{task.createdBy?.name}</span></span>
            {task.assignee && <span>Assigned to <span className="text-slate-400">{task.assignee.name}</span></span>}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs">EDIT TASK</button>
          )}
          {editing && (
            <>
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1 text-xs">CANCEL</button>
              <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary flex-1 text-xs flex items-center justify-center gap-1">
                {updateMutation.isPending ? <><Spinner className="w-3 h-3" /> SAVING...</> : 'SAVE CHANGES'}
              </button>
            </>
          )}
        </div>

        {/* Comments */}
        <div className="border-t border-slate-700/50 pt-4">
          <label className="label mb-3">Comments ({comments.length})</label>

          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {loadingComments ? (
              <div className="skeleton h-16 rounded" />
            ) : comments.length > 0 ? comments.map((c) => (
              <div key={c.id} className="bg-slate-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-cyan-400">{c.author?.name}</span>
                  <span className="text-xs text-slate-600 font-mono">{formatRelative(c.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-300 font-body">{c.content}</p>
              </div>
            )) : (
              <p className="text-xs text-slate-600 font-mono">No comments yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input text-xs flex-1"
              placeholder="Add a comment..."
              onKeyDown={(e) => e.key === 'Enter' && comment.trim() && commentMutation.mutate(comment.trim())}
            />
            <button
              onClick={() => comment.trim() && commentMutation.mutate(comment.trim())}
              disabled={!comment.trim() || commentMutation.isPending}
              className="btn-primary text-xs px-3"
            >
              {commentMutation.isPending ? <Spinner className="w-3 h-3" /> : '→'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
