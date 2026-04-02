import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function stopPolling() {
  const assetId = 'b5d2095b-1b4b-40cb-a666-0f6aaf1c6e4c'
  
  try {
    const updated = await prisma.knowledgeAsset.update({
      where: { id: assetId },
      data: { status: 'FAILED' }
    })
    console.log('ASSET MARKED AS FAILED:', updated.id)
  } catch (err: any) {
    console.error('ERROR:', err.message)
  }
}

stopPolling()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
