import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import leadRoutes from './routes/leads.routes'
import campaignRoutes from './routes/campaigns.routes'
import reminderRoutes from './routes/reminders.routes'
import turfRoutes from './routes/turf.routes'
import settingsRoutes from './routes/settings.routes'
import brainRoutes from './routes/brain-routes'
import docsRoutes from './routes/docs.routes'
import { ReminderService } from './services/reminder.service'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/turf', turfRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/brain', brainRoutes)
app.use('/api/docs', docsRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.listen(PORT, async () => {
  console.log(`\n🚀 MarketingOS Server running on http://localhost:${PORT}`)
  console.log(`   Database: SQLite (dev.db)`)
  console.log(`   TurfAI: Synchronous webhook mode\n`)

  // Initialize Services
  await ReminderService.startChecker()
})
