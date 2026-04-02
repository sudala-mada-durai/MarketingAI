import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { TurfAIClient } from '../services/turfai.service'

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

// POST /api/leads/:id/summarize
router.post('/:id/summarize', async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({ 
      where: { id: req.params.id, orgId: req.user!.orgId } 
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    // Build timeline from notes (simplified for proto)
    const lead_timeline = [
      { date: lead.createdAt.toISOString(), event: 'Lead Created' },
      ...(lead.notes ? [{ date: lead.updatedAt.toISOString(), event: `Note: ${lead.notes}` }] : [])
    ]

    const result = await TurfAIClient.trigger(
      req.user!.orgId,
      'wf-lead-summarizer',
      `Summarize lead: ${lead.name}`,
      { lead_timeline }
    )

    res.json({ result: result.summary || result })
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
