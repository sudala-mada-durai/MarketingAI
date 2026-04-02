import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Megaphone, FileImage, Sparkles,
  BarChart2, Settings, LogOut, Zap, ChevronRight, Brain, FileSearch,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Users, label: 'CRM Pipeline' },
  { label: 'Studio', divider: true },
  { to: '/studio/brochure', icon: FileImage, label: 'Brochure Builder' },
  { to: '/studio/ads', icon: Megaphone, label: 'Ad Studio' },
  { label: 'Intelligence', divider: true },
  { to: '/brain', icon: Brain, label: 'Marketing Brain' },
  { to: '/intelligence', icon: BarChart2, label: 'Competitor Intel' },
  { to: '/docs', icon: FileSearch, label: 'Document Analyzer' },
  { label: 'Growth', divider: true },
  { to: '/campaigns', icon: Sparkles, label: 'Campaigns' },
  { label: 'System', divider: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Creative Background mesh blobs */}
      <div className="bg-mesh-container">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 flex flex-col glass border-r bg-black/20 shrink-0 z-20">
        {/* Logo */}
        <div className="p-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-[0_0_20px_var(--brand-glow)] animate-pulse-slow">
              <Zap className="w-5 h-5 text-[#0a0a0a] fill-[#0a0a0a]" />
            </div>
            <div>
              <p className="font-black text-white text-lg tracking-tight leading-tight">MarketingOS</p>
              <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">{user?.orgName}</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          {nav.map((item, i) => {
            if (item.divider) return (
              <p key={i} className="text-[10px] text-gray-500 uppercase tracking-[0.2em] px-4 pt-8 pb-2 font-black">
                {item.label}
              </p>
            )
            const Icon = item.icon!
            return (
              <NavLink key={item.to} to={item.to!}
                className={({ isActive }) => `nav-item group ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" />
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-6 mt-auto">
          <div className="glass p-4 rounded-3xl border-white/5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-sm shrink-0 border border-white/10 group-hover:border-brand-500/50 transition-colors">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all active:scale-90"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="p-10 max-w-[1600px] mx-auto min-h-full flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* Subtle overlay to soften the background */}
        <div className="fixed inset-0 bg-black/20 pointer-events-none -z-10" />
      </main>
    </div>
  )
}
