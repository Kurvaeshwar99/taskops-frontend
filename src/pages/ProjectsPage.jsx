import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { projectApi } from '../api/client'
import { PageHeader, SkeletonCard, EmptyState, Modal, Spinner } from '../components/ui'
import { formatDate, getErrorMessage } from '../lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Required').max(100),
  description: z.string().max(500).optional(),
})

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="card-hover p-5 block group animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4.5 h-4.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        </div>
        <span className={`badge border text-xs ${project.myRole === 'ADMIN' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-slate-400/10 text-slate-400 border-slate-400/30'}`}>
          {project.myRole}
        </span>
      </div>

      <h3 className="font-display font-700 text-white text-sm group-hover:text-cyan-400 transition-colors mb-1">{project.name}</h3>
      {project.description && (
        <p className="text-xs text-slate-500 font-body line-clamp-2 mb-3">{project.description}</p>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {project._count?.members ?? 0} members
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {project._count?.tasks ?? 0} tasks
        </div>
        <div className="ml-auto text-xs text-slate-600 font-mono">{formatDate(project.createdAt)}</div>
      </div>
    </Link>
  )
}

function CreateProjectModal({ onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data) => projectApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['projects'])
      toast.success('Project created')
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <label className="label">Project Name</label>
          <input {...register('name')} className="input" placeholder="Website Redesign" autoFocus />
          {errors.name && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} className="input resize-none" rows={3} placeholder="What is this project about?" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">CANCEL</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {mutation.isPending ? <><Spinner /> CREATING...</> : 'CREATE →'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ProjectsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.list().then((r) => r.data.data),
  })

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Projects"
        subtitle={`// ${projects?.length ?? 0} active workspaces`}
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            NEW PROJECT
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      ) : (
        <EmptyState
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}
          title="No projects yet"
          description="Create your first project to start managing tasks with your team."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary">CREATE PROJECT →</button>}
        />
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
