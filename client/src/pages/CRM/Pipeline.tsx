import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeads, createLead, updateLead } from '../../services/api'
import { Plus, User, Phone, Mail, Building2, DollarSign, X, Loader2, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/shared/GlassCard'
import CreativeButton from '../../components/shared/CreativeButton'
import CreativeInput from '../../components/shared/CreativeInput'
import GlassModal from '../../components/shared/GlassModal'

const COLUMNS = [
  { id: 'NEW', label: 'New', color: 'bg-blue-500' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'PROPOSAL_SENT', label: 'Proposal', color: 'bg-orange-500' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-pink-500' },
  { id: 'CLOSED_WON', label: 'Closed Won', color: 'bg-brand-500' },
]

function LeadCard({ lead, onStatusChange }: { lead: any; onStatusChange: (id: string, status: string) => void }) {
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <GlassCard className="!p-4 border-white/5 hover:border-brand-500/30 transition-all cursor-grab active:cursor-grabbing">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-black font-black text-sm shrink-0 shadow-lg">
            {lead.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white truncate group-hover:text-brand-400 transition-colors">{lead.name}</p>
              <button className="text-gray-600 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            {lead.company && (
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {lead.company}
              </p>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              {lead.expectedValue && (
                <div className="px-2 py-1 rounded-md bg-brand-500/10 border border-brand-500/20">
                  <p className="text-[10px] text-brand-400 font-black flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />₹{lead.expectedValue.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-dark-900 bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  +1
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all">
          <select 
            value={lead.status} 
            onChange={e => onStatusChange(lead.id, e.target.value)}
            className="w-full text-[10px] font-black uppercase tracking-widest bg-black/40 text-gray-400 rounded-xl px-3 py-2 border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
          >
            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            <option value="CLOSED_LOST">Closed Lost</option>
          </select>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function Pipeline() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', expectedValue: '', source: '' })

  const { data, isLoading } = useQuery({ 
    queryKey: ['leads'], 
    queryFn: () => getLeads().then(r => r.data) 
  })
  const leads: any[] = data?.leads || []

  const addLead = useMutation({
    mutationFn: createLead,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['leads'] })
      setShowForm(false)
      toast.success('Lead secured!')
      setForm({ name: '', company: '', email: '', phone: '', expectedValue: '', source: '' }) 
    },
    onError: () => toast.error('Failed to register lead'),
  })

  const moveLead = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLead(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addLead.mutate({ ...form, expectedValue: form.expectedValue ? parseFloat(form.expectedValue) : undefined })
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Growth Pipeline</h1>
          <p className="text-brand-400/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
            {leads.length} Active Opportunities • Value: ₹{(leads.reduce((a, b) => a + (b.expectedValue || 0), 0)).toLocaleString()}
          </p>
        </div>
        <CreativeButton id="add-lead-btn" onClick={() => setShowForm(true)} className="px-6 h-12 text-sm">
          <Plus className="w-4 h-4" /> Add Opportunity
        </CreativeButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Pipeline...</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
          {COLUMNS.map(col => {
            const colLeads = leads.filter((l: any) => l.status === col.id)
            return (
              <div key={col.id} className="flex-shrink-0 w-72 snap-start">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className={`w-3 h-3 rounded-full ${col.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
                  <p className="text-xs font-black text-white uppercase tracking-widest">{col.label}</p>
                  <span className="ml-auto text-[10px] font-black text-brand-400/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {colLeads.length}
                  </span>
                </div>
                <div className="space-y-4 min-h-[500px]">
                  <AnimatePresence mode="popLayout">
                    {colLeads.map((lead: any) => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onStatusChange={(id, status) => moveLead.mutate({ id, status })} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <GlassModal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)}
        title="New Growth Opportunity"
      >
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <CreativeInput 
              label="Contact Name"
              type="text" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full Name" 
              icon={<User className="w-4 h-4" />}
              required 
            />
            <CreativeInput 
              label="Organisation"
              type="text" 
              value={form.company} 
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Acme Corp" 
              icon={<Building2 className="w-4 h-4" />}
            />
          </div>

          <CreativeInput 
            label="Work Email"
            type="email" 
            value={form.email} 
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="john@example.com" 
            icon={<Mail className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <CreativeInput 
              label="Contact Number"
              type="text" 
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91..." 
              icon={<Phone className="w-4 h-4" />}
            />
            <CreativeInput 
              label="Deal Value (₹)"
              type="number" 
              value={form.expectedValue} 
              onChange={e => setForm(f => ({ ...f, expectedValue: e.target.value }))}
              placeholder="50000" 
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <CreativeButton 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)} 
              className="flex-1 h-14"
            >
              Cancel
            </CreativeButton>
            <CreativeButton 
              type="submit" 
              disabled={addLead.isPending} 
              className="flex-1 h-14 text-black font-black"
            >
              {addLead.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialise Lead'}
            </CreativeButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}
