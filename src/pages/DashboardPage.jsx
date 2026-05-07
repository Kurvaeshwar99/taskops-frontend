import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardApi } from '../api/client'
import { StatCard, SkeletonCard, StatusBadge, PriorityBadge, PageHeader } from '../components/ui'
import { formatRelative, formatDate } from '../lib/utils'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const CHART_COLORS = { TODO: '#64748b', IN_PROGRESS: '#22d3ee', DONE: '#34d399', OVERDUE: '#fb7185' }

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-600/60 rounded-lg px-3 py-2 text-xs font-mono">
        <p className="text-slate-400">{label}</p>
        <p className="text-white font-medium">{payload[0].value} tasks</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
  })

  const chartData = data
    ? Object.entries(data.tasksByStatus || {}).map(([status, count]) => ({ status, count }))
    : []

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`// ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      {/* Greeting */}
      <div className="mb-8 p-4 bg-slate-900/60 border border-slate-700/30 rounded-xl border-l-2 border-l-cyan-400">
        <p className="text-sm font-mono text-slate-400">
          <span className="text-cyan-400">→</span> Welcome back, <span className="text-white">{user?.name}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Projects" value={data?.totalProjects ?? 0} accent="cyan" />
            <StatCard label="Total Tasks" value={data?.totalTasks ?? 0} accent="amber" />
            <StatCard label="Overdue" value={data?.overdueTasks ?? 0} accent="rose" />
            <StatCard
              label="Completed"
              value={data?.tasksByStatus?.DONE ?? 0}
              accent="emerald"
              sub={`of ${data?.totalTasks ?? 0} total`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-1 card p-5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Task Status Breakdown</h3>
          {isLoading ? (
            <div className="skeleton h-48 rounded" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="status" tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={CHART_COLORS[entry.status] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm font-mono">No data yet</div>
          )}
        </div>

        {/* My tasks */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">My Tasks</h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
            </div>
          ) : data?.myTasks?.length > 0 ? (
            <div className="space-y-2">
              {data.myTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/60 transition-colors group"
                >
                  <StatusBadge status={task.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                    <p className="text-xs text-slate-500 font-mono">{task.project?.name} · {formatDate(task.dueDate)}</p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm font-mono py-8">
              No tasks assigned to you
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-3 card p-5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Recent Activity</h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
          ) : data?.recentActivity?.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {data.recentActivity.map((task) => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}`}
                  className="flex items-center gap-4 py-2.5 hover:bg-slate-800/40 -mx-5 px-5 transition-colors group"
                >
                  <StatusBadge status={task.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">{task.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500 font-mono">{task.project?.name}</p>
                    <p className="text-xs text-slate-600 font-mono">{formatRelative(task.updatedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm font-mono text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
