import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskApi } from '../../api/client'
import { Modal, Spinner } from '../ui'
import { getErrorMessage } from '../../lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
})

export default function CreateTaskModal({ projectId, members, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data }
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString()
      else delete payload.dueDate
      if (!payload.assigneeId) delete payload.assigneeId
      return taskApi.create(projectId, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries(['tasks', projectId])
      qc.invalidateQueries(['dashboard'])
      toast.success('Task created')
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal title="Create Task" onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input {...register('title')} className="input" placeholder="What needs to be done?" autoFocus />
          {errors.title && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} className="input resize-none" rows={3} placeholder="Add more details..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select {...register('priority')} className="input">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
          <div>
            <label className="label">Assignee</label>
            <select {...register('assigneeId')} className="input">
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Due Date</label>
          <input type="datetime-local" {...register('dueDate')} className="input" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">CANCEL</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {mutation.isPending ? <><Spinner className="w-3 h-3" /> CREATING...</> : 'CREATE TASK →'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
