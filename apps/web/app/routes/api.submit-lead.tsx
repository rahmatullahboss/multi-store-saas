/**
 * Lead Submission API Route
 * Handles form submissions from lead gen forms across all themes
 *
 * Features:
 * - Zod validation
 * - Spam prevention (honeypot, rate limiting)
 * - Email notifications
 * - AI enrichment (optional)
 * - Multi-tenant isolation
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { leadSubmissions, stores, users } from '@db/schema';
import { eq, or, and } from 'drizzle-orm';
import { z } from 'zod';
import { createDb } from '~/lib/db.server';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const LeadSubmissionSchema = z
  .object({
    // Required fields
    form_id: z.string().min(1, 'Form ID is required'),
    name: z.string().min(1, 'Name is required').max(255),

    // Contact (at least one required)
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),

    // Optional fields
    company: z.string().max(255).optional(),
    message: z.string().max(5000).optional(),
    document: z.string().url().optional(), // File upload URL from R2

    // Metadata
    page_url: z.string().url().optional(),

    // UTM parameters
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),

    // Honeypot (should be empty)
    website: z.string().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

// ============================================================================
// ACTION HANDLER
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const env = context.cloudflare.env as {
      DB: D1Database;
      STORE_CACHE?: KVNamespace;
      RESEND_API_KEY?: string;
      AI?: Ai;
      KV?: KVNamespace;
    };
    const db = createDb(env.DB);
    const KV = env.STORE_CACHE ?? env.KV;
    const AI = env.AI;
    const RESEND_API_KEY = env.RESEND_API_KEY || '';

    // Get store from hostname
    const url = new URL(request.url);
    const hostname = url.hostname;

    const [store] = await db
      .select()
      .from(stores)
      .where(or(eq(stores.customDomain, hostname), eq(stores.subdomain, hostname.split('.')[0])))
      .limit(1);

    if (!store) {
      return json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    // Spam Check 1: Honeypot
    if (rawData.website) {
      console.log('Spam detected (honeypot):', rawData);
      // Return fake success to not alert bots
      return json({ success: true });
    }

    // Validate input
    const validated = LeadSubmissionSchema.safeParse(rawData);
    if (!validated.success) {
      return json(
        {
          success: false,
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Spam Check 2: Rate limiting by IP
    const ipAddress =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';

    const rateLimitKey = `rate_limit:lead_form:${ipAddress}`;
    if (KV) {
      const rateLimitCount = await KV.get(rateLimitKey);
      if (rateLimitCount && parseInt(rateLimitCount, 10) >= 5) {
        return json(
          { success: false, error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        );
      }

      // Increment rate limit counter
      await KV.put(rateLimitKey, String(parseInt(rateLimitCount || '0', 10) + 1), {
        expirationTtl: 3600, // 1 hour
      });
    }

    // Get additional metadata
    const userAgent = request.headers.get('User-Agent') || '';
    const referrer = request.headers.get('Referer') || '';

    // Save to database
    const [lead] = await db
      .insert(leadSubmissions)
      .values({
        storeId: store.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        formData: JSON.stringify({
          message: data.message,
          document: data.document,
        }),
        source: 'contact_form',
        formId: data.form_id,
        pageUrl: data.page_url || referrer,
        status: 'new',
        utmSource: data.utm_source || null,
        utmMedium: data.utm_medium || null,
        utmCampaign: data.utm_campaign || null,
        referrer,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: leadSubmissions.id });

    console.log(`✅ Lead created: ID=${lead.id}, Store=${store.id}, Name=${data.name}`);

    // Send email notification to merchant (async)
    if (RESEND_API_KEY) {
      context.cloudflare.ctx.waitUntil(
        sendMerchantNotification(db, store, lead.id, data, RESEND_API_KEY)
      );
    }

    // AI enrichment (async, optional)
    if (AI && data.message) {
      context.cloudflare.ctx.waitUntil(enrichLeadWithAI(db, lead.id, data, AI));
    }

    return json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('❌ Lead submission error:', error);
    return json(
      {
        success: false,
        error: 'Failed to submit. Please try again or contact us directly.',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function sendMerchantNotification(
  db: ReturnType<typeof createDb>,
  store: typeof stores.$inferSelect,
  leadId: number,
  data: z.infer<typeof LeadSubmissionSchema>,
  resendApiKey: string
) {
  try {
    // Parse lead gen config
    const leadGenConfig = store.leadGenConfig
      ? JSON.parse(store.leadGenConfig)
      : { emailNotifications: true };

    if (leadGenConfig.emailNotifications === false) {
      return; // Notifications disabled
    }

    const storeUsers = await db
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.storeId, store.id), eq(users.role, 'merchant')))
      .limit(1);

    const notificationEmail =
      leadGenConfig.notificationEmail || storeUsers[0]?.email || 'admin@ozzyl.com';

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ozzyl Leads <leads@ozzyl.com>',
        to: notificationEmail,
        subject: `🎯 New Lead: ${data.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; }
              .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
              .value { color: #333; font-size: 16px; }
              .cta-button { display: inline-block; background: #2563EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎯 New Lead Received!</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name</div>
                  <div class="value">${data.name}</div>
                </div>
                ${
                  data.email
                    ? `
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${data.email}" style="color: #2563EB;">${data.email}</a></div>
                </div>
                `
                    : ''
                }
                ${
                  data.phone
                    ? `
                <div class="field">
                  <div class="label">Phone</div>
                  <div class="value"><a href="tel:${data.phone}" style="color: #2563EB;">${data.phone}</a></div>
                </div>
                `
                    : ''
                }
                ${
                  data.company
                    ? `
                <div class="field">
                  <div class="label">Company</div>
                  <div class="value">${data.company}</div>
                </div>
                `
                    : ''
                }
                ${
                  data.message
                    ? `
                <div class="field">
                  <div class="label">Message</div>
                  <div class="value">${data.message}</div>
                </div>
                `
                    : ''
                }
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://${store.customDomain || store.subdomain + '.ozzyl.com'}/app/leads/${leadId}" class="cta-button">
                    View Lead Details →
                  </a>
                </div>
              </div>
              <div class="footer">
                <p><strong>Lead ID:</strong> ${leadId} | <strong>Source:</strong> ${data.form_id}</p>
                <p>Powered by Ozzyl</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email notification:', error);
    } else {
      console.log(`📧 Email sent to ${notificationEmail}`);
    }
  } catch (error) {
    console.error('Email notification error:', error);
  }
}

async function enrichLeadWithAI(db: any, leadId: number, data: any, AI: any) {
  try {
    // Calculate basic lead score
    let score = 0.5; // Base score
    if (data.email) score += 0.2;
    if (data.phone) score += 0.2;
    if (data.company) score += 0.1;

    // Use Workers AI to analyze message
    if (data.message && data.message.length > 10) {
      const aiResponse = await AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content:
              'Analyze this lead inquiry and extract: intent (information/demo/purchase), urgency (low/medium/high), estimated budget if mentioned. Respond in JSON format only.',
          },
          {
            role: 'user',
            content: data.message,
          },
        ],
      });

      const insights = aiResponse.response || '{}';

      // Update lead with AI insights
      await db
        .update(leadSubmissions)
        .set({
          aiScore: score,
          aiInsights: insights,
          updatedAt: new Date(),
        })
        .where(eq(leadSubmissions.id, leadId));

      console.log(`🤖 AI enriched lead ${leadId}`);
    }
  } catch (error) {
    console.error('AI enrichment error:', error);
  }
}
