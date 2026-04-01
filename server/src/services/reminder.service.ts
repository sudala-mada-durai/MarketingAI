import { prisma } from '../lib/prisma'
import { format } from 'date-fns'

export class ReminderService {
  /**
   * Periodically check for due/overdue reminders.
   * Logs a simulated notification for the demo.
   */
  static async startChecker() {
    console.log('⏰ Reminder Checker: Started...')
    // Check every 10 mins
    setInterval(async () => {
      try {
        const now = new Date()
        const dueReminders = await prisma.reminder.findMany({
          where: {
            dueDate: { lte: now },
            isDone: false
          },
          include: {
            lead: true,
            org: true
          }
        })

        if (dueReminders.length > 0) {
          console.log(`\n🔔 Reminder Checker: ${dueReminders.length} reminders due!`)
          for (const r of dueReminders) {
            console.log(`   - FOR: ${r.lead.name} (${r.org.name})`)
            console.log(`   - NOTE: "${r.note}"`)
            console.log(`   - ACTION: Simulated WhatsApp/Email notification sent.\n`)

            // In a real app, integrate with Twilio/SendGrid here.
            // Marking as done after notification for this demo:
            await prisma.reminder.update({
              where: { id: r.id },
              data: { isDone: true }
            })
          }
        }
      } catch (err: any) {
        console.error('❌ Reminder Checker Error:', err.message)
      }
    }, 600_000) // 10 minutes
  }
}
