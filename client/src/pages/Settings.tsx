import { useState } from 'react'
import { Webhook, Save, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import GlassCard from '../components/shared/GlassCard'
import CreativeButton from '../components/shared/CreativeButton'
import CreativeInput from '../components/shared/CreativeInput'

const FEATURES = [
  { key: 'brochure_gen', label: 'Brochure Generator', desc: 'Generates brochure copy and headlines' },
  { key: 'ad_gen', label: 'Ad Copy Generator', desc: 'Creates platform-specific ad copy' },
  { key: 'description_gen', label: 'Description Writer', desc: 'Writes product/service descriptions' },
  { key: 'competitor_analysis', label: 'Competitor Analysis', desc: 'Analyzes competitor pricing & offers' },
]

export default function Settings() {
  const qc = useQueryClient()
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [configs, setConfigs] = useState<Record<string, { webhookUrl: string; secret: string }>>({})

  useQuery({
    queryKey: ['turfai-configs'],
    queryFn: () => api.get('/settings/turf').then(r => {
      const map: Record<string, { webhookUrl: string; secret: string }> = {}
      r.data.configs?.forEach((c: any) => { map[c.featureKey] = { webhookUrl: c.webhookUrl, secret: '' } })
      setConfigs(map)
      return r.data
    }),
  })

  const saveMut = useMutation({
    mutationFn: (payload: { featureKey: string; webhookUrl: string; secret: string }) =>
      api.post('/settings/turf', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['turfai-configs'] }); toast.success('Webhook saved!') },
    onError: () => toast.error('Failed to save webhook config'),
  })

  const set = (key: string, field: string, val: string) =>
    setConfigs(c => ({ ...c, [key]: { ...c[key], [field]: val } }))

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-2">Configure TurfAI webhooks and organisation preferences</p>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
            <Webhook className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">TurfAI Studio Webhooks</h2>
            <p className="text-sm text-gray-400 mt-0.5">Connect each AI feature to your TurfAI workflow webhooks</p>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {FEATURES.map(feature => (
            <div key={feature.key} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="space-y-1">
                <p className="text-lg font-bold text-white">{feature.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <CreativeInput 
                  label="Webhook URL"
                  placeholder="https://turf.ai/webhook/xxx"
                  value={configs[feature.key]?.webhookUrl || ''}
                  onChange={e => set(feature.key, 'webhookUrl', e.target.value)}
                />
                
                <div className="relative">
                  <CreativeInput 
                    label="Webhook Secret"
                    type={showSecrets[feature.key] ? 'text' : 'password'}
                    placeholder="your-webhook-secret"
                    value={configs[feature.key]?.secret || ''}
                    onChange={e => set(feature.key, 'secret', e.target.value)}
                  />
                  <button 
                    onClick={() => setShowSecrets(s => ({ ...s, [feature.key]: !s[feature.key] }))}
                    className="absolute right-4 top-[38px] text-gray-500 hover:text-gray-300 p-2"
                  >
                    {showSecrets[feature.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end pr-1">
                  <CreativeButton
                    onClick={() => saveMut.mutate({ featureKey: feature.key, ...configs[feature.key] })}
                    disabled={saveMut.isPending || !configs[feature.key]?.webhookUrl}
                    className="text-sm px-6"
                  >
                    {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configuration
                  </CreativeButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
