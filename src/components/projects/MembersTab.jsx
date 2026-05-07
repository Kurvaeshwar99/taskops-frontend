import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { projectApi } from '../../api/client'
import { Modal, Spinner } from '../ui'
import { getErrorMessage, formatDate } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'MEMBER']),
})

function AddMemberModal({ projectId, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MEMBER' },
  })

  const mutation = useMutation({
    mutationFn: (data) => projectApi.addMember(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries(['project', projectId])
      toast.success('Member added')
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal title="Add Member" onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input {...register('email')} type="email" className="input" placeholder="team@example.com" autoFocus />
          {errors.email && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Role</label>
          <select {...register('role')} className="input">
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">CANCEL</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {mutation.isPending ? <><Spinner className="w-3 h-3" /> ADDING...</> : 'ADD MEMBER →'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function MembersTab({ project, projectRole }) {
  const qc = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = projectRole === 'ADMIN'
  const [showAdd, setShowAdd] = useState(false)
  const [removing, setRemoving] = useState(null)

  const removeMutation = useMutation({
    mutationFn: (userId) => projectApi.removeMember(project.id, userId),
    onSuccess: () => {
      qc.invalidateQueries(['project', project.id])
      toast.success('Member removed')
      setRemoving(null)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500 font-mono">{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</p>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ADD MEMBER
          </button>
        )}
      </div>

      <div className="space-y-2">
        {project.members?.map((member) => {
          const isOwner = member.userId === project.ownerId
          const isCurrentUser = member.userId === currentUser?.id

          return (
            <div key={member.id} className="card flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-slate-700 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-mono font-bold text-cyan-400">
                  {member.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-body text-slate-200">{member.user?.name}</p>
                  {isCurrentUser && <span className="text-xs font-mono text-slate-600">(you)</span>}
                  {isOwner && <span className="text-xs font-mono text-amber-400/70">owner</span>}
                </div>
                <p className="text-xs text-slate-500 font-mono">{member.user?.email}</p>
              </div>

              <span className={`badge border text-xs ${member.role === 'ADMIN' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-slate-400/10 text-slate-400 border-slate-400/30'}`}>
                {member.role}
              </span>

              {isAdmin && !isOwner && !isCurrentUser && (
                removing === member.userId ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeMutation.mutate(member.userId)}
                      disabled={removeMutation.isPending}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      {removeMutation.isPending ? 'REMOVING...' : 'CONFIRM'}
                    </button>
                    <button onClick={() => setRemoving(null)} className="text-xs font-mono text-slate-500">CANCEL</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRemoving(member.userId)}
                    className="text-xs font-mono text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    REMOVE
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>

      {showAdd && (
        <AddMemberModal projectId={project.id} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}
