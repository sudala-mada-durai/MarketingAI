import axios from 'axios'
import { prisma } from '../lib/prisma'

export class DistributionService {
  /**
   * Mocked WhatsApp Business API distribution.
   * Logs activity for now.
   */
  static async sendWhatsApp(orgId: string, leadId: string, content: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead || !lead.phone) throw new Error('Lead has no phone number')

    console.log(`\n💬 WhatsApp Distribution: Sending to ${lead.phone}...`)
    console.log(`   CONTENT: "${content}"`)
    
    // Simulating API call to Meta Graph API
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log(`   ✅ WhatsApp Sent.\n`)
    return { success: true, messageId: `wa-mt-${Date.now()}` }
  }

  /**
   * Mocked Email distribution (SendGrid/Postmark).
   * Logs activity for now.
   */
  static async sendEmail(orgId: string, leadId: string, subject: string, body: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead || !lead.email) throw new Error('Lead has no email')

    console.log(`\n📧 Email Distribution: Sending to ${lead.email}...`)
    console.log(`   SUBJECT: "${subject}"`)
    
    // Simulating SendGrid API call
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log(`   ✅ Email Sent.\n`)
    return { success: true, messageId: `em-sg-${Date.now()}` }
  }

  /**
   * Distribute a campaign to all leads in an org.
   * Uses simple batching.
   */
  static async distributeCampaign(orgId: string, campaignId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
    if (!campaign) throw new Error('Campaign not found')

    const leads = await prisma.lead.findMany({ where: { orgId } })
    console.log(`📣 Distribution: Starting campaign "${campaign.name}" to ${leads.length} leads...`)

    // Simple sequential processing for demo
    for (const lead of leads) {
      if (campaign.type === 'WHATSAPP' && lead.phone) {
        await this.sendWhatsApp(orgId, lead.id, String(campaign.content))
      } else if (campaign.type === 'EMAIL' && lead.email) {
        await this.sendEmail(orgId, lead.id, `Update from Acme`, String(campaign.content))
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'SENT' }
    })

    return { total: leads.length, status: 'SENT' }
  }
}
