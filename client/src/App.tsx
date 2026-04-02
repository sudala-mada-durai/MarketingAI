import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/CRM/Pipeline'
import BrochureBuilder from './pages/Studio/BrochureBuilder'
import AdStudio from './pages/Studio/AdStudio'
import Campaigns from './pages/Campaigns/Campaigns'
import CompetitorIntel from './pages/CompetitorIntel'
import MarketingBrain from './pages/Intelligence/MarketingBrain'
import Settings from './pages/Settings'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-dark-900">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="studio/brochure" element={<BrochureBuilder />} />
            <Route path="studio/ads" element={<AdStudio />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="brain" element={<MarketingBrain />} />
            <Route path="intelligence" element={<CompetitorIntel />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
