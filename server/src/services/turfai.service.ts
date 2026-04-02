import axios from 'axios'
import FormData from 'form-data'
import { prisma } from '../lib/prisma'

export class TurfAIClient {
  /**
   * Trigger a TurfAI workflow synchronously.
   * Now updated for the { orgId, feature, prompt, input } envelope.
   */
  static async trigger(orgId: string, featureKey: string, prompt: any = "", input: any = {}): Promise<any> {
    const config = await prisma.turfAIConfig.findUnique({
      where: { orgId_featureKey: { orgId, featureKey } },
    })

    if (!config) {
      throw new Error(`No TurfAI webhook configured for feature "${featureKey}". Please add it in Settings.`)
    }

    try {
      const response = await axios.post(
        config.webhookUrl,
        input, // Send input directly as a flat JSON body as per documentation
        {
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': config.secret,
          },
          timeout: 60_000,
        }
      )

      const resData = response.data
      if (resData.success === false) {
        throw new Error(resData.error || 'TurfAI returned success: false')
      }

      return resData.data !== undefined ? resData.data : resData
    } catch (err: any) {
      if (err.response) {
        throw new Error(`TurfAI returned ${err.response.status}: ${JSON.stringify(err.response.data)}`)
      }
      throw new Error(`TurfAI request failed: ${err.message}`)
    }
  }

  /**
   * Trigger a TurfAI workflow with a file using multipart/form-data.
   */
  static async triggerWithFile(orgId: string, featureKey: string, file: any): Promise<any> {
    const config = await prisma.turfAIConfig.findUnique({
      where: { orgId_featureKey: { orgId, featureKey } },
    })

    if (!config) {
      throw new Error(`No TurfAI webhook configured for feature "${featureKey}". Please add it in Settings.`)
    }

    const form = new FormData()
    form.append('field_1', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    })

    try {
      const response = await axios.post(
        config.webhookUrl,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'x-webhook-secret': config.secret,
          },
          timeout: 60_000,
        }
      )

      return response.data
    } catch (err: any) {
      if (err.response) {
        throw new Error(`TurfAI trigger failed (${err.response.status}): ${JSON.stringify(err.response.data)}`)
      }
      throw new Error(`TurfAI trigger failed: ${err.message}`)
    }
  }

  /**
   * Check the status of a TurfAI workflow execution.
   */
  static async checkExecutionStatus(executionId: string, pollingToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://hackathonapi.turfai.in/api/api/workflow-executions/${executionId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${pollingToken}`,
          },
          timeout: 10_000,
        }
      )
      return response.data
    } catch (err: any) {
      if (err.response) {
        throw new Error(`TurfAI status check failed (${err.response.status}): ${JSON.stringify(err.response.data)}`)
      }
      throw new Error(`TurfAI status check failed: ${err.message}`)
    }
  }
}
