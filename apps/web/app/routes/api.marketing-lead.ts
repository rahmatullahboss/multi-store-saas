/**
 * Marketing Lead API - Collect emails from homepage
 * POST /api/marketing-lead
 */
import { ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { marketingLeads } from '../../db/schema';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString()?.trim().toLowerCase();
    const source = formData.get('source')?.toString() || 'homepage';

    // Validate email
    if (!email || !email.includes('@') || email.length < 5) {
      return json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Get client info
    const ipAddress = request.headers.get('CF-Connecting-IP') || 
                      request.headers.get('X-Forwarded-For') || 
                      'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    const env = context.cloudflare.env as { DB: D1Database };
    const db = drizzle(env.DB);

    // Insert or ignore if already exists
    await db.insert(marketingLeads).values({
      email,
      source,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    }).onConflictDoNothing();

    return json({ success: true, message: 'Thank you for subscribing!' });
  } catch (error) {
    console.error('Marketing lead error:', error);
    return json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}


export default function() {}
