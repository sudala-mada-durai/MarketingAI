import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Mail, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import GlassCard from '../components/shared/GlassCard'
import CreativeButton from '../components/shared/CreativeButton'
import CreativeInput from '../components/shared/CreativeInput'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="bg-mesh-container">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-[0_0_40px_var(--brand-glow)] animate-pulse-slow mb-6">
            <Zap className="w-8 h-8 text-black fill-black" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">MarketingOS</h1>
          <p className="text-brand-400/60 font-black uppercase tracking-[0.3em] text-[10px] mt-2">Enterprise Intelligence Suite</p>
        </motion.div>

        <GlassCard className="!p-10 border-white/5 shadow-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Access your enterprise dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <CreativeInput 
              label="Email Identifier"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com" 
              icon={<Mail className="w-5 h-5" />}
              required 
            />

            <CreativeInput 
              label="Security Key"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              icon={<Lock className="w-5 h-5" />}
              required 
            />

            <CreativeButton 
              id="login-submit" 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 mt-4 text-black font-black text-xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enter Ecosystem'}
            </CreativeButton>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 font-medium text-sm">
              New organisation?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-black tracking-tight underline-offset-4 hover:underline">
                Register Workspace
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer Subtle Text */}
        <p className="text-center text-[10px] text-gray-700 font-black tracking-widest uppercase mt-12 opacity-40">
          Powered by TurfAI Studio &middot; Secure &middot; Enterprise Grade 
        </p>
      </div>
    </div>
  )
}
