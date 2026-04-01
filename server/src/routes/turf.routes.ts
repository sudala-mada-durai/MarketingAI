import { Router } from 'express'
import { TurfAIClient } from '../services/turfai.service'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()
router.use(authenticate)

// POST /api/turf/generate
router.post('/generate', async (req, res) => {
  try {
    const { feature, prompt } = req.body
    if (!feature || !prompt) return res.status(400).json({ message: 'feature and prompt are required' })

    const result = await TurfAIClient.trigger(req.user!.orgId, feature, prompt)
    res.json({ result, feature })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/settings/turf
router.get('/configs', async (req, res) => {
  try {
    const configs = await prisma.turfAIConfig.findMany({
      where: { orgId: req.user!.orgId },
      select: { featureKey: true, webhookUrl: true, createdAt: true },
    })
    res.json({ configs })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
