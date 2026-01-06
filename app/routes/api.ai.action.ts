/**
 * AI Action API Endpoint
 * 
 * Unified AI endpoint handling:
 * - SETUP_STORE: Generate store name, SEO, product
 * - GENERATE_PAGE: Generate full landing config
 * - EDIT_SECTION: Edit specific landing section
 * 
 * Plan-gated: Only Starter/Premium users can access.
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { canUseAI, type PlanType } from '~/utils/plans.server';
import { createAIService } from '~/services/ai.server';
import { checkAIRateLimit, incrementAIUsage } from '~/lib/rateLimit.server';

// Action types
type ActionType = 'SETUP_STORE' | 'GENERATE_PAGE' | 'EDIT_SECTION' | 'ENHANCE_TEXT';

interface ActionPayload {
  action: ActionType;
  // SETUP_STORE
  description?: string;
  // GENERATE_PAGE
  productInfo?: { title: string; description?: string; price: number };
  style?: string;
  // EDIT_SECTION
  sectionName?: string;
  currentData?: unknown;
  editPrompt?: string;
  // ENHANCE_TEXT
  fieldType?: string;
  currentText?: string;
  keywords?: string;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);

  // Get session and store
  const session = await getSession(request.headers.get('Cookie'));
  const storeId = session.get('storeId');

  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get store and check plan
  const storeResult = await db
    .select({ planType: stores.planType })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const planType = (store.planType as PlanType) || 'free';

  // Check rate limit (applies to all users, but limits differ by plan)
  const rateCheck = await checkAIRateLimit(env.AI_RATE_LIMIT, storeId, planType);
  if (!rateCheck.allowed) {
    return json(
      { 
        error: `Daily AI limit reached (${rateCheck.limit} requests). ${planType === 'free' ? 'Upgrade to get more requests!' : 'Try again tomorrow.'}`,
        code: 'RATE_LIMIT_EXCEEDED',
        remaining: rateCheck.remaining,
        limit: rateCheck.limit,
        upgradeUrl: planType === 'free' ? '/app/upgrade' : undefined
      }, 
      { status: 429 }
    );
  }

  // Check for API key
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[AI Action] OPENROUTER_API_KEY not configured');
    return json(
      { error: 'AI service not configured. Please contact support.' },
      { status: 503 }
    );
  }

  // Parse request body
  let payload: ActionPayload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { action: actionType } = payload;

  if (!actionType) {
    return json({ error: 'Action type required' }, { status: 400 });
  }

  // Create AI service
  const ai = createAIService(apiKey);

  try {
    switch (actionType) {
      case 'SETUP_STORE': {
        if (!payload.description) {
          return json({ error: 'Business description required' }, { status: 400 });
        }

        const result = await ai.generateStoreSetup(payload.description);
        // Increment usage after successful call
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId);
        return json({ success: true, data: result });
      }

      case 'GENERATE_PAGE': {
        if (!payload.productInfo) {
          return json({ error: 'Product info required' }, { status: 400 });
        }

        const result = await ai.generateLandingConfig(
          payload.productInfo,
          payload.style
        );
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId);
        return json({ success: true, data: result });
      }

      case 'EDIT_SECTION': {
        if (!payload.sectionName || !payload.editPrompt) {
          return json({ error: 'Section name and edit prompt required' }, { status: 400 });
        }

        const result = await ai.editSection(
          payload.sectionName,
          payload.currentData || {},
          payload.editPrompt
        );
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId);
        return json({ success: true, data: result });
      }

      case 'ENHANCE_TEXT': {
        if (!payload.fieldType || !payload.keywords) {
          return json({ error: 'Field type and keywords required' }, { status: 400 });
        }

        const result = await ai.enhanceText(
          payload.fieldType,
          payload.currentText || '',
          payload.keywords
        );
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId);
        return json({ success: true, data: result });
      }

      default:
        return json({ error: `Unknown action: ${actionType}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[AI Action] Error:', error);
    return json(
      { 
        error: 'AI generation failed. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
