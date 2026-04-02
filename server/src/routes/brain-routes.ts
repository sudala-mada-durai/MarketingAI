import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { TurfAIClient } from '../services/turfai.service'

const router = Router()
router.use(authenticate)

import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() })

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
 * Real file upload that triggers TurfAI RAG Indexing.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ message: 'File is required' })

    const asset = await prisma.knowledgeAsset.create({
      data: {
        name: file.originalname,
        type: file.mimetype.split('/')[1].toUpperCase(),
        size: file.size,
        orgId: req.user!.orgId,
        status: 'INDEXING'
      }
    })

    // Trigger REAL TurfAI RAG Indexing (wf-marketing-brain-index)
    try {
      const response = await TurfAIClient.triggerWithFile(
        req.user!.orgId,
        'wf-marketing-brain-index',
        file
      )

      // Update asset with polling info
      const execId = String(response.execution_id)
      const pollToken = response.polling_token

      let currentStatus = 'INDEXING'
      let finalUrl = null

      // Polling loop: Wait for completion for up to 60 seconds
      const startTime = Date.now()
      while (Date.now() - startTime < 60_000) {
        try {
          const check = await TurfAIClient.checkExecutionStatus(execId, pollToken)
          if (check.data.status === 'completed') {
            currentStatus = 'READY'
            finalUrl = check.data.outputs?.field_1_url || check.data.outputs?.url || null
            break
          } else if (check.data.status === 'failed') {
            currentStatus = 'FAILED'
            break
          }
        } catch (checkErr) {
          console.warn('Status check during upload loop failed:', checkErr)
        }
        await new Promise(r => setTimeout(r, 2000)) // Poll every 2s
      }

      const finalAsset = await prisma.knowledgeAsset.update({
        where: { id: asset.id },
        data: {
          executionId: execId,
          pollingToken: pollToken,
          status: currentStatus as any,
          url: finalUrl
        }
      })

      return res.status(201).json(finalAsset)
    } catch (aiErr: any) {
      console.error('TurfAI indexing failed to trigger:', aiErr.message)
      const failedAsset = await prisma.knowledgeAsset.update({
        where: { id: asset.id },
        data: { status: 'FAILED' }
      })
      return res.status(201).json(failedAsset)
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

/**
 * GET /api/brain/status/:id
 * Poll for TurfAI execution status.
 */
router.get('/status/:id', async (req, res) => {
  try {
    const asset = await prisma.knowledgeAsset.findUnique({
      where: { id: req.params.id }
    })

    if (!asset || asset.orgId !== req.user!.orgId) {
      return res.status(404).json({ message: 'Asset not found' })
    }

    if (asset.status !== 'INDEXING' || !asset.executionId || !asset.pollingToken) {
      return res.json(asset)
    }

    // Check TurfAI status
    try {
      const statusRes = await TurfAIClient.checkExecutionStatus(asset.executionId, asset.pollingToken)

      if (statusRes.data.status === 'completed') {
        const outputs = statusRes.data.outputs || {}
        // If the workflow output contains a field_1_url or similar, save it as the asset's public URL
        const url = outputs.field_1_url || outputs.url || null

        const updatedAsset = await prisma.knowledgeAsset.update({
          where: { id: asset.id },
          data: {
            status: 'READY',
            url: url
          }
        })
        return res.json(updatedAsset)
      } else if (statusRes.data.status === 'failed') {
        const updatedAsset = await prisma.knowledgeAsset.update({
          where: { id: asset.id },
          data: { status: 'FAILED' }
        })
        return res.json(updatedAsset)
      }

      res.json(asset) // Still indexing
    } catch (err: any) {
      console.error('Status check failed:', err.message)

      // If execution ID is not found (404), mark as FAILED to stop polling
      if (err.message.includes('404')) {
        const failedAsset = await prisma.knowledgeAsset.update({
          where: { id: asset.id },
          data: { status: 'FAILED' }
        })
        return res.json(failedAsset)
      }

      res.json(asset)
    }
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
      { field_1: prompt } // Using field_1 as standard input key from documentation
    )

    // Defensive: Result might be an async execution object instead of a direct answer string
    let finalResult = result

    if (result && result.execution_id && result.polling_token) {
      console.log('Async query detected, polling for results...')
      // Poll with a 30s timeout
      const start = Date.now()
      while (Date.now() - start < 30_000) {
        try {
          const poll = await TurfAIClient.checkExecutionStatus(result.execution_id, result.polling_token)
          if (poll.data.status === 'completed') {
            finalResult = poll.data.outputs?.answer || poll.data.outputs || "Success (no explicit answer field)"
            break
          } else if (poll.data.status === 'failed') {
            finalResult = "Query failed to execute in TurfAI."
            break
          }
        } catch (err) {
          console.error('Polling for chat answer failed:', err)
        }
        await new Promise(r => setTimeout(r, 2000)) // Poll every 2s
      }

      if (typeof finalResult !== 'string' && finalResult.execution_id) {
        finalResult = "Query is taking longer than expected. Please try again in a few seconds."
      }
    }

    const answer = typeof finalResult === 'string' ? finalResult : (finalResult.answer || JSON.stringify(finalResult))
    res.json({ result: answer })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

/**
 * DELETE /api/brain/assets/:id
 * Remove a knowledge asset.
 */
router.delete('/assets/:id', async (req, res) => {
  try {
    const asset = await prisma.knowledgeAsset.findFirst({
      where: { id: req.params.id, orgId: req.user!.orgId }
    })
    if (!asset) return res.status(404).json({ message: 'Asset not found' })

    await prisma.knowledgeAsset.delete({ where: { id: asset.id } })
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

export default router
