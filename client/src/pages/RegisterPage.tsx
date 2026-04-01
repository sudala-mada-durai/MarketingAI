import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Mail, Lock, User, Building2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import GlassCard from '../components/shared/GlassCard'
import CreativeButton from '../components/shared/CreativeButton'
import CreativeInput from '../components/shared/CreativeInput'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Organisation created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.')
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
            <h2 className="text-2xl font-black text-white mb-2">Create Workspace</h2>
            <p className="text-gray-500 font-medium">Set up your organisation's OS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <CreativeInput 
              label="Your Name"
              type="text" 
              value={form.name} 
              onChange={set('name')}
              placeholder="John Smith" 
              icon={<User className="w-5 h-5" />}
              required 
            />

            <CreativeInput 
              label="Organisation Name"
              type="text" 
              value={form.orgName} 
              onChange={set('orgName')}
              placeholder="Acme Corp" 
              icon={<Building2 className="w-5 h-5" />}
              required 
            />

            <CreativeInput 
              label="Work Email"
              type="email" 
              value={form.email} 
              onChange={set('email')}
              placeholder="john@acme.com" 
              icon={<Mail className="w-5 h-5" />}
              required 
            />

            <CreativeInput 
              label="Security Key"
              type="password" 
              value={form.password} 
              onChange={set('password')}
              placeholder="••••••••" 
              icon={<Lock className="w-5 h-5" />}
              required 
            />

            <CreativeButton 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 mt-4 text-black font-black text-xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Initialise Workspace'}
            </CreativeButton>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 font-medium text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-black tracking-tight underline-offset-4 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
