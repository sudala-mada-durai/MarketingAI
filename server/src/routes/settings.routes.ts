import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, requireRole } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// GET /api/settings/turf
router.get('/turf', async (req, res) => {
  try {
    const configs = await prisma.turfAIConfig.findMany({
      where: { orgId: req.user!.orgId },
      select: { featureKey: true, webhookUrl: true, updatedAt: true },
    })
    res.json({ configs })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/settings/turf  - upsert a webhook config
router.post('/turf', requireRole('ADMIN'), async (req, res) => {
  try {
    const { featureKey, webhookUrl, secret } = req.body
    if (!featureKey || !webhookUrl) return res.status(400).json({ message: 'featureKey and webhookUrl required' })

    const config = await prisma.turfAIConfig.upsert({
      where: { orgId_featureKey: { orgId: req.user!.orgId, featureKey } },
      update: { webhookUrl, ...(secret ? { secret } : {}) },
      create: { orgId: req.user!.orgId, featureKey, webhookUrl, secret: secret || '' },
    })
    res.json({ config: { featureKey: config.featureKey, webhookUrl: config.webhookUrl } })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
