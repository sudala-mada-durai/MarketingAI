import { useQuery } from '@tanstack/react-query'
import { getLeads, getReminders } from '../services/api'
import { Users, Megaphone, TrendingUp, Bell, ArrowUp, Sparkles, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import GlassCard from '../components/shared/GlassCard'
import CreativeButton from '../components/shared/CreativeButton'
import { motion } from 'framer-motion'

const STATUS_COLOR: Record<string, string> = {
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONTACTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  QUALIFIED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PROPOSAL_SENT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  NEGOTIATION: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  CLOSED_WON: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  CLOSED_LOST: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: leadsData } = useQuery({ queryKey: ['leads'], queryFn: () => getLeads().then(r => r.data) })
  const { data: remindersData } = useQuery({ queryKey: ['reminders'], queryFn: () => getReminders().then(r => r.data) })

  const leads = leadsData?.leads || []
  const reminders = remindersData?.reminders || []
  const wonLeads = leads.filter((l: any) => l.status === 'CLOSED_WON')
  const pendingReminders = reminders.filter((r: any) => !r.isDone)
  const totalValue = wonLeads.reduce((sum: number, l: any) => sum + (l.expectedValue || 0), 0)

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20', delta: '+12%' },
    { label: 'Won Deals', value: wonLeads.length, icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/20', delta: '+8%' },
    { label: 'Pipeline Value', value: `₹${(totalValue / 1000).toFixed(1)}K`, icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-500/20', delta: '+23%' },
    { label: 'Pending Task', value: pendingReminders.length, icon: Bell, color: 'text-orange-400', bg: 'bg-orange-500/20', delta: '' },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            Good morning, <span className="text-brand-400 text-shadow-glow">{user?.name?.split(' ')[0]}</span> 👋
          </motion.h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">Here's a snapshot of your sales ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreativeButton 
            onClick={() => navigate('/studio/brochure')}
            className="h-14 px-8 text-[#0a0a0a]"
          >
            <Sparkles className="w-5 h-5 fill-[#0a0a0a]" />
            Launch AI Studio
          </CreativeButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.1} className="relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              {s.delta && (
                <div className="px-2 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-[10px] font-black text-brand-400 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />{s.delta}
                </div>
              )}
            </div>
            <div className="mt-6">
              <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-20 -z-10 group-hover:opacity-40 transition-opacity ${s.bg.replace('/20', '')}`} />
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Activity Table-like list */}
        <GlassCard className="lg:col-span-3 !p-0 overflow-hidden" delay={0.4}>
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              High Value Leads
            </h2>
            <Link to="/pipeline" className="text-xs font-bold text-brand-400 hover:underline tracking-widest">
              VIEW PIPELINE
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {leads.slice(0, 5).map((lead: any) => (
              <motion.div 
                key={lead.id} 
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex items-center gap-5 p-6 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-black font-black text-lg shadow-lg">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate">{lead.name}</p>
                  <p className="text-sm text-gray-500 truncate font-medium">{lead.company || lead.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tighter border ${STATUS_COLOR[lead.status] || 'border-white/10 text-gray-400'}`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
            {leads.length === 0 && (
              <div className="p-20 text-center">
                <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold tracking-wide">No active leads in the ecosystem.</p>
                <Link to="/pipeline">
                  <CreativeButton className="mt-6 mx-auto bg-gray-800 text-white shadow-none">
                    <Plus className="w-4 h-4" /> New Lead
                  </CreativeButton>
                </Link>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Priority Reminders */}
        <GlassCard className="lg:col-span-2 !p-0 overflow-hidden" delay={0.5}>
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-400" />
              Priority Tasks
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {pendingReminders.slice(0, 5).map((r: any) => (
              <div key={r.id} className="group glass p-5 rounded-3xl border-transparent hover:border-white/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-brand-500 mt-1.5 shadow-[0_0_12px_var(--brand-glow)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-bold leading-relaxed">{r.note}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{r.lead?.name || 'Lead'}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">
                        {formatDistanceToNow(new Date(r.dueDate), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {pendingReminders.length === 0 && (
              <div className="p-12 text-center">
                <Sparkles className="w-10 h-10 text-brand-500/50 mx-auto mb-4" />
                <p className="text-gray-500 font-black tracking-wide uppercase text-xs">All caught up!</p>
              </div>
            )}
            <Link to="/pipeline" className="block text-center mt-4">
              <button className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase hover:text-white transition-colors">
                Manage Workspace
              </button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
