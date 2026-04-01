import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generateBrochure, generateDescription } from '../../services/api'
import { Sparkles, FileText, Download, Loader2, Copy, RefreshCw, Layers, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/shared/GlassCard'
import CreativeButton from '../../components/shared/CreativeButton'
import { cn } from '../../lib/utils'

const TEMPLATES = [
  { id: 'product', label: 'Product Launch', desc: 'Announce a new product features' },
  { id: 'service', label: 'Service Showcase', desc: 'Highlight your unique services' },
  { id: 'event', label: 'Event Promotion', desc: 'Drive webinar & event attendance' },
  { id: 'offer', label: 'Special Offer', desc: 'Seasonal deals and time-limited offers' },
]

export default function BrochureBuilder() {
  const [prompt, setPrompt] = useState('')
  const [template, setTemplate] = useState('product')
  const [result, setResult] = useState<{ headline?: string; body?: string; cta?: string } | null>(null)
  const [descPrompt, setDescPrompt] = useState('')

  const brochureMut = useMutation({
    mutationFn: () => generateBrochure(`Template: ${template}\nBusiness details: ${prompt}`),
    onSuccess: (res) => {
      const data = res.data
      setResult(data.result || { headline: data.output, body: data.content, cta: data.cta })
      toast.success('Brochure content generated!')
    },
    onError: () => toast.error('TurfAI generation failed. Check your webhook config.'),
  })

  const descMut = useMutation({
    mutationFn: () => generateDescription(descPrompt),
    onSuccess: (res) => {
      const out = res.data.result?.body || res.data.output || ''
      setDescPrompt(out)
      toast.success('AI description written!')
    },
    onError: () => toast.error('Failed to generate description.'),
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
            Brochure <span className="text-brand-400 text-shadow-glow">Builder</span>
          </motion.h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">Architect high-impact brochure content with TurfAI Studio.</p>
        </div>
        {result && (
          <CreativeButton 
            onClick={() => { copy(`${result.headline}\n\n${result.body}\n\n${result.cta}`) }}
            className="h-12 px-6 bg-gray-800 text-white shadow-none border-white/5"
          >
            <Download className="w-4 h-4" /> Export Document
          </CreativeButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <GlassCard className="space-y-8" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.3)] animate-pulse-slow mb-4">
              <Zap className="w-8 h-8 text-[#030712] fill-[#030712]" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Configuration</h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Blueprint</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTemplate(t.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 group
                    ${template === t.id 
                      ? 'border-brand-500/50 bg-brand-500/10 text-white shadow-[0_0_20px_rgba(0,212,170,0.1)]' 
                      : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10 hover:bg-white/[0.05]'
                    }`}
                >
                  <p className={`text-sm font-black tracking-tight transition-colors ${template === t.id ? 'text-brand-400' : 'group-hover:text-gray-300'}`}>
                    {t.label}
                  </p>
                  <p className="text-[11px] font-medium leading-relaxed mt-1 opacity-60">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intelligence Prompt</label>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              rows={6}
              className="input-creative w-full resize-none"
              placeholder="e.g., Launching a high-end SaaS for restaurant management with real-time POS integration and automated inventory..." 
            />
          </div>

          <CreativeButton 
            id="generate-brochure-btn" 
            onClick={() => brochureMut.mutate()} 
            disabled={brochureMut.isPending || !prompt.trim()}
            className="w-full h-14 justify-center text-[#030712] font-black text-lg"
          >
            {brochureMut.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sequencing AI...</>
            ) : (
              <><Sparkles className="w-5 h-5 fill-[#030712]" /> Ignite Generation</>
            )}
          </CreativeButton>
        </GlassCard>

        {/* Output Panel */}
        <GlassCard className="flex flex-col min-h-[500px]" delay={0.2} containerClassName="lg:h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[#030712] font-black text-sm shadow-brand-500/20 shadow-lg">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">AI Output</h2>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {!result && !brochureMut.isPending && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center px-10"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-gray-800" />
                  </div>
                  <p className="text-gray-500 font-bold tracking-wide">Await Intelligence Processing</p>
                  <p className="text-gray-700 text-xs mt-2 uppercase tracking-[0.2em]">Configure your blueprint to begin</p>
                </motion.div>
              )}

              {brochureMut.isPending && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                  <p className="text-brand-400 text-xs font-black uppercase tracking-widest animate-pulse">TurfAI is synthesizing...</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {result.headline && (
                    <div className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                      <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-3">Impact Headline</label>
                      <p className="text-2xl font-black text-white leading-tight">{result.headline}</p>
                      <button onClick={() => copy(result.headline!)} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/5 text-gray-600 hover:text-brand-400 transition-colors animate-fade-in"><Copy className="w-4 h-4" /></button>
                    </div>
                  )}
                  {result.body && (
                    <div className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                      <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-3">Manuscript Body</label>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">{result.body}</p>
                      <button onClick={() => copy(result.body!)} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/5 text-gray-600 hover:text-brand-400 transition-colors animate-fade-in"><Copy className="w-4 h-4" /></button>
                    </div>
                  )}
                  {result.cta && (
                    <div className="p-6 rounded-3xl bg-brand-500/5 border border-brand-500/20 shadow-[0_0_30px_rgba(0,212,170,0.05)]">
                      <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-2">Final Action</label>
                      <p className="text-xl font-black text-brand-400 italic">"{result.cta}"</p>
                    </div>
                  )}
                  <CreativeButton 
                    onClick={() => brochureMut.mutate()} 
                    className="w-full h-12 justify-center bg-transparent border-white/10 text-white shadow-none hover:bg-white/[0.05]"
                  >
                    <RefreshCw className="w-4 h-4" /> Alternate Synthesis
                  </CreativeButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>

      {/* Description Generator Section */}
      <GlassCard className="!p-8" delay={0.3}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Product Copywriter</h2>
          </div>
          <CreativeButton 
            onClick={() => descMut.mutate()} 
            disabled={descMut.isPending || !descPrompt.trim()} 
            className="w-full sm:w-auto h-12 px-8 bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] border-none"
          >
            {descMut.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 fill-white" /> Rewrite with AI</>}
          </CreativeButton>
        </div>
        <textarea 
          value={descPrompt} 
          onChange={e => setDescPrompt(e.target.value)} 
          rows={3}
          className="input-creative w-full resize-none min-h-[120px]"
          placeholder="Input your product fundamentals and TurfAI will generate high-conversion descriptions..." 
        />
      </GlassCard>
    </div>
  )
}
