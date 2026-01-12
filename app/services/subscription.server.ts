/**
 * Subscription Management Service
 * 
 * Handles subscription lifecycle events:
 * - Plan upgrades
 * - Plan downgrades (with custom domain removal)
 * - Subscription expiration
 * 
 * CRITICAL: This service enforces cost-conscious logic.
 * Free users must not occupy Cloudflare custom hostname slots.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import type { PlanType } from '~/utils/plans.server';

// Environment variables interface
interface SubscriptionEnv {
  DB: D1Database;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
  RESEND_API_KEY?: string;
}

// Downgrade result interface
interface DowngradeResult {
  success: boolean;
  domainRemoved?: string;
  error?: string;
}

// ============================================================================
// MAIN: Handle subscription downgrade
// ============================================================================
/**
 * Handle store downgrade to free plan.
 * 
 * CRITICAL LOGIC:
 * 1. Check if store has a custom domain
 * 2. If yes, remove it from Cloudflare (if API token available)
 * 3. Clear customDomain in database
 * 4. Send notification email to store owner
 * 
 * @param env - Environment bindings
 * @param storeId - Store ID to downgrade
 * @returns Result of the downgrade operation
 */
export async function handleDowngrade(
  env: SubscriptionEnv,
  storeId: number
): Promise<DowngradeResult> {
  const db = drizzle(env.DB);

  try {
    // Get store details
    const storeResult = await db
      .select({
        name: stores.name,
        customDomain: stores.customDomain,
        planType: stores.planType,
      })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    const store = storeResult[0];
    if (!store) {
      return { success: false, error: 'Store not found' };
    }

    // If no custom domain, nothing to do
    if (!store.customDomain) {
      console.log(`[DOWNGRADE] Store ${storeId} has no custom domain. No action needed.`);
      return { success: true };
    }

    const domain = store.customDomain;
    console.log(`[DOWNGRADE] Store ${storeId} has custom domain: ${domain}. Initiating removal.`);

    // Step 1: Remove from Cloudflare (if API token available)
    if (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ZONE_ID) {
      const cfResult = await removeCloudflareHostname(
        env.CLOUDFLARE_API_TOKEN,
        env.CLOUDFLARE_ZONE_ID,
        domain
      );
      
      if (!cfResult.success) {
        console.error(`[DOWNGRADE] Failed to remove Cloudflare hostname: ${cfResult.error}`);
        // Continue with database cleanup even if Cloudflare fails
        // Admin can manually clean up Cloudflare
      } else {
        console.log(`[DOWNGRADE] Successfully removed ${domain} from Cloudflare`);
      }
    } else {
      console.warn(
        `[DOWNGRADE] Cloudflare API not configured. Domain ${domain} must be removed manually.`
      );
    }

    // Step 2: Clear custom domain in database
    await db.update(stores).set({
      customDomain: null,
      customDomainStatus: 'none',
      customDomainRequest: null,
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));

    console.log(`[DOWNGRADE] Cleared custom domain from database for store ${storeId}`);

    // Step 3: Send notification email
    if (env.RESEND_API_KEY) {
      await sendDomainDisconnectedEmail(env.RESEND_API_KEY, db, storeId, domain, store.name);
    }

    // Step 4: Update plan type to free
    await db.update(stores).set({
      planType: 'free',
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));

    return {
      success: true,
      domainRemoved: domain,
    };
  } catch (error) {
    console.error(`[DOWNGRADE] Error handling downgrade for store ${storeId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Cloudflare API: Remove custom hostname
// ============================================================================
async function removeCloudflareHostname(
  apiToken: string,
  zoneId: string,
  hostname: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, find the hostname ID
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!listResponse.ok) {
      const errorData = await listResponse.json() as { errors?: Array<{ message: string }> };
      return {
        success: false,
        error: `Failed to list hostnames: ${errorData.errors?.[0]?.message || listResponse.statusText}`,
      };
    }

    const listData = await listResponse.json() as { result: Array<{ id: string; hostname: string }> };
    const hostnameRecord = listData.result?.find(h => h.hostname === hostname);

    if (!hostnameRecord) {
      // Hostname not found in Cloudflare - might have been removed already
      console.log(`[CLOUDFLARE] Hostname ${hostname} not found in zone. May have been removed already.`);
      return { success: true };
    }

    // Delete the hostname
    const deleteResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${hostnameRecord.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json() as { errors?: Array<{ message: string }> };
      return {
        success: false,
        error: `Failed to delete hostname: ${errorData.errors?.[0]?.message || deleteResponse.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Email: Send domain disconnection notification
// ============================================================================
async function sendDomainDisconnectedEmail(
  resendApiKey: string,
  db: ReturnType<typeof drizzle>,
  storeId: number,
  domain: string,
  storeName: string
): Promise<void> {
  try {
    // Get store owner email
    const owner = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.storeId, storeId))
      .limit(1);

    if (!owner[0]?.email) {
      console.warn(`[EMAIL] No owner found for store ${storeId}. Cannot send notification.`);
      return;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: 'DigitalCare <notifications@ozzyl.com>',
      to: owner[0].email,
      subject: 'Your Custom Domain Has Been Disconnected',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Custom Domain Disconnected</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hi ${owner[0].name || 'there'},</p>
            
            <p>Your custom domain <strong style="color: #059669; font-family: monospace;">${domain}</strong> has been disconnected from your store <strong>${storeName}</strong>.</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>Reason:</strong> Your subscription has been downgraded to the Free plan.</p>
            </div>
            
            <p>Your store is still accessible via your free subdomain:</p>
            <p style="text-align: center;">
              <a href="https://${storeName}.ozzyl.com" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Visit Your Store
              </a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            
            <p><strong>Want your custom domain back?</strong></p>
            <p>Upgrade to the Starter plan to reconnect your custom domain and unlock premium features.</p>
            
            <p style="text-align: center;">
              <a href="https://ozzyl.com/app/upgrade" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Upgrade Now
              </a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions, please contact us at <a href="mailto:support@ozzyl.com" style="color: #059669;">support@ozzyl.com</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2026 DigitalCare. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`[EMAIL] Domain disconnection notification sent to ${owner[0].email}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send domain disconnection email:`, error);
    // Don't throw - email failure shouldn't block the downgrade
  }
}

// ============================================================================
// UTILITY: Check and clean expired pending domains
// ============================================================================
/**
 * Clean up domain requests stuck in 'pending' for more than specified hours.
 * This frees up slots for other users.
 * 
 * Intended to be called by a Cron Worker.
 * 
 * @param env - Environment bindings
 * @param hoursThreshold - Hours after which pending requests are considered expired (default: 48)
 * @returns Number of expired requests cleaned up
 */
export async function cleanupExpiredPendingDomains(
  env: SubscriptionEnv,
  hoursThreshold: number = 48
): Promise<number> {
  const db = drizzle(env.DB);
  
  const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  
  // Find and update expired pending requests
  const result = await env.DB.prepare(`
    UPDATE stores 
    SET 
      custom_domain_status = 'expired',
      custom_domain_request = NULL,
      updated_at = ?
    WHERE 
      custom_domain_status = 'pending' 
      AND custom_domain_requested_at < ?
  `).bind(new Date().toISOString(), cutoffTime.toISOString()).run();

  const cleanedCount = result.meta?.changes || 0;
  
  if (cleanedCount > 0) {
    console.log(`[CLEANUP] Expired ${cleanedCount} pending domain requests older than ${hoursThreshold} hours`);
  }

  return cleanedCount;
}

// ============================================================================
// UTILITY: Handle subscription upgrade
// ============================================================================
/**
 * Handle store upgrade to a paid plan.
 * Auto-sets subscription dates when upgrading from free to paid.
 * 
 * @param env - Environment bindings
 * @param storeId - Store ID to upgrade
 * @param newPlan - New plan type
 */
export async function handleUpgrade(
  env: SubscriptionEnv,
  storeId: number,
  newPlan: PlanType
): Promise<{ success: boolean; error?: string }> {
  const db = drizzle(env.DB);

  try {
    // Get current plan to check if upgrading from free
    const currentStore = await db
      .select({ planType: stores.planType, subscriptionStartDate: stores.subscriptionStartDate })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    const currentPlan = currentStore[0]?.planType || 'free';
    const isUpgradingFromFree = currentPlan === 'free' && newPlan !== 'free';
    const hasNoStartDate = !currentStore[0]?.subscriptionStartDate;

    // Calculate subscription dates (1 month from now)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    // Build update object
    const updateData: Record<string, unknown> = {
      planType: newPlan,
      updatedAt: new Date(),
    };

    // Auto-set subscription dates when upgrading to paid OR if no dates exist yet
    if ((isUpgradingFromFree || hasNoStartDate) && newPlan !== 'free') {
      updateData.subscriptionStartDate = now;
      updateData.subscriptionEndDate = endDate;
      updateData.subscriptionPaymentMethod = 'manual'; // Default to manual
      console.log(`[UPGRADE] Auto-setting subscription dates for store ${storeId}: ${now.toISOString()} to ${endDate.toISOString()}`);
    }

    await db.update(stores).set(updateData).where(eq(stores.id, storeId));

    console.log(`[UPGRADE] Store ${storeId} upgraded to ${newPlan}`);

    return { success: true };
  } catch (error) {
    console.error(`[UPGRADE] Error upgrading store ${storeId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
