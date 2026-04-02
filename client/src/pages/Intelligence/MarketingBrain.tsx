import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Upload, MessageSquare, ShieldCheck, 
  Search, FileText, Zap, ChevronRight, X, Loader2,
  Trash2, ExternalLink
} from 'lucide-react'
import axios from 'axios'

interface KnowledgeAsset {
  id: string
  name: string
  type: string
  size: number
  status: 'INDEXING' | 'READY' | 'FAILED'
  url?: string
  createdAt: string
}

export default function MarketingBrain() {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [query, setQuery] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([])
  const [querying, setQuerying] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const fetchAssets = async () => {
    try {
      const res = await axios.get('/api/brain/assets')
      if (Array.isArray(res.data)) {
        setAssets(res.data)
      } else {
        setAssets([])
      }
    } catch {
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    // Mock upload for prototype
    const name = prompt('Enter Asset Name (e.g., Brand Guide 2024)')
    if (!name) return

    setUploading(true)
    try {
      await axios.post('/api/brain/upload', {
        name,
        type: 'PDF',
        size: 1024 * 1024 * 5, // 5MB mock
        url: 'https://example.com/asset.pdf'
      })
      fetchAssets()
    } finally {
      setUploading(false)
    }
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMsg = query
    setQuery('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setQuerying(true)

    try {
      const res = await axios.post('/api/brain/query', { prompt: userMsg })
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.result }])
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t connect to the Brain right now.' }])
    } finally {
      setQuerying(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Marketing Brain</h1>
          </div>
          <p className="text-gray-400 max-w-xl">
            The central intelligence hub for your organization. Train the AI on your brand DNA, product strategy, and market research.
          </p>
        </div>
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Index New Asset
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Asset Library */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-[2.5rem] border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Knowledge Library
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 px-2 py-1 rounded-lg">
                {assets.length} Indexed
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                ))
              ) : assets.length === 0 ? (
                <div className="text-center py-12 px-6 border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-sm text-gray-500">No assets indexed yet. Upload brand guides or strategy docs to start.</p>
                </div>
              ) : (
                assets.map(asset => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={asset.id}
                    className="glass-card p-4 rounded-2xl group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        asset.status === 'READY' ? 'bg-brand-500/10 text-brand-400' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {asset.status === 'INDEXING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{asset.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tight">
                          {asset.type} • {(asset.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      {asset.status === 'READY' && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {asset.status === 'INDEXING' && (
                      <div className="absolute bottom-0 left-0 h-0.5 bg-brand-500 animate-pulse w-full" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
              <p className="text-[11px] text-brand-400 flex items-center gap-2 font-medium">
                <Zap className="w-3 h-3" />
                RAG Sync Active
              </p>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                Assets are automatically vectorized and available for cross-module AI generation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Strategy Chat */}
        <div className="lg:col-span-2">
          <div className="glass p-8 rounded-[2.5rem] border-white/5 h-[700px] flex flex-col relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] -z-10 rounded-full" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Strategy Assistant</h2>
                  <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">Grounded in Brain Library</p>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4 mb-6">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-12">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <Brain className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">How can I help with your strategy?</h3>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Ask questions about your brand guidelines, product specs, or competitor intelligence stored in the library.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md">
                    {['Summarize our brand voice', 'What are our key Q1 goals?', 'Analyze competitor Pricing', 'Identify upsell opportunities'].map(suggestion => (
                      <button 
                        key={suggestion}
                        onClick={() => setQuery(suggestion)}
                        className="p-3 text-[11px] text-left text-gray-400 glass border-white/5 rounded-2xl hover:bg-white/5 hover:text-brand-400 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 max-w-[80%] rounded-[1.5rem] ${
                      msg.role === 'user' 
                        ? 'bg-brand-500/20 border border-brand-500/20 text-white rounded-tr-none' 
                        : 'glass border-white/5 text-gray-300 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              {querying && (
                <div className="flex justify-start">
                  <div className="glass border-white/5 p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                    <span className="text-xs text-gray-500 italic">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleQuery} className="relative">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask the Brain..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
              <button 
                disabled={querying || !query.trim()}
                type="submit"
                className="absolute right-2 top-2 p-3 rounded-xl bg-gradient-brand text-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <Zap className="w-4 h-4 fill-black" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
