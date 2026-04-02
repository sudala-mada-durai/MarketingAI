import { Router } from 'express'
import { TurfAIClient } from '../services/turfai.service'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()
router.use(authenticate)

// POST /api/turf/generate
router.post('/generate', async (req, res) => {
  try {
    const { feature, prompt, input } = req.body
    if (!feature) return res.status(400).json({ message: 'feature is required' })

    // Auto-map simple prompts to structured inputs for specific workflows if needed
    let finalInput = input || {}
    
    if (feature === 'wf-brochure-generator' && !input) {
      finalInput = { product_specs: { name: 'Product', description: prompt }, tone: 'professional' }
    } else if (feature === 'wf-ad-copy-generator' && !input) {
      finalInput = { product: prompt, platforms: ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'] }
    }

    const result = await TurfAIClient.trigger(req.user!.orgId, feature, prompt, finalInput)
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
