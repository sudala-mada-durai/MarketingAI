import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// GET /api/leads
router.get('/', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { orgId: req.user!.orgId },
      include: { reminders: { where: { isDone: false }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ leads })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/leads
router.post('/', async (req, res) => {
  try {
    const { name, company, email, phone, source, expectedValue } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })
    const lead = await prisma.lead.create({
      data: { name, company, email, phone, source, expectedValue, orgId: req.user!.orgId },
    })
    res.status(201).json({ lead })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/leads/:id
router.put('/:id', async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({ where: { id: req.params.id, orgId: req.user!.orgId } })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    const updated = await prisma.lead.update({ where: { id: req.params.id }, data: req.body })
    res.json({ lead: updated })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({ where: { id: req.params.id, orgId: req.user!.orgId } })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    await prisma.lead.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
