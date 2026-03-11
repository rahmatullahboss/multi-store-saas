/**
 * Subscription Cron Worker
 *
 * Runs daily at 9:00 AM BDT (3:00 AM UTC) to manage subscription lifecycle:
 * 1. Send warning emails 3 days before expiration
 * 2. Mark subscriptions as past_due on expiration day
 * 3. Downgrade to Free plan and disable store after 7-day grace period
 */

import { Resend } from 'resend';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  SAAS_DOMAIN: string;
}

interface Store {
  id: number;
  name: string;
  planType: string;
  subscriptionStatus: string;
  subscriptionEndDate: number | null;
  ownerEmail: string | null;
  ownerName: string | null;
}

// Email templates
function getExpiringEmailHtml(storeName: string, daysLeft: number, endDate: Date): string {
  const formattedDate = endDate.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">⏰ Subscription Expiring Soon</h1>
      </div>
      
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Your subscription for <strong>${storeName}</strong> will expire in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Expiration Date:</strong> ${formattedDate}</p>
        </div>
        
        <p style="color: #6b7280;">To continue enjoying all features and keep your store active, please renew your subscription before the expiration date.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://app.ozzyl.com/app/billing" style="display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Renew Now</a>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
          If you don't renew, your store will be downgraded to the Free plan after a 7-day grace period.
        </p>
      </div>
    </div>
  `;
}

function getExpiredEmailHtml(storeName: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">⚠️ Subscription Expired</h1>
      </div>
      
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Your subscription for <strong>${storeName}</strong> has expired.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Grace Period:</strong> You have 7 days to renew before your store is downgraded to the Free plan.</p>
        </div>
        
        <p style="color: #6b7280;">During this grace period, your store remains fully functional. However, if you don't renew within 7 days:</p>
        
        <ul style="color: #6b7280; padding-left: 20px;">
          <li>Your plan will be downgraded to Free</li>
          <li>Products exceeding Free plan limits may become hidden</li>
          <li>Premium features will be disabled</li>
        </ul>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://app.ozzyl.com/app/billing" style="display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Renew Now</a>
        </div>
      </div>
    </div>
  `;
}

