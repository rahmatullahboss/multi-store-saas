/**
 * Email Campaign Service
 * 
 * Handles campaign management and email scheduling:
 * - Create/update campaigns
 * - Send campaigns via queue
 * - Track campaign statistics
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { emailCampaigns, emailSubscribers, stores } from '../../db/schema';
import type { D1Database } from '@cloudflare/workers-types';

// Types
export interface CampaignData {
  name: string;
  subject: string;
  previewText?: string;
  content: string;
  scheduledAt?: Date;
}

export interface QueueMessage {
  type: 'campaign_email';
  campaignId: number;
  subscriberId: number;
  email: string;
  subject: string;
  content: string;
  storeName: string;
  unsubscribeUrl: string;
}

/**
 * Create campaign service with database connection
 */
export function createCampaignService(db: D1Database) {
  const drizzleDb = drizzle(db);

  return {
    /**
     * Get all campaigns for a store
     */
    async getCampaigns(storeId: number) {
      return drizzleDb
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.storeId, storeId))
        .orderBy(desc(emailCampaigns.createdAt));
    },

    /**
     * Get campaign by ID
     */
    async getCampaign(storeId: number, campaignId: number) {
      const results = await drizzleDb
        .select()
        .from(emailCampaigns)
        .where(
          and(
            eq(emailCampaigns.id, campaignId),
            eq(emailCampaigns.storeId, storeId)
          )
        )
        .limit(1);
      return results[0] || null;
    },

    /**
     * Create a new campaign
     */
    async createCampaign(storeId: number, userId: number, data: CampaignData) {
      const results = await drizzleDb
        .insert(emailCampaigns)
        .values({
          storeId,
          name: data.name,
          subject: data.subject,
          previewText: data.previewText,
          content: data.content,
          status: data.scheduledAt ? 'scheduled' : 'draft',
          scheduledAt: data.scheduledAt,
          createdBy: userId,
        })
        .returning();
      return results[0];
    },

    /**
     * Update campaign
     */
    async updateCampaign(storeId: number, campaignId: number, data: Partial<CampaignData>) {
      const results = await drizzleDb
        .update(emailCampaigns)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(emailCampaigns.id, campaignId),
            eq(emailCampaigns.storeId, storeId)
          )
        )
        .returning();
      return results[0];
    },

    /**
     * Delete campaign
     */
    async deleteCampaign(storeId: number, campaignId: number) {
      await drizzleDb
        .delete(emailCampaigns)
        .where(
          and(
            eq(emailCampaigns.id, campaignId),
            eq(emailCampaigns.storeId, storeId)
          )
        );
    },

    /**
     * Get subscriber count for a store
     */
    async getSubscriberCount(storeId: number) {
      const result = await drizzleDb
        .select({ count: count() })
        .from(emailSubscribers)
        .where(
          and(
            eq(emailSubscribers.storeId, storeId),
            eq(emailSubscribers.status, 'subscribed')
          )
        );
      return result[0]?.count || 0;
    },

    /**
     * Get all active subscribers for a store
     */
    async getSubscribers(storeId: number, status: 'subscribed' | 'unsubscribed' | 'all' = 'all') {
      if (status === 'all') {
        return drizzleDb
          .select()
          .from(emailSubscribers)
          .where(eq(emailSubscribers.storeId, storeId))
          .orderBy(desc(emailSubscribers.createdAt));
      }
      return drizzleDb
        .select()
        .from(emailSubscribers)
        .where(
          and(
            eq(emailSubscribers.storeId, storeId),
            eq(emailSubscribers.status, status)
          )
        )
        .orderBy(desc(emailSubscribers.createdAt));
    },

    /**
     * Add subscriber
     */
    async addSubscriber(storeId: number, email: string, name?: string, source?: string) {
      // Check if already exists
      const existing = await drizzleDb
        .select()
        .from(emailSubscribers)
        .where(
          and(
            eq(emailSubscribers.storeId, storeId),
            eq(emailSubscribers.email, email)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Resubscribe if unsubscribed
        if (existing[0].status === 'unsubscribed') {
          await drizzleDb
            .update(emailSubscribers)
            .set({ status: 'subscribed', updatedAt: new Date() })
            .where(eq(emailSubscribers.id, existing[0].id));
        }
        return existing[0];
      }

      const results = await drizzleDb
        .insert(emailSubscribers)
        .values({
          storeId,
          email,
          name,
          source: source || 'manual',
        })
        .returning();
      return results[0];
    },

    /**
     * Unsubscribe
     */
    async unsubscribe(storeId: number, email: string) {
      await drizzleDb
        .update(emailSubscribers)
        .set({ status: 'unsubscribed', updatedAt: new Date() })
        .where(
          and(
            eq(emailSubscribers.storeId, storeId),
            eq(emailSubscribers.email, email)
          )
        );
    },

    /**
     * Delete subscriber
     */
    async deleteSubscriber(storeId: number, subscriberId: number) {
      await drizzleDb
        .delete(emailSubscribers)
        .where(
          and(
            eq(emailSubscribers.id, subscriberId),
            eq(emailSubscribers.storeId, storeId)
          )
        );
    },

    /**
     * Queue campaign for sending
     */
    async queueCampaign(
      storeId: number,
      campaignId: number,
      queue: { send: (message: QueueMessage) => Promise<void> },
      storeName: string,
      baseUrl: string
    ) {
      // Get campaign
      const campaign = await this.getCampaign(storeId, campaignId);
      if (!campaign) throw new Error('Campaign not found');
      if (campaign.status === 'sent') throw new Error('Campaign already sent');

      // Get all active subscribers
      const subscribers = await this.getSubscribers(storeId, 'subscribed');
      if (subscribers.length === 0) throw new Error('No subscribers to send to');

      // Update campaign status
      await drizzleDb
        .update(emailCampaigns)
        .set({
          status: 'sending',
          recipientCount: subscribers.length,
          updatedAt: new Date(),
        })
        .where(eq(emailCampaigns.id, campaignId));

      // Queue each email
      for (const subscriber of subscribers) {
        await queue.send({
          type: 'campaign_email',
          campaignId,
          subscriberId: subscriber.id,
          email: subscriber.email,
          subject: campaign.subject,
          content: campaign.content,
          storeName,
          unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&store=${storeId}`,
        });
      }

      return { queued: subscribers.length };
    },

    /**
     * Mark campaign as sent
     */
    async markCampaignSent(campaignId: number, sentCount: number) {
      await drizzleDb
        .update(emailCampaigns)
        .set({
          status: 'sent',
          sentCount,
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emailCampaigns.id, campaignId));
    },

    /**
     * Increment campaign stats
     */
    async incrementCampaignStat(campaignId: number, stat: 'sent' | 'open' | 'click') {
      const fieldMap = {
        sent: emailCampaigns.sentCount,
        open: emailCampaigns.openCount,
        click: emailCampaigns.clickCount,
      };
      
      await drizzleDb
        .update(emailCampaigns)
        .set({
          [stat === 'sent' ? 'sentCount' : stat === 'open' ? 'openCount' : 'clickCount']: 
            sql`${fieldMap[stat]} + 1`,
        })
        .where(eq(emailCampaigns.id, campaignId));
    },

    /**
     * Import subscribers from array
     */
    async importSubscribers(storeId: number, subscribers: Array<{ email: string; name?: string }>) {
      let imported = 0;
      let skipped = 0;

      for (const sub of subscribers) {
        try {
          const existing = await drizzleDb
            .select()
            .from(emailSubscribers)
            .where(
              and(
                eq(emailSubscribers.storeId, storeId),
                eq(emailSubscribers.email, sub.email)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            await drizzleDb.insert(emailSubscribers).values({
              storeId,
              email: sub.email,
              name: sub.name,
              source: 'import',
            });
            imported++;
          } else {
            skipped++;
          }
        } catch {
          skipped++;
        }
      }

      return { imported, skipped };
    },
  };
}

export type CampaignService = ReturnType<typeof createCampaignService>;
