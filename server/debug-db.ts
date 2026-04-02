import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgs = await prisma.org.findMany()
  const users = await prisma.user.findMany()
  console.log('ORGS:', orgs)
  console.log('USERS:', users)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
