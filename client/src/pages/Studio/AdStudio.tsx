import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generateAdCopy } from '../../services/api'
import { Sparkles, Instagram, Facebook, Linkedin, MessageSquare, Copy, Loader2, RefreshCw, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/shared/GlassCard'
import CreativeButton from '../../components/shared/CreativeButton'
import { cn } from '../../lib/utils'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
]

const TONES = ['Professional', 'Casual & Fun', 'Urgent', 'Inspirational', 'Educational']

export default function AdStudio() {
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [tone, setTone] = useState('Professional')
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<Record<string, string>>({})

  const togglePlatform = (id: string) =>
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const genMut = useMutation({
    mutationFn: () => generateAdCopy(
      `Platforms: ${platforms.join(', ')}\nTone: ${tone}\nCampaign: ${prompt}\nGenerate separate ad copy for each platform with hashtags and emojis where appropriate.`
    ),
    onSuccess: (res) => {
      const data = res.data.result || res.data
      if (typeof data === 'object' && !Array.isArray(data)) {
        setResults(data)
      } else {
        const text = data.output || data.body || JSON.stringify(data)
        const newResults: Record<string, string> = {}
        platforms.forEach(p => { newResults[p] = text })
        setResults(newResults)
      }
      toast.success('Campaign strategy generated!')
    },
    onError: () => toast.error('TurfAI generation failed.'),
  })

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            Ad <span className="text-brand-400 text-shadow-glow">Studio</span>
          </motion.h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">Multichannel campaign orchestration via TurfAI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Controls Panel */}
        <GlassCard className="lg:col-span-2 space-y-8" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
              <Zap className="w-5 h-5 text-brand-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Campaign Matrix</h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Distribution Channels</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300
                    ${platforms.includes(p.id)
                      ? `${p.bg} ${p.border} ${p.color} shadow-[0_0_20px_rgba(0,0,0,0.2)]`
                      : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10 hover:bg-white/[0.05]'
                    }`}
                >
                  <p.icon className="w-5 h-5" />
                  <span className="text-sm font-black tracking-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Brand Voice</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-tight border transition-all duration-300
                    ${tone === t
                      ? 'bg-brand-500/20 border-brand-500/40 text-brand-400 shadow-[0_0_15px_rgba(0,212,170,0.1)]'
                      : 'border-white/5 bg-white/[0.01] text-gray-600 hover:border-white/10 hover:text-gray-400'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Campaign Fundamentals</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              className="input-creative w-full resize-none"
              placeholder="e.g., 50% Off Summer Solstice Sale. Target: Fashion enthusiasts. Key hooks: Limited edition, handcrafted, sustainable materials..."
            />
          </div>

          <CreativeButton
            id="generate-ad-btn"
            onClick={() => genMut.mutate()}
            disabled={genMut.isPending || !prompt.trim() || platforms.length === 0}
            className="w-full h-14 justify-center text-[#0a0a0a] font-black text-lg"
          >
            {genMut.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Weaving Strategy...</>
            ) : (
              <><Sparkles className="w-5 h-5 fill-[#0a0a0a]" /> Execute Generation</>
            )}
          </CreativeButton>
        </GlassCard>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {Object.keys(results).length === 0 && !genMut.isPending && (
              <GlassCard className="flex flex-col items-center justify-center py-32 text-center" delay={0.2}>
                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-800" />
                </div>
                <p className="text-gray-500 font-bold tracking-wide">Await Campaign Synthesis</p>
                <p className="text-gray-700 text-xs mt-2 uppercase tracking-[0.2em]">Select channels and describe your hooks</p>
              </GlassCard>
            )}

            {genMut.isPending && (
              <GlassCard className="flex flex-col items-center justify-center py-32" delay={0.2}>
                <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-6" />
                <p className="text-brand-400 text-xs font-black uppercase tracking-widest animate-pulse">TurfAI is crafting multichannel copy...</p>
              </GlassCard>
            )}

            {Object.entries(results).map(([pid, text], index) => {
              const p = PLATFORMS.find(x => x.id === pid)
              if (!p) return null
              return (
                <motion.div
                  key={pid}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className={cn('border-l-4 group', p.border.replace('border-', 'border-l-'))}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', p.bg, p.border)}>
                        <p.icon className={cn('w-5 h-5', p.color)} />
                      </div>
                      <p className="text-xl font-black text-white tracking-tight">{p.label}</p>
                      <div className="ml-auto flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copy(text)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-brand-400 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => genMut.mutate()} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-brand-400 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">{text}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
