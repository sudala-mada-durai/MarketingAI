import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { TurfAIClient } from '../services/turfai.service'

const router = Router()
router.use(authenticate)

/**
 * GET /api/brain/assets
 * Fetch all indexed knowledge assets for the org.
 */
router.get('/assets', async (req, res) => {
  try {
    const assets = await prisma.knowledgeAsset.findMany({
      where: { orgId: req.user!.orgId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(assets)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

/**
 * POST /api/brain/upload
 * Mock file upload that triggers TurfAI RAG Indexing.
 */
router.post('/upload', async (req, res) => {
  try {
    const { name, type, size, url, text } = req.body
    if (!name || (!url && !text)) return res.status(400).json({ message: 'Name and (URL or Text) are required' })

    const asset = await prisma.knowledgeAsset.create({
      data: {
        name,
        type: type || 'TEXT',
        size: size || 0,
        url,
        orgId: req.user!.orgId,
        status: 'INDEXING'
      }
    })

    // Trigger NEW TurfAI RAG Indexing pattern (wf-marketing-brain-index)
    try {
      await TurfAIClient.trigger(
        req.user!.orgId, 
        'wf-marketing-brain-index', 
        `Index brand asset: ${name}`,
        {
          documents: [
            url ? { url, type: type || 'pdf' } : { text, type: 'text' }
          ]
        }
      )
      
      await prisma.knowledgeAsset.update({
        where: { id: asset.id },
        data: { status: 'READY' }
      })
    } catch (aiErr: any) {
      console.error('TurfAI indexing failed:', aiErr.message)
      await prisma.knowledgeAsset.update({
        where: { id: asset.id },
        data: { status: 'FAILED' }
      })
    }

    res.status(201).json(asset)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

/**
 * POST /api/brain/query
 * Strategy Chat: Query the Brand Brain using TurfAI RAG Query.
 */
router.post('/query', async (req, res) => {
  try {
    const { prompt, sessionId } = req.body
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' })

    const result = await TurfAIClient.trigger(
      req.user!.orgId,
      'wf-marketing-brain-query',
      prompt,
      { query: prompt } // Syncing with wf-marketing-brain-query input schema
    )

    // Result is unwrapped by TurfAIClient.data, so it should have { answer, citations }
    res.json({ result: result.answer || result })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
