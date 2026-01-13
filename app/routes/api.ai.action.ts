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

      // CHAT_COMMAND removed - replaced by STRICT_EDIT for page builder


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


      case 'STRICT_EDIT': {
        // NEW: Strict element editing - only modify selected element
        const selectedComponent = (payload as any).selectedComponent;
        const userCommand = (payload as any).userCommand;

        if (!selectedComponent || !userCommand) {
          return json({ error: 'Selected component and user command required' }, { status: 400 });
        }

        // Safe access with fallbacks
        const componentId = selectedComponent.id || 'unknown';
        const componentType = selectedComponent.type || 'element';
        const componentTag = selectedComponent.tagName || 'div';
        const componentContent = (selectedComponent.content || '').slice(0, 100);
        const componentStyles = selectedComponent.styles || {};
        const componentClasses = Array.isArray(selectedComponent.classes) ? selectedComponent.classes : [];

        // Build strict system prompt
        const strictSystemPrompt = `You are an AI assistant for a GrapeJS page builder.

CRITICAL RULES - NEVER VIOLATE:

1. ONLY MODIFY THE SELECTED ELEMENT
   - Target element ID: ${componentId}
   - Type: ${componentType}
   - You can ONLY modify THIS element

2. FORBIDDEN ACTIONS (NEVER DO THESE):
   ❌ deleteElement - Cannot delete anything
   ❌ createSection - Cannot create new sections  
   ❌ moveElement - Cannot move elements
   ❌ replaceElement - Cannot replace with new element
   ❌ modifyParent - Cannot touch parent
   ❌ modifySibling - Cannot touch siblings

3. ALLOWED ACTIONS:
   ✅ updateContent - Change text
   ✅ updateStyles - Change CSS styles
   ✅ updateAttributes - Change attributes
   ✅ addClass / removeClass - Manage classes
   ✅ updateSrc - Change image source
   ✅ updateHref - Change link URL

4. RESPONSE FORMAT (JSON ONLY):
{
  "action": "updateStyles",
  "targetId": "${componentId}",
  "changes": {
    "styles": { "property": "value" }
  },
  "explanation": "Brief description in Bengali"
}

SELECTED ELEMENT CURRENT STATE:
- Tag: ${componentTag}
- Content: "${componentContent}"
- Classes: ${componentClasses.join(', ') || 'none'}

USER COMMAND: "${userCommand}"

Generate the modification JSON. Only output valid JSON, nothing else.`;

        try {
          const response = await fetch(env.AI_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://ozzyl.com',
              'X-Title': 'Ozzyl Page Builder'
            },
            body: JSON.stringify({
              model: env.AI_MODEL || 'openai/gpt-4o-mini',
              messages: [
                { role: 'system', content: strictSystemPrompt },
                { role: 'user', content: userCommand }
              ],
              temperature: 0.3,
              max_tokens: 1000
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[STRICT_EDIT] API Error:', response.status, errorText);
            throw new Error(`AI service error: ${response.status}`);
          }

          const aiData = await response.json() as any;
          let content = aiData.choices?.[0]?.message?.content;
          
          if (!content) {
            throw new Error('Empty AI response');
          }

          // Extract JSON from markdown code blocks if present
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            content = jsonMatch[1].trim();
          }
          
          // Also try to find JSON object directly
          const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch) {
            content = jsonObjectMatch[0];
          }

          console.log('[STRICT_EDIT] Extracted content:', content.slice(0, 200));

          // Parse and validate response
          let parsedResult;
          try {
            parsedResult = JSON.parse(content);
          } catch {
            console.error('[STRICT_EDIT] JSON Parse Error, raw content:', content);
            throw new Error('Invalid JSON response from AI');
          }

          // Force correct target ID
          if (parsedResult.action) {
            parsedResult.targetId = componentId;
          }
          if (parsedResult.actions) {
            parsedResult.actions = parsedResult.actions.map((a: any) => ({
              ...a,
              targetId: componentId
            }));
          }

          result = parsedResult;
        } catch (err: any) {
          console.error('[STRICT_EDIT] Error:', err.message);
          return json({ 
            error: 'AI generation failed. Please try again.',
            details: err.message 
          }, { status: 500 });
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