function getDowngradedEmailHtml(storeName: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #6b7280, #4b5563); border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">📉 Plan Downgraded</h1>
      </div>
      
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Your store <strong>${storeName}</strong> has been downgraded to the <strong>Free</strong> plan.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-size: 14px; color: #374151;">Your subscription expired and the 7-day grace period has ended.</p>
        </div>
        
        <p style="color: #6b7280;">On the Free plan, you have access to:</p>
        
        <ul style="color: #6b7280; padding-left: 20px;">
          <li>Up to 20 products</li>
          <li>50 orders per month</li>
          <li>Basic store features</li>
        </ul>
        
        <p style="color: #6b7280;">To restore all your features and access your full product catalog, upgrade your plan anytime.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://app.ozzyl.com/app/upgrade" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Upgrade Now</a>
        </div>
      </div>
    </div>
  `;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const startTime = new Date().toISOString();
    console.log('[SUBSCRIPTION-CRON] Starting scheduled task at', startTime);

    const now = Date.now();
    const nowDate = new Date(now);
    const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Initialize email service
    const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

    if (!resend) {
      console.warn('[SUBSCRIPTION-CRON] RESEND_API_KEY not set, emails will not be sent');
    }

    try {
      // =======================================================================
      // 1. EXPIRING IN 3 DAYS - Send warning email (only if not already sent)
      // =======================================================================
      const expiringStores = await env.DB.prepare(`
        SELECT 
          s.id,
          s.name,
          s.plan_type as planType,
          s.subscription_status as subscriptionStatus,
          s.subscription_end_date as subscriptionEndDate,
          u.email as ownerEmail,
          u.name as ownerName
        FROM stores s
        LEFT JOIN users u ON u.store_id = s.id
        WHERE s.subscription_end_date IS NOT NULL
          AND s.subscription_end_date > ?
          AND s.subscription_end_date <= ?
          AND s.plan_type != 'free'
          AND s.subscription_status = 'active'
          AND s.deleted_at IS NULL
      `)
        .bind(now, threeDaysFromNow)
        .all<Store>();

      console.log(`[SUBSCRIPTION-CRON] Found ${expiringStores.results?.length || 0} stores expiring in 3 days`);

      const section1Promises: Promise<any>[] = [];
      for (const store of expiringStores.results || []) {
        if (!store.ownerEmail || !resend) continue;

        const endDate = new Date(store.subscriptionEndDate!);
        const daysLeft = Math.ceil((store.subscriptionEndDate! - now) / (24 * 60 * 60 * 1000));

        section1Promises.push(
          resend.emails.send({
            from: 'Ozzyl <contact@ozzyl.com>',
            to: [store.ownerEmail],
            subject: `⏰ Your ${store.name} subscription expires in ${daysLeft} days`,
            html: getExpiringEmailHtml(store.name, daysLeft, endDate),
          })
            .then(() => {
              console.log(`[SUBSCRIPTION-CRON] Sent expiring email to ${store.ownerEmail} for store ${store.id}`);
            })
            .catch((emailError) => {
              console.error(`[SUBSCRIPTION-CRON] Failed to send email to ${store.ownerEmail}:`, emailError);
            })
        );
      }
      await Promise.allSettled(section1Promises);

      // =======================================================================
      // 2. EXPIRED TODAY - Mark as past_due, send expired email
      // =======================================================================
      const expiredToday = await env.DB.prepare(`
        SELECT 
          s.id,
          s.name,
          s.plan_type as planType,
          s.subscription_status as subscriptionStatus,
          s.subscription_end_date as subscriptionEndDate,
          u.email as ownerEmail,
          u.name as ownerName
        FROM stores s
        LEFT JOIN users u ON u.store_id = s.id
        WHERE s.subscription_end_date IS NOT NULL
          AND s.subscription_end_date <= ?
          AND s.plan_type != 'free'
          AND s.subscription_status = 'active'
          AND s.deleted_at IS NULL
      `)
        .bind(now)
        .all<Store>();

      console.log(`[SUBSCRIPTION-CRON] Found ${expiredToday.results?.length || 0} stores expired today`);

      const section2UpdateStmts: D1PreparedStatement[] = [];
      const section2EmailPromises: Promise<any>[] = [];

      for (const store of expiredToday.results || []) {
        // Update status to past_due
        section2UpdateStmts.push(
          env.DB.prepare(`
            UPDATE stores
            SET subscription_status = 'past_due', updated_at = ?
            WHERE id = ?
          `).bind(nowDate.toISOString(), store.id)
        );

        // Send expired email
        if (store.ownerEmail && resend) {
          section2EmailPromises.push(
            resend.emails.send({
              from: 'Ozzyl <contact@ozzyl.com>',
              to: [store.ownerEmail],
              subject: `⚠️ Your ${store.name} subscription has expired`,
              html: getExpiredEmailHtml(store.name),
            })
              .then(() => {
                console.log(`[SUBSCRIPTION-CRON] Sent expired email to ${store.ownerEmail}`);
              })
              .catch((emailError) => {
                console.error(`[SUBSCRIPTION-CRON] Failed to send expired email:`, emailError);
              })
          );
        }
      }

      if (section2UpdateStmts.length > 0) {
        await env.DB.batch(section2UpdateStmts);
        console.log(`[SUBSCRIPTION-CRON] Batched marked ${section2UpdateStmts.length} stores as past_due`);
      }
      await Promise.allSettled(section2EmailPromises);

      // =======================================================================
      // 3. EXPIRED 7+ DAYS AGO - Downgrade to Free, disable store
      // =======================================================================
      const expiredOverGrace = await env.DB.prepare(`
        SELECT 
          s.id,
          s.name,
          s.plan_type as planType,
          s.subscription_status as subscriptionStatus,
          s.subscription_end_date as subscriptionEndDate,
          u.email as ownerEmail,
          u.name as ownerName
        FROM stores s
        LEFT JOIN users u ON u.store_id = s.id
        WHERE s.subscription_end_date IS NOT NULL
          AND s.subscription_end_date <= ?
          AND s.plan_type != 'free'
          AND s.subscription_status = 'past_due'
          AND s.deleted_at IS NULL
      `)
        .bind(sevenDaysAgo)
        .all<Store>();

      console.log(`[SUBSCRIPTION-CRON] Found ${expiredOverGrace.results?.length || 0} stores past grace period`);

      const section3UpdateStmts: D1PreparedStatement[] = [];
      const section3EmailPromises: Promise<any>[] = [];

      for (const store of expiredOverGrace.results || []) {
        // Downgrade to Free plan
        section3UpdateStmts.push(
          env.DB.prepare(`
            UPDATE stores
            SET plan_type = 'free',
                subscription_status = 'canceled',
                updated_at = ?
            WHERE id = ?
          `).bind(nowDate.toISOString(), store.id)
        );

        // Send downgraded email
        if (store.ownerEmail && resend) {
          section3EmailPromises.push(
            resend.emails.send({
              from: 'Ozzyl <contact@ozzyl.com>',
              to: [store.ownerEmail],
              subject: `📉 Your ${store.name} has been downgraded to Free`,
              html: getDowngradedEmailHtml(store.name),
            })
              .then(() => {
                console.log(`[SUBSCRIPTION-CRON] Sent downgrade email to ${store.ownerEmail}`);
              })
              .catch((emailError) => {
                console.error(`[SUBSCRIPTION-CRON] Failed to send downgrade email:`, emailError);
              })
          );
        }
      }

      if (section3UpdateStmts.length > 0) {
        await env.DB.batch(section3UpdateStmts);
        console.log(`[SUBSCRIPTION-CRON] Batched downgraded ${section3UpdateStmts.length} stores to Free plan`);
      }
      await Promise.allSettled(section3EmailPromises);

      console.log('[SUBSCRIPTION-CRON] Completed scheduled task');
    } catch (error) {
      console.error('[SUBSCRIPTION-CRON] Error:', error);
      throw error;
    }
  },
};

