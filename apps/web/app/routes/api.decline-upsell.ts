/**
 * Decline Upsell API Route
 * 
 * POST /api/decline-upsell
 * 
 * Declines an upsell offer and returns next URL (downsell or thank-you page).
 * 
 * Input: { token: string }
 * Output: { success: true, nextUrl: string }
 */

import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { upsellTokens, upsellOffers } from '@db/schema';
import { eq, and } from 'drizzle-orm';

const DeclineUpsellSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  try {
    const body = await request.json();
    const parseResult = DeclineUpsellSchema.safeParse(body);
    
    if (!parseResult.success) {
      return json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const { token } = parseResult.data;

    // Validate token
    const tokenRecord = await db
      .select({
        id: upsellTokens.id,
        orderId: upsellTokens.orderId,
        offerId: upsellTokens.offerId,
        expiresAt: upsellTokens.expiresAt,
        usedAt: upsellTokens.usedAt,
      })
      .from(upsellTokens)
      .where(eq(upsellTokens.token, token))
      .limit(1);

    if (tokenRecord.length === 0) {
      return json({ success: false, error: 'Invalid token' }, { status: 400 });
    }

    const upsellToken = tokenRecord[0];

    // Mark token as used (declined)
    await db
      .update(upsellTokens)
      .set({ usedAt: new Date() })
      .where(eq(upsellTokens.id, upsellToken.id));

    // Check for downsell offer
    let nextUrl = `/thank-you/${upsellToken.orderId}`;
    
    if (upsellToken.offerId) {
      const currentOffer = await db
        .select({
          nextOfferId: upsellOffers.nextOfferId,
        })
        .from(upsellOffers)
        .where(eq(upsellOffers.id, upsellToken.offerId))
        .limit(1);

      if (currentOffer.length > 0 && currentOffer[0].nextOfferId) {
        // Check if next offer is a downsell and is active
        const downsell = await db
          .select({ id: upsellOffers.id, type: upsellOffers.type, isActive: upsellOffers.isActive })
          .from(upsellOffers)
          .where(
            and(
              eq(upsellOffers.id, currentOffer[0].nextOfferId),
              eq(upsellOffers.isActive, true)
            )
          )
          .limit(1);

        if (downsell.length > 0) {
          // Generate new token for downsell
          const downsellToken = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
          
          await db.insert(upsellTokens).values({
            orderId: upsellToken.orderId,
            token: downsellToken,
            offerId: downsell[0].id,
            expiresAt,
          });
          
          nextUrl = `/upsell/${downsellToken}`;
          
          // Increment views for downsell (non-blocking)
          context.cloudflare.ctx.waitUntil(
            context.cloudflare.env.DB.prepare(
              'UPDATE upsell_offers SET views = views + 1 WHERE id = ?'
            ).bind(downsell[0].id).run().catch(e => 
              console.error('Failed to increment downsell views:', e)
            )
          );
        }
      }
    }

    return json({
      success: true,
      message: 'Offer declined',
      nextUrl,
    });

  } catch (error) {
    console.error('Decline upsell error:', error);
    return json({ 
      success: false, 
      error: 'Failed to process decline',
    }, { status: 500 });
  }
}

export async function loader() {
  return json({
    method: 'POST',
    description: 'Decline an upsell offer',
    required_fields: ['token'],
  });
}


export default function() {}
