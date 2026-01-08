/**
 * Email Automation Service
 * 
 * Handles trigger-based email workflows:
 * - order_placed: After successful order
 * - cart_abandoned: After cart abandonment (30-60 min)
 * - signup: After new user signup
 * - order_delivered: After delivery confirmation
 */

import { drizzle } from 'drizzle-orm/d1';
import { emailAutomations, emailAutomationSteps, emailQueue, stores } from '@db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { createEmailService } from './email.server';

export type EmailTrigger = 'order_placed' | 'order_delivered' | 'cart_abandoned' | 'signup';

export interface TriggerContext {
  storeId: number;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, unknown>;
}

/**
 * Trigger automation for an event
 */
export async function triggerAutomation(
  d1: D1Database,
  trigger: EmailTrigger,
  context: TriggerContext
): Promise<void> {
  const db = drizzle(d1);

  // Find active automations for this trigger
  const automations = await db
    .select()
    .from(emailAutomations)
    .where(
      and(
        eq(emailAutomations.storeId, context.storeId),
        eq(emailAutomations.trigger, trigger),
        eq(emailAutomations.isActive, true)
      )
    );

  for (const automation of automations) {
    // Get all steps for this automation
    const steps = await db
      .select()
      .from(emailAutomationSteps)
      .where(eq(emailAutomationSteps.automationId, automation.id))
      .orderBy(emailAutomationSteps.stepOrder);

    // Queue each step
    for (const step of steps) {
      const scheduledAt = new Date(Date.now() + (step.delayMinutes || 0) * 60 * 1000);
      
      await db.insert(emailQueue).values({
        storeId: context.storeId,
        stepId: step.id,
        recipientEmail: context.customerEmail,
        scheduledAt,
        status: 'pending',
        metadata: JSON.stringify({
          ...context.metadata,
          customerName: context.customerName,
          automationId: automation.id,
          automationName: automation.name,
        }),
      });
    }
  }
}

/**
 * Process email queue (called by scheduled worker or cron)
 * Returns number of emails sent
 */
