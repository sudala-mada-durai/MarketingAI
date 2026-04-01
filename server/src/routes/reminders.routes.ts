import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// GET /api/reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { orgId: req.user!.orgId },
      include: { lead: { select: { name: true, company: true } } },
      orderBy: { dueDate: 'asc' },
    })
    res.json({ reminders })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/reminders
router.post('/', async (req, res) => {
  try {
    const { note, dueDate, leadId } = req.body
    if (!note || !dueDate || !leadId) return res.status(400).json({ message: 'note, dueDate, leadId required' })
    // Verify lead belongs to org
    const lead = await prisma.lead.findFirst({ where: { id: leadId, orgId: req.user!.orgId } })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    const reminder = await prisma.reminder.create({
      data: { note, dueDate: new Date(dueDate), leadId, orgId: req.user!.orgId },
    })
    res.status(201).json({ reminder })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/reminders/:id/done
router.put('/:id/done', async (req, res) => {
  try {
    const reminder = await prisma.reminder.findFirst({ where: { id: req.params.id, orgId: req.user!.orgId } })
    if (!reminder) return res.status(404).json({ message: 'Not found' })
    const updated = await prisma.reminder.update({ where: { id: req.params.id }, data: { isDone: true } })
    res.json({ reminder: updated })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
