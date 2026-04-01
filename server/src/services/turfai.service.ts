import axios from 'axios'
import { prisma } from '../lib/prisma'

export class TurfAIClient {
  /**
   * Trigger a TurfAI workflow synchronously.
   * Looks up the webhook URL + secret from org's TurfAIConfig table.
   */
  static async trigger(orgId: string, featureKey: string, prompt: string): Promise<any> {
    const config = await prisma.turfAIConfig.findUnique({
      where: { orgId_featureKey: { orgId, featureKey } },
    })

    if (!config) {
      throw new Error(`No TurfAI webhook configured for feature "${featureKey}". Please add it in Settings.`)
    }

    try {
      const response = await axios.post(
        config.webhookUrl,
        { prompt, feature: featureKey, orgId },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': config.secret,
          },
          timeout: 60_000, // 60s timeout for AI generation
        }
      )
      return response.data
    } catch (err: any) {
      if (err.response) {
        throw new Error(`TurfAI returned ${err.response.status}: ${JSON.stringify(err.response.data)}`)
      }
      throw new Error(`TurfAI request failed: ${err.message}`)
    }
  }
}
