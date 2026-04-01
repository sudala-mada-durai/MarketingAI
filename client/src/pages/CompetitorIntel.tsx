import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analyzeCompetitors } from '../services/api'
import { BarChart2, Sparkles, Loader2, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../components/shared/GlassCard'
import CreativeButton from '../components/shared/CreativeButton'
import CreativeInput from '../components/shared/CreativeInput'

interface CompetitorData {
  name: string
  price?: string
  offer?: string
  strengths?: string[]
  weaknesses?: string[]
  recommendation?: string
}

export default function CompetitorIntel() {
  const [prompt, setPrompt] = useState('')
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [summary, setSummary] = useState('')

  const analysisMut = useMutation({
    mutationFn: () => analyzeCompetitors(
      `Analyze these competitors and return a JSON array of objects with fields: name, price, offer, strengths (array), weaknesses (array), recommendation. Also include a "summary" field at the root level.\n\n${prompt}`
    ),
    onSuccess: (res) => {
      try {
        const raw = res.data.result || res.data.output || res.data
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        setCompetitors(parsed.competitors || parsed || [])
        setSummary(parsed.summary || '')
        toast.success('Competitor analysis complete!')
      } catch {
        setSummary(typeof res.data.result === 'string' ? res.data.result : 'Analysis complete. See raw output.')
        toast.success('Analysis received from TurfAI')
      }
    },
    onError: () => toast.error('TurfAI analysis failed. Check Settings.'),
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Competitor Intelligence</h1>
          <p className="text-gray-400 mt-2">AI-powered competitor price & offer analysis via TurfAI</p>
        </div>
      </div>

      <GlassCard className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
            <BarChart2 className="w-5 h-5 text-brand-400" />
          </div>
          Analysis Prompt
        </h2>
        
        <CreativeInput 
          multiline
          value={prompt} 
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g., Analyze competitors for a premium SaaS HR tool in India. Key competitors: Zoho People (₹60/user/mo), greytHR (₹30/user/mo), Darwinbox (₹80/user/mo)..."
          className="min-h-[160px]"
        />

        <div className="flex justify-start">
          <CreativeButton 
            onClick={() => analysisMut.mutate()} 
            disabled={analysisMut.isPending || !prompt.trim()}
            className="px-8"
          >
            {analysisMut.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Analysing...</>
            ) : (
              <><Sparkles className="w-5 h-5" />Run Deep Analysis</>
            )}
          </CreativeButton>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {(competitors.length > 0 || summary) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {summary && (
              <div className="p-6 rounded-[2rem] border border-brand-500/30 bg-brand-500/5 backdrop-blur-xl">
                <p className="text-brand-400 font-bold text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> TurfAI STRATEGIC SUMMARY
                </p>
                <p className="text-gray-200 text-base leading-relaxed">{summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {competitors.map((c, i) => (
                <GlassCard key={i} delay={i * 0.1} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{c.name}</h3>
                      {c.price && <p className="text-brand-400 font-bold text-2xl mt-1 tracking-tight">{c.price}</p>}
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 40}, 80%, 40%))` }}>
                      {c.name[0]}
                    </div>
                  </div>
                  
                  {c.offer && <p className="text-sm text-gray-400 italic bg-white/5 p-3 rounded-xl border border-white/5">"{c.offer}"</p>}
                  
                  <div className="space-y-4">
                    {c.strengths && c.strengths.length > 0 && (
                      <div className="bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                        <p className="text-xs text-green-400 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-wider"><TrendingUp className="w-3.5 h-3.5" /> Strengths</p>
                        <ul className="space-y-1.5">{c.strengths.map((s, j) => <li key={j} className="text-xs text-gray-300 flex items-start gap-2"><span className="text-green-500 text-lg leading-none mt-[-2px]">•</span>{s}</li>)}</ul>
                      </div>
                    )}
                    
                    {c.weaknesses && c.weaknesses.length > 0 && (
                      <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                        <p className="text-xs text-red-400 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-wider"><TrendingDown className="w-3.5 h-3.5" /> Weaknesses</p>
                        <ul className="space-y-1.5">{c.weaknesses.map((w, j) => <li key={j} className="text-xs text-gray-300 flex items-start gap-2"><span className="text-red-500 text-lg leading-none mt-[-2px]">•</span>{w}</li>)}</ul>
                      </div>
                    )}
                  </div>

                  {c.recommendation && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs text-brand-400 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-wider"><Minus className="w-3.5 h-3.5" /> Strategy recommendation</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{c.recommendation}</p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <CreativeButton variant="secondary" onClick={() => analysisMut.mutate()} className="px-8 py-2">
                <RefreshCw className="w-4 h-4" /> RE-ANALYZE MARKET DATA
              </CreativeButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
