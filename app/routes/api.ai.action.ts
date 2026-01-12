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
import { eq } from 'drizzle-orm';
import { stores, users, products } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { canUseAI, type PlanType, type AIPlanType } from '~/utils/plans.server';
import { createAIService } from '~/services/ai.server';
import { checkAIRateLimit, incrementAIUsage } from '~/lib/rateLimit.server';
import { checkCredits, deductCredits, CREDIT_COSTS, type AIFeatureName } from '~/utils/credit.server';
import { buildAIContext } from '~/services/ai-context-builder.server';
import { validateAIAction } from '~/services/ai-action-validator.server';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { createDb } from '~/lib/db.server';

interface ActionPayload {
  action: string;
  featuredProductId?: string;
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
  count?: number;
  context?: any;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const db = createDb(env.DB); // Use typed DB

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

  // Determine Cost
  let cost = 0;
  if (actionType in CREDIT_COSTS) {
    cost = CREDIT_COSTS[actionType as AIFeatureName];
  }

  // Check Credits
  if (cost > 0 && userRole !== 'super_admin') {
    const creditCheck = await checkCredits(db, storeId, cost);
    if (!creditCheck.allowed) {
      return json({
        error: `Insufficient AI credits. This action costs ${cost} credits.`,
        code: 'INSUFFICIENT_CREDITS',
        required: cost,
        available: creditCheck.currentBalance
      }, { status: 402 });
    }
  }

  // Create AI service
  const ai = createAIService(apiKey, {
    model: env.AI_MODEL,
    baseUrl: env.AI_BASE_URL
  });

  try {
    let result;
    
    // Resolve Product Context if needed
    let resolvedProductInfo: any = null;
    const productIdStr = payload.featuredProductId || payload.context?.featuredProductId;
    const productId = productIdStr ? parseInt(productIdStr) : null;

    if (productId) {
      const product = await db.select().from(products)
        .where(eq(products.id, productId))
        .get();
      if (product) {
         resolvedProductInfo = {
           title: product.title,
           description: product.description,
           price: product.price,
           imageUrl: product.imageUrl
         };
      }
    }

    // Fallback to first product if no product info provided for relevant actions
    if (!resolvedProductInfo && ['GENERATE_GRAPESJS_PAGE', 'CHAT_COMMAND', 'DESIGN_CUSTOM_SECTION'].includes(actionType)) {
        const firstProduct = await db.select().from(products)
          .where(eq(products.storeId, storeId))
          .limit(1)
          .get();
         if (firstProduct) {
          resolvedProductInfo = {
            title: firstProduct.title,
            description: firstProduct.description,
            price: firstProduct.price,
            imageUrl: firstProduct.imageUrl
          };
        }
    }

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

      case 'GENERATE_ARRAY': {
        if (!payload.fieldType || !payload.keywords) {
          return json({ error: 'Field type (e.g., features, faqs) and keywords required' }, { status: 400 });
        }
        result = await ai.generateListItems(
          payload.fieldType,
          payload.count || 3,
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
        result = await ai.generateGrapesJsPage(payload.prompt, resolvedProductInfo);
        break;
      }

      case 'DESIGN_CUSTOM_SECTION': {
        if (!payload.prompt) {
          return json({ error: 'AI Prompt required' }, { status: 400 });
        }
        result = await ai.designCustomSection(payload.prompt, payload.currentHtml, resolvedProductInfo);
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
          {
            ...(payload.context || {}),
            productInfo: resolvedProductInfo
          }
        );
        break;
      }

      case 'STORE_EDITOR_COMMAND': {
        if (!payload.editPrompt) {
          return json({ error: 'User prompt required' }, { status: 400 });
        }

        // 1. Build Full AI Context
        const aiContext = await buildAIContext(db, storeId, payload.editPrompt);
        
        // 2. Execute AI Command with Context
        // Map AIContext to StoreEditorContext expected by commandStoreEditor
        const editorContext = {
          sections: aiContext.sections,
          currentColors: { 
            primary: aiContext.config.theme.primaryColor || '#6366f1',
            accent: aiContext.config.theme.accentColor || '#f59e0b',
            background: aiContext.config.theme.backgroundColor || '#f9fafb',
            text: aiContext.config.theme.textColor || '#111827'
          },
          currentFont: aiContext.config.theme.fontFamily || 'inter',
          storeName: aiContext.store.name
        };

        result = await ai.commandStoreEditor(
          payload.editPrompt,
          editorContext
        );

        // 3. Validation Logic
        if (result && typeof result === 'object' && 'action' in result && result.action === 'update_section') {
             // Safe cast or check
             const updateAction = result as any;
             if (updateAction.sectionId) {
                const section = aiContext.sections.find((s: any) => s.id === updateAction.sectionId);
                if (section) {
                    const def = SECTION_REGISTRY[section.type];
                    if (def?.aiSchema) {
                        const validation = await validateAIAction(result as any, def.aiSchema);
                        if (!validation.valid) {
                            console.warn("[AI Validation Failed]", validation.errors);
                            (result as any)._warnings = validation.errors;
                        }
                    }
                }
             }
        }
        
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
        console.error(`[AI Action] Credit deduction failed after success. Store: ${storeId}, Cost: ${cost}`);
      }
    }

    await incrementAIUsage(env.AI_RATE_LIMIT, storeId, !aiPlan);

    return json({ success: true, data: result });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Action] Error Message:', errorMessage);
    
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
