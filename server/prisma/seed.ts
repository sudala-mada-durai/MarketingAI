/// <reference types="node" />
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Demo Org
  const org = await prisma.org.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'Acme Marketing Agency',
    },
  })

  // Create Admin User
  const hashed = await bcrypt.hash('password123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@acme.com',
      password: hashed,
      role: 'ADMIN',
      orgId: org.id,
    },
  })

  // Add some sample leads
  const leads = [
    { name: 'Rahul Sharma', company: 'TechNova Solutions', status: 'NEW', expectedValue: 45000 },
    { name: 'Priya Patel', company: 'GreenLeaf Organics', status: 'CONTACTED', expectedValue: 12000 },
    { name: 'Amit Singh', company: 'Global Logistics', status: 'QUALIFIED', expectedValue: 85000 },
    { name: 'Sarah Jones', company: 'Jones & Co', status: 'PROPOSAL_SENT', expectedValue: 30000 },
    { name: 'Vikram Reddy', company: 'Reddy Construction', status: 'CLOSED_WON', expectedValue: 150000 },
  ]

  for (const l of leads) {
    await prisma.lead.create({
      data: { ...l, orgId: org.id }
    })
  }

  console.log('✅ Seeding complete!')
  console.log('   Login: admin@acme.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
