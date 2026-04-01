import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCampaigns, createCampaign } from '../../services/api'
import { useState } from 'react'
import { Plus, Mail, MessageSquare, Share2, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'
import GlassCard from '../../components/shared/GlassCard'
import CreativeButton from '../../components/shared/CreativeButton'
import CreativeInput from '../../components/shared/CreativeInput'
import GlassModal from '../../components/shared/GlassModal'

const TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  EMAIL: { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  WHATSAPP: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  SOCIAL: { icon: Share2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-400',
  SCHEDULED: 'bg-yellow-500/20 text-yellow-400',
  SENT: 'bg-brand-500/20 text-brand-400',
  FAILED: 'bg-red-500/20 text-red-400',
}

export default function Campaigns() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'EMAIL' })

  const { data, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: () => getCampaigns().then(r => r.data) })
  const campaigns = data?.campaigns || []

  const add = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); setShowForm(false); toast.success('Campaign created!') },
    onError: () => toast.error('Failed to create campaign'),
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-gray-400 mt-2">Multichannel email, WhatsApp & social distributions</p>
        </div>
        <CreativeButton onClick={() => setShowForm(true)} className="px-6">
          <Plus className="w-5 h-5" />New Campaign
        </CreativeButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>
      ) : campaigns.length === 0 ? (
        <GlassCard className="flex flex-col items-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20 shadow-lg">
            <Sparkles className="w-8 h-8 text-brand-400" />
          </div>
          <p className="text-xl font-bold text-white mb-2">No campaigns yet</p>
          <p className="text-gray-500 text-base mb-8 max-w-sm">Launch your first creative multichannel campaign with TurfAI automation.</p>
          <CreativeButton onClick={() => setShowForm(true)} className="px-8 py-4 text-lg">
            <Plus className="w-6 h-6" />Start Your First Campaign
          </CreativeButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c: any, i: number) => {
            const meta = TYPE_META[c.type] || TYPE_META.EMAIL
            return (
              <GlassCard key={c.id} delay={i * 0.1} className="group relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${meta.bg} flex items-center justify-center border border-white/5`}>
                    <meta.icon className={`w-6 h-6 ${meta.color}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[c.status] || 'bg-gray-500/20 text-gray-400 border border-white/5'}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white truncate group-hover:text-brand-400 transition-colors">{c.name}</h3>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">{c.type} Distribution</p>
                
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[10px] text-gray-600 uppercase font-black">
                    Created {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="w-6 h-6 rounded-full border-2 border-dark-900 bg-white/10 flex items-center justify-center text-[8px] text-white overflow-hidden backdrop-blur-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id + j}`} alt="avatar" />
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* New Campaign Modal */}
      <GlassModal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title="Start New Campaign"
      >
        <div className="space-y-8">
          <CreativeInput 
            label="Campaign Name" 
            placeholder="e.g. Summer Blitz 2025" 
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
          />
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 ml-1">Distribution Channel</label>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(TYPE_META).map(([type, meta]) => (
                <button 
                  key={type} 
                  onClick={() => setForm(f => ({ ...f, type }))}
                  className={cn(
                    'flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 active:scale-95',
                    form.type === type 
                      ? `${meta.bg} border-brand-500/50 ${meta.color} shadow-lg shadow-brand-500/10` 
                      : 'border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/5 hover:border-white/10'
                  )}
                >
                  <meta.icon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <CreativeButton 
              variant="secondary" 
              onClick={() => setShowForm(false)} 
              className="flex-1"
            >
              Cancel
            </CreativeButton>
            <CreativeButton 
              onClick={() => add.mutate(form)} 
              disabled={add.isPending || !form.name}
              className="flex-1"
            >
              {add.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" />Launch</>}
            </CreativeButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}
