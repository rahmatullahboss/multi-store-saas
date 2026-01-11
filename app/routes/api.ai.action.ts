/**
 * AI Action API Endpoint
 * 
 * Unified AI endpoint handling:
 * - SETUP_STORE: Generate store name, SEO, product
 * - GENERATE_PAGE: Generate landing config from product info
 * - GENERATE_FULL_PAGE: Generate complete landing page from business description
 * - EDIT_SECTION: Edit specific landing section
 * - ENHANCE_TEXT: Improve text for a specific field type
 * 
 * Rate-limited with plan-based quotas.
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { canUseAI, type PlanType, type AIPlanType } from '~/utils/plans.server';
import { createAIService } from '~/services/ai.server';
import { checkAIRateLimit, incrementAIUsage } from '~/lib/rateLimit.server';
import { checkCredits, deductCredits, CREDIT_COSTS, type AIFeatureName } from '~/utils/credit.server';

// Define Payload Type
interface ActionPayload {
  action: string;
  description?: string;
  productInfo?: any;
  style?: string;
  businessDescription?: string;
  sectionName?: string;
  currentData?: any;
  editPrompt?: string;
  fieldType?: string;
  currentText?: string;
  keywords?: string;
  prompt?: string;
  currentHtml?: string;
  context?: any;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);

  // Get session and store
  const session = await getSession(request, env);
  const storeId = session.get('storeId');
  const userId = session.get('userId');

  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get store and check plan
  const storeResult = await db
    .select({ 
      planType: stores.planType,
      aiPlan: stores.aiPlan
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Check User Role for Super Admin Bypass
  let userRole = 'user';
  if (userId) {
      const userResult = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
      userRole = userResult[0]?.role || 'user';
  }

  const planType = (store.planType as PlanType) || 'free';
  const aiPlan = (store.aiPlan as AIPlanType) || null;

  // Check for API key
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
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

  // DETERMINE COST
  let cost = 0;
  if (actionType in CREDIT_COSTS) {
    cost = CREDIT_COSTS[actionType as AIFeatureName];
  } else {
    // Default fallback or free actions can be 0 or throw error
    console.warn(`[AI Action] Unknown action type for credits: ${actionType}`);
  }

  // CHECK CREDITS (Skip for Super Admin if you want, or just enforce for consistency. Let's enforce.)
  if (cost > 0 && userRole !== 'super_admin') {
    const creditCheck = await checkCredits(db, storeId, cost);
    if (!creditCheck.allowed) {
      return json({
        error: `Insufficient AI credits. This action costs ${cost} credits.`,
        code: 'INSUFFICIENT_CREDITS',
        required: cost,
        available: creditCheck.currentBalance
      }, { status: 402 }); // Payment Required
    }
  }

  // Create AI service
  const ai = createAIService(apiKey, {
    model: env.AI_MODEL,
    baseUrl: env.AI_BASE_URL
  });

  try {
    let result;
    // We will perform the AI action first, then deduct credits upon success.
    // This prevents charging for failed AI calls.

    switch (actionType) {
      case 'SETUP_STORE': {
        if (!payload.description) {
          return json({ error: 'Business description required' }, { status: 400 });
        }
        result = await ai.generateStoreSetup(payload.description);
        break;
      }

      case 'GENERATE_PAGE': {
        if (!payload.productInfo) {
          return json({ error: 'Product info required' }, { status: 400 });
        }
        result = await ai.generateLandingConfig(
          payload.productInfo,
          payload.style
        );
        break;
      }

      case 'GENERATE_FULL_PAGE': {
        if (!payload.businessDescription) {
          return json({ error: 'Business description required' }, { status: 400 });
        }
        result = await ai.generateFullPage(payload.businessDescription);
        break;
      }

      case 'EDIT_SECTION': {
        if (!payload.sectionName || !payload.editPrompt) {
          return json({ error: 'Section name and edit prompt required' }, { status: 400 });
        }
        result = await ai.editSection(
          payload.sectionName,
          payload.currentData || {},
          payload.editPrompt
        );
        break;
      }

      case 'ENHANCE_TEXT': {
        if (!payload.fieldType || !payload.keywords) {
          return json({ error: 'Field type and keywords required' }, { status: 400 });
        }
        result = await ai.enhanceText(
          payload.fieldType,
          payload.currentText || '',
          payload.keywords
        );
        break;
      }

      case 'GENERATE_ELEMENTOR_PAGE': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }
        result = await ai.generateElementorPage(payload.prompt);
        break;
      }

      case 'EDIT_ELEMENTOR_SECTION': {
        if (!payload.prompt || !payload.currentHtml) {
          return json({ error: 'Prompt and HTML content required' }, { status: 400 });
        }
        result = await ai.editElementorSection(payload.currentHtml, payload.prompt);
        break;
      }

      case 'GENERATE_GRAPESJS_PAGE': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }
        result = await ai.generateGrapesJsPage(payload.prompt);
        break;
      }

      case 'DESIGN_CUSTOM_SECTION': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }
        result = await ai.designCustomSection(payload.prompt, payload.currentHtml);
        break;
      }

      case 'DESIGN_STORE_THEME': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }
        result = await ai.generateStoreThemeConfig(payload.prompt);
        break;
      }

      case 'CHAT_COMMAND': {
        if (!payload.editPrompt) {
          return json({ error: 'User prompt required' }, { status: 400 });
        }
        result = await ai.commandGrapesJs(
          payload.editPrompt,
          payload.context || {}
        );
        break;
      }

      case 'STORE_EDITOR_COMMAND': {
        if (!payload.editPrompt) {
          return json({ error: 'User prompt required' }, { status: 400 });
        }
        // Validate context is provided
        if (!payload.context?.sections || !payload.context?.currentColors) {
          return json({ error: 'Store context required (sections, currentColors)' }, { status: 400 });
        }
        result = await ai.commandStoreEditor(
          payload.editPrompt,
          {
            sections: payload.context.sections || [],
            currentColors: payload.context.currentColors || { primary: '#6366f1', accent: '#f59e0b', background: '#f9fafb', text: '#111827' },
            currentFont: payload.context.currentFont || 'inter',
            storeName: payload.context.storeName || 'My Store'
          }
        );
        break;
      }

      default:
        return json({ error: `Unknown action: ${actionType}` }, { status: 400 });
    }

    // SUCCESS - DEDUCT CREDITS
    if (cost > 0 && userRole !== 'super_admin') {
      const deduction = await deductCredits(
        db, 
        storeId, 
        cost, 
        `AI Action: ${actionType}`,
        { action: actionType }
      );
      if (!deduction.success) {
        // This is a rare edge case where check passed but deduction failed (race condition)
        // We log it but still return success to user since they got their result.
        console.error(`[AI Action] Credit deduction failed after success. Store: ${storeId}, Cost: ${cost}`);
      }
    }

    // Also track usage for analytics/limits if needed (keeping legacy for now)
    await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);

    return json({ success: true, data: result });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Action] Error Message:', errorMessage);
    
    // Check for JSON/Schema errors specifically to return friendly messages
    if (errorMessage.includes('JSON') || errorMessage.includes('Schema')) {
         return json({
          error: 'AI response was invalid. Please try again.',
          code: 'AI_FORMAT_ERROR'
        }, { status: 422 });
    }

    return json(
      { 
        error: 'AI generation failed. Please try again.',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