export async function processEmailQueue(
  d1: D1Database,
  resendApiKey: string,
  batchSize = 50
): Promise<{ sent: number; failed: number }> {
  const db = drizzle(d1);
  const now = new Date();
  
  // Fetch pending emails that are due
  const pendingEmails = await db
    .select()
    .from(emailQueue)
    .where(
      and(
        eq(emailQueue.status, 'pending'),
        lte(emailQueue.scheduledAt, now)
      )
    )
    .limit(batchSize);

  let sent = 0;
  let failed = 0;

  const emailService = createEmailService(resendApiKey);

  for (const email of pendingEmails) {
    try {
      // Get step details
      const step = await db
        .select()
        .from(emailAutomationSteps)
        .where(eq(emailAutomationSteps.id, email.stepId!))
        .limit(1);

      if (step.length === 0) {
        // Mark as failed if step not found
        await db.update(emailQueue)
          .set({ status: 'failed' })
          .where(eq(emailQueue.id, email.id));
        failed++;
        continue;
      }

      const stepData = step[0];
      const metadata = email.metadata ? JSON.parse(email.metadata) : {};

      // Get store for sender info
      const store = await db
        .select({ name: stores.name, email: stores.contactEmail })
        .from(stores)
        .where(eq(stores.id, email.storeId))
        .limit(1);

      // Replace template variables
      const subject = replaceTemplateVars(stepData.subject, metadata);
      const content = replaceTemplateVars(stepData.content, metadata);

      // Send email
      await emailService.sendEmail({
        to: email.recipientEmail,
        from: `${store[0]?.name || 'Store'} <noreply@${emailService.domain || 'example.com'}>`,
        subject,
        html: content,
      });

      // Mark as sent
      await db.update(emailQueue)
        .set({ status: 'sent', sentAt: now })
        .where(eq(emailQueue.id, email.id));

      // Update step stats
      await d1.prepare(
        'UPDATE email_automation_steps SET sent_count = sent_count + 1 WHERE id = ?'
      ).bind(stepData.id).run();

      // Update automation stats
      await d1.prepare(
        'UPDATE email_automations SET total_sent = total_sent + 1 WHERE id = ?'
      ).bind(metadata.automationId).run();

      sent++;
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error);
      
      // Mark as failed
      await db.update(emailQueue)
        .set({ status: 'failed' })
        .where(eq(emailQueue.id, email.id));
      
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Replace template variables in content
 * Supports: {{customer_name}}, {{order_number}}, {{total}}, etc.
 */
function replaceTemplateVars(template: string, metadata: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = metadata[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    // Try common transformations
    if (key === 'customer_name' && metadata.customerName) {
      return String(metadata.customerName);
    }
    if (key === 'order_number' && metadata.orderNumber) {
      return String(metadata.orderNumber);
    }
    return match; // Keep original if not found
  });
}

/**
 * Get default email templates for each trigger type
 */
export function getDefaultTemplate(trigger: EmailTrigger): { subject: string; content: string } {
  switch (trigger) {
    case 'order_placed':
      return {
        subject: 'অর্ডার কনফার্মেশন - {{order_number}}',
        content: `
          <h1>ধন্যবাদ {{customer_name}}! 🎉</h1>
          <p>আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</p>
          <p><strong>অর্ডার নম্বর:</strong> {{order_number}}</p>
          <p><strong>মোট:</strong> ৳{{total}}</p>
          <p>শীঘ্রই আমরা আপনার সাথে যোগাযোগ করবো।</p>
        `,
      };
    case 'cart_abandoned':
      return {
        subject: 'আপনার কার্ট অপেক্ষা করছে! 🛒',
        content: `
          <h1>হ্যালো {{customer_name}}! 👋</h1>
          <p>মনে হচ্ছে আপনি কিছু পণ্য কার্টে রেখে গেছেন।</p>
          <p>এখনই অর্ডার সম্পন্ন করুন এবং স্পেশাল ডিসকাউন্ট পান!</p>
          <a href="{{cart_link}}" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            কার্টে ফিরে যান →
          </a>
        `,
      };
    case 'signup':
      return {
        subject: 'স্বাগতম! 🎊',
        content: `
          <h1>স্বাগতম {{customer_name}}! 🎉</h1>
          <p>আমাদের সাথে যুক্ত হওয়ার জন্য ধন্যবাদ!</p>
          <p>আজই আপনার প্রথম অর্ডার দিন এবং স্পেশাল অফার উপভোগ করুন।</p>
        `,
      };
    case 'order_delivered':
      return {
        subject: 'আপনার অর্ডার ডেলিভারি হয়েছে! 📦',
        content: `
          <h1>ডেলিভারি সম্পন্ন! 🎊</h1>
          <p>প্রিয় {{customer_name}},</p>
          <p>আপনার অর্ডার ({{order_number}}) সফলভাবে ডেলিভারি হয়েছে।</p>
          <p>আপনার অভিজ্ঞতা কেমন ছিল? আমাদের জানান!</p>
        `,
      };
  }
}

/**
 * Cancel pending emails for a specific recipient
 * Used when cart is recovered, etc.
 */
export async function cancelPendingEmails(
  d1: D1Database,
  storeId: number,
  recipientEmail: string,
  trigger?: EmailTrigger
): Promise<number> {
  const db = drizzle(d1);
  
  // Get automation IDs for this trigger if specified
  let automationIds: number[] = [];
  if (trigger) {
    const automations = await db
      .select({ id: emailAutomations.id })
      .from(emailAutomations)
      .where(
        and(
          eq(emailAutomations.storeId, storeId),
          eq(emailAutomations.trigger, trigger)
        )
      );
    automationIds = automations.map(a => a.id);
  }

  // Cancel pending emails
  const result = await d1.prepare(
    trigger && automationIds.length > 0
      ? `UPDATE email_queue SET status = 'cancelled' WHERE store_id = ? AND recipient_email = ? AND status = 'pending' AND step_id IN (SELECT id FROM email_automation_steps WHERE automation_id IN (${automationIds.join(',')}))`
      : `UPDATE email_queue SET status = 'cancelled' WHERE store_id = ? AND recipient_email = ? AND status = 'pending'`
  ).bind(storeId, recipientEmail).run();

  return result.meta.changes || 0;
}
