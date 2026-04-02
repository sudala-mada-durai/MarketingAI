import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { TurfAIClient } from '../services/turfai.service'
import multer from 'multer'

const router = Router()
router.use(authenticate)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
})

/**
 * POST /api/docs/analyze
 * Upload a document → TurfAI → receive a summary.
 */
router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ message: 'File is required' })

    // Trigger TurfAI document analyzer workflow
    const response = await TurfAIClient.triggerWithFile(
      req.user!.orgId,
      'wf-doc-analyzer',
      file
    )

    // Handle async execution (polling)
    if (response && response.execution_id && response.polling_token) {
      const execId = String(response.execution_id)
      const pollToken = response.polling_token

      let summary: string | null = null
      const startTime = Date.now()

      while (Date.now() - startTime < 90_000) {
        try {
          const check = await TurfAIClient.checkExecutionStatus(execId, pollToken)
          if (check.data?.status === 'completed') {
            const outputs = check.data.outputs || {}
            summary =
              outputs.summary ||
              outputs.answer ||
              outputs.field_1 ||
              outputs.result ||
              JSON.stringify(outputs)
            break
          } else if (check.data?.status === 'failed') {
            return res.status(500).json({ message: 'TurfAI analysis failed' })
          }
        } catch (pollErr) {
          console.warn('Poll check failed:', pollErr)
        }
        await new Promise(r => setTimeout(r, 3000))
      }

      if (!summary) {
        return res.status(504).json({ message: 'Analysis timed out. Please try again.' })
      }

      return res.json({
        summary,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      })
    }

    // Synchronous response
    const summary =
      response?.summary ||
      response?.answer ||
      response?.field_1 ||
      response?.result ||
      (typeof response === 'string' ? response : JSON.stringify(response))

    return res.json({
      summary,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    })
  } catch (err: any) {
    console.error('Document analysis error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

export default router
