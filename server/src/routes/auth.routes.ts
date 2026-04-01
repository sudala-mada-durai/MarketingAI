import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = Router()
const SECRET = process.env.JWT_SECRET || 'dev-secret'

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, orgName } = req.body
    if (!name || !email || !password || !orgName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 12)

    // Create org + admin user in a transaction
    const { org, user } = await prisma.$transaction(async (tx) => {
      const org = await tx.org.create({ data: { name: orgName } })
      const user = await tx.user.create({
        data: { name, email, password: hashed, role: 'ADMIN', orgId: org.id },
      })
      return { org, user }
    })

    const token = jwt.sign({ id: user.id, orgId: org.id, role: user.role }, SECRET, { expiresIn: '7d' })
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, orgId: org.id, orgName: org.name },
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email }, include: { org: true } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, orgId: user.orgId, role: user.role }, SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, orgId: user.orgId, orgName: user.org.name },
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
