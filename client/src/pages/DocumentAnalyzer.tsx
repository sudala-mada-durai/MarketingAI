import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Sparkles, Download, RefreshCw,
  CheckCircle2, AlertCircle, Loader2, FileSearch,
  FileType, X, Zap,
} from 'lucide-react'
import api from '../services/api'

type Stage = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

interface Result {
  summary: string
  filename: string
  size: number
  mimetype: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function FileIcon({ mimetype }: { mimetype: string }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center shrink-0 border border-brand-500/25">
      <FileType className="w-6 h-6 text-brand-400" />
    </div>
  )
}

export default function DocumentAnalyzer() {
  const [stage, setStage] = useState<Stage>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const resetAll = () => {
    setStage('idle')
    setSelectedFile(null)
    setResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const runAnalysis = useCallback(async (file: File) => {
    setSelectedFile(file)
    setStage('uploading')
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setStage('analyzing')
      const res = await api.post('/docs/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
      })
      setResult(res.data)
      setStage('done')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed')
      setStage('error')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) runAnalysis(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) runAnalysis(file)
  }, [runAnalysis])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.summary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary-${result.filename.replace(/\.[^/.]+$/, '')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isProcessing = stage === 'uploading' || stage === 'analyzing'

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-accent-500/20 text-accent-400">
            <FileSearch className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Document Analyzer</h1>
        </div>
        <p className="text-gray-400 max-w-xl">
          Upload any PDF, DOCX, or TXT — TurfAI will read it, extract the key insights, and generate a clean summary you can download.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop Zone */}
          <motion.div
            animate={dragOver ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative glass rounded-[2.5rem] border-2 border-dashed p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[320px] ${
              dragOver
                ? 'border-brand-500/70 bg-brand-500/10 shadow-[0_0_40px_rgba(0,212,170,0.25)]'
                : isProcessing
                ? 'border-accent-500/40 cursor-not-allowed opacity-70'
                : 'border-white/10 hover:border-brand-500/40 hover:bg-white/[0.03]'
            }`}
          >
            {/* Glowing ring animation when processing */}
            {isProcessing && (
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div className="absolute inset-0 border-2 border-accent-500/40 rounded-[2.5rem] animate-pulse" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-2 border-accent-500/30" />
                    <Loader2 className="w-16 h-16 text-accent-400 animate-spin absolute inset-0" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">
                      {stage === 'uploading' ? 'Uploading…' : 'TurfAI is reading…'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {stage === 'analyzing' ? 'Extracting insights and generating summary' : 'Sending to server'}
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                      <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                      <span className="text-sm text-gray-300 truncate max-w-[180px]">{selectedFile.name}</span>
                    </div>
                  )}
                </motion.div>
              ) : stage === 'done' || stage === 'error' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  {stage === 'done' ? (
                    <CheckCircle2 className="w-14 h-14 text-brand-400" />
                  ) : (
                    <AlertCircle className="w-14 h-14 text-red-400" />
                  )}
                  <p className="text-white font-bold">
                    {stage === 'done' ? 'Analysis complete!' : 'Analysis failed'}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); resetAll() }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-all border border-white/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Analyze another
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Drop your document here</p>
                    <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {['PDF', 'DOCX', 'TXT'].map(ext => (
                      <span key={ext} className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 border border-white/10">
                        {ext}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-600">Max 20 MB</p>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
          </motion.div>

          {/* File info card (after selection) */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl p-4 border border-white/10 flex items-center gap-4"
              >
                <FileIcon mimetype={selectedFile.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{formatBytes(selectedFile.size)}</p>
                </div>
                {!isProcessing && (
                  <button onClick={resetAll} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-gray-500 font-black">How it works</p>
            {[
              { icon: Upload, label: 'Upload your document' },
              { icon: Zap, label: 'TurfAI extracts & reads your content' },
              { icon: Sparkles, label: 'AI generates a rich summary' },
              { icon: Download, label: 'Download the summary as a .txt file' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div className="lg:col-span-3">
          <div className="glass rounded-[2.5rem] border border-white/5 min-h-[520px] flex flex-col overflow-hidden relative">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent-500/5 blur-[100px] -z-10 rounded-full pointer-events-none" />

            {/* Panel header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-500/20 to-brand-500/20 flex items-center justify-center border border-white/10">
                  <Sparkles className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Summary</h2>
                  <p className="text-[10px] text-accent-400 uppercase tracking-widest font-bold">Powered by TurfAI</p>
                </div>
              </div>

              {stage === 'done' && result && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 font-bold text-sm transition-all border border-brand-500/30 hover:border-brand-500/60 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download Summary
                </motion.button>
              )}
            </div>

            {/* Panel body */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar" ref={summaryRef}>
              <AnimatePresence mode="wait">
                {/* Idle placeholder */}
                {stage === 'idle' && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-5 py-10"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileSearch className="w-9 h-9 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">No document uploaded yet</h3>
                      <p className="text-gray-500 text-sm max-w-xs">
                        Once you upload and analyze a document, the AI-generated summary will appear here.
                      </p>
                    </div>
                    {/* Skeleton preview lines */}
                    <div className="w-full max-w-md space-y-3 mt-4 px-4">
                      {[70, 95, 80, 60, 88].map((w, i) => (
                        <div key={i} className="h-3 rounded-full bg-white/[0.04]" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Processing placeholder */}
                {isProcessing && (
                  <motion.div
                    key="processing-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Loader2 className="w-4 h-4 text-accent-400 animate-spin" />
                      <span className="text-sm text-accent-400 font-medium">Generating summary…</span>
                    </div>
                    {[95, 80, 88, 72, 91, 65, 84, 78].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full bg-white/[0.06] animate-pulse"
                        style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Error state */}
                {stage === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-4 text-center h-full py-10"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
                      <p className="text-sm text-red-400 max-w-sm">{error}</p>
                    </div>
                    <button
                      onClick={resetAll}
                      className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-all border border-white/10"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try again
                    </button>
                  </motion.div>
                )}

                {/* Result */}
                {stage === 'done' && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    {/* Document meta */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                      <FileIcon mimetype={result.mimetype} />
                      <div>
                        <p className="text-sm font-bold text-white">{result.filename}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{formatBytes(result.size)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-[11px] text-brand-400 font-bold uppercase tracking-wider">Analyzed</span>
                      </div>
                    </div>

                    {/* Summary text */}
                    <div className="prose prose-invert max-w-none">
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] leading-relaxed">
                        <p className="text-[11px] uppercase tracking-widest font-black text-accent-400 mb-4 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          AI-Generated Summary
                        </p>
                        <div className="text-gray-300 text-sm leading-7 whitespace-pre-wrap">
                          {result.summary}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
