import axios from 'axios'
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
        { 
          orgId,
          feature: featureKey,
          prompt, 
          input
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': config.secret,
          },
          timeout: 60_000, // 60s timeout for AI generation
        }
      )

      const resData = response.data
      
      // If the response follows the { success, data, error } pattern, unwrap it.
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
}
