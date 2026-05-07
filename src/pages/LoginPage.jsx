import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../lib/utils'
import { Spinner } from '../components/ui'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.name}`)
      navigate('/')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-cyan-400 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-display font-700 text-white text-2xl tracking-tight">TaskOps</span>
        </div>

        <div className="card p-7">
          <h2 className="font-display text-xl font-700 text-white mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 font-mono mb-6">// access your workspace</p>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {mutation.isPending ? <><Spinner /> SIGNING IN...</> : 'SIGN IN →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 font-mono mt-5">
            No account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Register
            </Link>
          </p>

          {/* Demo creds */}
          <div className="mt-5 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <p className="text-xs font-mono text-slate-500 mb-1">// DEMO CREDENTIALS</p>
            <p className="text-xs font-mono text-slate-400">alice@example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
