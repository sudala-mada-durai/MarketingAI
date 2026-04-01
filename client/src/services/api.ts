import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })
export const register = (data: { name: string; email: string; password: string; orgName: string }) =>
  api.post('/auth/register', data)

// Leads
export const getLeads = () => api.get('/leads')
export const createLead = (data: object) => api.post('/leads', data)
export const updateLead = (id: string, data: object) => api.put(`/leads/${id}`, data)
export const deleteLead = (id: string) => api.delete(`/leads/${id}`)

// Campaigns
export const getCampaigns = () => api.get('/campaigns')
export const createCampaign = (data: object) => api.post('/campaigns', data)

// Reminders
export const getReminders = () => api.get('/reminders')
export const createReminder = (data: object) => api.post('/reminders', data)
export const markReminderDone = (id: string) => api.put(`/reminders/${id}/done`)

// TurfAI
export const generateBrochure = (prompt: string) =>
  api.post('/turf/generate', { feature: 'brochure_gen', prompt })
export const generateAdCopy = (prompt: string) =>
  api.post('/turf/generate', { feature: 'ad_gen', prompt })
export const generateDescription = (prompt: string) =>
  api.post('/turf/generate', { feature: 'description_gen', prompt })
export const analyzeCompetitors = (prompt: string) =>
  api.post('/turf/generate', { feature: 'competitor_analysis', prompt })

export default api
