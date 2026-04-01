import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { orgId: req.user!.orgId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ campaigns })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/campaigns
router.post('/', async (req, res) => {
  try {
    const { name, type, content } = req.body
    if (!name || !type) return res.status(400).json({ message: 'Name and type required' })
    const campaign = await prisma.campaign.create({
      data: { name, type, content: content ? JSON.stringify(content) : null, orgId: req.user!.orgId },
    })
    res.status(201).json({ campaign })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/campaigns/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const campaign = await prisma.campaign.findFirst({ where: { id: req.params.id, orgId: req.user!.orgId } })
    if (!campaign) return res.status(404).json({ message: 'Not found' })
    const updated = await prisma.campaign.update({ where: { id: req.params.id }, data: { status } })
    res.json({ campaign: updated })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
