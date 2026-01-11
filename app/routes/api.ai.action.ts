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

  // Check rate limit (Skip for Super Admin)
  if (userRole !== 'super_admin') {
    const rateCheck = await checkAIRateLimit(
        env.AI_RATE_LIMIT, 
        env.DB,
        storeId, 
        planType,
        aiPlan
    );

    if (!rateCheck.allowed) {
      const msg = rateCheck.type === 'daily' 
          ? `Daily AI trial limit reached (${rateCheck.limit}). Upgrade to an AI Plan!`
          : `Monthly AI plan limit reached (${rateCheck.limit}). Upgrade your plan.`;

      return json(
        { 
          error: msg,
          code: 'RATE_LIMIT_EXCEEDED',
          remaining: rateCheck.remaining,
          limit: rateCheck.limit,
          upgradeUrl: planType === 'free' ? '/app/upgrade' : undefined
        }, 
        { status: 429 }
      );
    }
  }

  // Check for API key
  const apiKey = env.OPENROUTER_API_KEY;
  console.log(`[AI Action] API Key present: ${!!apiKey}${apiKey ? ` (starts with ${apiKey.substring(0, 8)}...)` : ''}`);
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
  const ai = createAIService(apiKey, {
    model: env.AI_MODEL,
    baseUrl: env.AI_BASE_URL
  });

  try {
    switch (actionType) {
      case 'SETUP_STORE': {
        if (!payload.description) {
          return json({ error: 'Business description required' }, { status: 400 });
        }

        const result = await ai.generateStoreSetup(payload.description);
        // Increment usage after successful call
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
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
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'GENERATE_FULL_PAGE': {
        if (!payload.businessDescription) {
          return json({ error: 'Business description required' }, { status: 400 });
        }

        try {
          const result = await ai.generateFullPage(payload.businessDescription);
          await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
          return json({ success: true, data: result });
        } catch (genError) {
          // Specific handling for JSON parsing failures
          if (genError instanceof SyntaxError || 
              (genError instanceof Error && genError.message.includes('JSON'))) {
            console.error('[AI Action] Full page generation JSON parse failed:', genError);
            return json({
              error: 'AI returned invalid format. Please try again.',
              code: 'JSON_PARSE_ERROR',
            }, { status: 422 });
          }
          throw genError;
        }
      }

      case 'EDIT_SECTION': {
        if (!payload.sectionName || !payload.editPrompt) {
          return json({ error: 'Section name and edit prompt required' }, { status: 400 });
        }

        try {
          const result = await ai.editSection(
            payload.sectionName,
            payload.currentData || {},
            payload.editPrompt
          );
          await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
          return json({ success: true, data: result });
        } catch (editError) {
          // Specific handling for JSON parsing failures
          if (editError instanceof SyntaxError || 
              (editError instanceof Error && editError.message.includes('JSON'))) {
            console.error('[AI Action] JSON parsing failed:', editError);
            return json({
              error: 'AI returned invalid format. Please try rephrasing your request.',
              code: 'JSON_PARSE_ERROR',
            }, { status: 422 });
          }
          // Zod validation failures (imported at top)
          if (editError && typeof editError === 'object' && 'issues' in editError) {
            console.error('[AI Action] Schema validation failed:', editError);
            return json({
              error: 'AI response did not match expected format. Please try again.',
              code: 'SCHEMA_VALIDATION_ERROR',
            }, { status: 422 });
          }
          // Re-throw unknown errors to be caught by outer handler
          throw editError;
        }
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
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'GENERATE_ELEMENTOR_PAGE': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }

        const result = await ai.generateElementorPage(payload.prompt);
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'EDIT_ELEMENTOR_SECTION': {
        if (!payload.prompt || !payload.currentHtml) {
          return json({ error: 'Prompt and HTML content required' }, { status: 400 });
        }

        const result = await ai.editElementorSection(payload.currentHtml, payload.prompt);
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'GENERATE_GRAPESJS_PAGE': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }

        const result = await ai.generateGrapesJsPage(payload.prompt);
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'DESIGN_CUSTOM_SECTION': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }

        const result = await ai.designCustomSection(payload.prompt, payload.currentHtml);
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'DESIGN_STORE_THEME': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }

        try {
          const result = await ai.generateStoreThemeConfig(payload.prompt);
          await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
          return json({ success: true, data: result });
        } catch (error) {
           console.error('[AI Action] Theme Generation Failed:', error);
           return json({
             error: 'Failed to generate theme. Please try again.',
             code: 'THEME_GEN_FAILED'
           }, { status: 422 });
        }
      }

      case 'CHAT_COMMAND': {
        if (!payload.editPrompt) {
          return json({ error: 'User prompt required' }, { status: 400 });
        }

        const result = await ai.commandGrapesJs(
          payload.editPrompt,
          payload.context || {}
        );
        await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
        return json({ success: true, data: result });
      }

      case 'STORE_EDITOR_COMMAND': {
        if (!payload.editPrompt) {
          return json({ error: 'User prompt required' }, { status: 400 });
        }

        // Validate context is provided
        if (!payload.context?.sections || !payload.context?.currentColors) {
          return json({ error: 'Store context required (sections, currentColors)' }, { status: 400 });
        }

        try {
          const result = await ai.commandStoreEditor(
            payload.editPrompt,
            {
              sections: payload.context.sections || [],
              currentColors: payload.context.currentColors || { primary: '#6366f1', accent: '#f59e0b', background: '#f9fafb', text: '#111827' },
              currentFont: payload.context.currentFont || 'inter',
              storeName: payload.context.storeName || 'My Store'
            }
          );
          await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);
          return json({ success: true, data: result });
        } catch (cmdError) {
          console.error('[AI Action] Store Editor Command Failed:', cmdError);
          return json({
            error: 'Failed to process command. Try rephrasing.',
            code: 'STORE_COMMAND_FAILED'
          }, { status: 422 });
        }
      }

      default:
        return json({ error: `Unknown action: ${actionType}` }, { status: 400 });
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Action] Error Message:', errorMessage);
    
    // Safely log full error object if possible
    try {
      console.error('[AI Action] Full Error:', JSON.stringify(error, null, 2));
    } catch (e) {
      console.error('[AI Action] Could not stringify error object');
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
