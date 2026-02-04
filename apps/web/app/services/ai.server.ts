/**
 * AI Service - OpenAI-Compatible API Integration
 * 
 * Supports any OpenAI-compatible provider (OpenRouter, Xiaomi Mimo, etc.):
 * - Store setup generation
 * - Landing page generation
 * - Section editing with natural language
 * - Customer chat support
 * 
 * All responses are validated with Zod schemas.
 * Uses raw fetch for maximum provider compatibility.
 */

import { z } from 'zod';
import { PLAN_LIMITS, PLAN_PRICES } from '~/utils/plans.server';

// Cloudflare Workers AI Binding Type
export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI: any; // Cloudflare Workers AI namespace
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  VECTORIZE: any; // Cloudflare Vectorize Index binding
}

// Embedding Model
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';



// ============================================================================
// CONFIGURATION
// ============================================================================
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

// Export config for use in other files
export const AI_CONFIG = {
  defaultModel: DEFAULT_MODEL,
  defaultBaseUrl: DEFAULT_BASE_URL,
};

// ============================================================================
// EXPORTED: Generic AI Call Function for unified usage across app
// ============================================================================
/**
 * Unified AI call function - use this across all routes for consistency.
 * Model can be changed via environment variables.
 */
export async function callAIWithSystemPrompt(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  options?: {
    model?: string;
    baseUrl?: string;
  }
): Promise<string> {
  const model = options?.model || DEFAULT_MODEL;
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
  
  console.warn(`[AI] Calling AI with model: ${model} at ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ozzyl.com', // OpenRouter App URL
        'X-Title': 'Ozzyl SaaS', // OpenRouter App Name
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] API Error ${response.status}:`, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { 
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };
    
    const content = data.choices?.[0]?.message?.content;
    console.warn(`[AI] Response received. Length: ${content?.length || 0}${data.usage ? `, Tokens: ${data.usage.total_tokens}` : ''}`);
    
    if (!content) {
      console.error('[AI] Empty response from AI');
      throw new Error('No response from AI');
    }

    return content;
  } catch (error) {
    console.error('[AI] Error in callAIWithSystemPrompt:', error);
    throw error;
  }
}

// ============================================================================
// ZOD SCHEMAS - Structured AI Output Validation
// ============================================================================

// Store setup response schema
export const StoreSetupSchema = z.object({
  storeName: z.string().min(2).max(100),
  seoKeywords: z.array(z.string()).min(1).max(10),
  product: z.object({
    title: z.string().min(2).max(200),
    description: z.string().min(10).max(1000),
    suggestedPrice: z.number().positive(),
  }),
});

export type StoreSetupResult = z.infer<typeof StoreSetupSchema>;

// Landing page config schema
export const LandingConfigSchema = z.object({
  hero: z.object({
    headline: z.string().min(5).max(150),
    subheadline: z.string().max(300).optional(),
    ctaText: z.string().max(50).optional(),
    ctaSubtext: z.string().max(100).optional(),
  }),
  features: z.array(z.object({
    icon: z.string().max(10),
    title: z.string().max(100),
    description: z.string().max(200),
  })).max(6).optional(),
  testimonials: z.array(z.object({
    name: z.string().max(100),
    text: z.string().max(300),
  })).max(5).optional(),
  trust: z.object({
    urgencyText: z.string().max(100).optional(),
    guaranteeText: z.string().max(150).optional(),
  }).optional(),
});

export type LandingConfigResult = z.infer<typeof LandingConfigSchema>;

// Section edit response schema (partial landing config)
export const SectionEditSchema = z.record(z.unknown());

// ============================================================================
// SECTION-SPECIFIC SCHEMAS
// ============================================================================

// Hero section schema
export const HeroSectionSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaSubtext: z.string().optional(),
});

// Feature item schema
export const FeatureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

// Features section schema (array of features)
export const FeaturesSectionSchema = z.array(FeatureSchema);

// Testimonial schema
export const TestimonialSchema = z.object({
  name: z.string(),
  text: z.string(),
  avatar: z.string().optional(),
});

// Testimonials section schema
export const TestimonialsSectionSchema = z.array(TestimonialSchema);

// Theme/Colors config schema
export const ThemeConfigSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  // New Sales & Marketing Fields
  flashSale: z.object({
    isActive: z.boolean(),
    text: z.string().optional(),
    endTime: z.string().optional(), // ISO date string
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }).optional(),
  trustBadges: z.object({
    showPaymentIcons: z.boolean(),
    showGuaranteeSeals: z.boolean(),
    customText: z.string().optional(),
  }).optional(),
  marketingPopup: z.object({
    isActive: z.boolean(),
    title: z.string().optional(),
    description: z.string().optional(),
    delay: z.number().optional(), // in seconds
    offerCode: z.string().optional(),
  }).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

// Store Theme Schema
export const StoreThemeSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  borderColor: z.string(),
  fontFamily: z.enum(['inter', 'poppins', 'roboto', 'playfair', 'montserrat', 'hind-siliguri', 'noto-sans-bengali', 'noto-serif-bengali', 'baloo-da', 'tiro-bangla', 'anek-bangla']),
  sections: z.array(z.object({
    id: z.string(),
    type: z.enum(['hero', 'rich-text', 'category-list', 'product-scroll', 'features', 'banner', 'faq', 'product-grid', 'newsletter', 'modern-hero', 'modern-features', 'video', 'testimonials', 'flash-sale', 'trust-badge', 'countdown']),
    settings: z.record(z.unknown()),
  })),
  // New Global Settings
  flashSale: z.object({
    isActive: z.boolean(),
    text: z.string().optional(),
    endTime: z.string().optional(),
  }).optional(),
  trustBadges: z.object({
    showPaymentIcons: z.boolean(),
    showGuaranteeSeals: z.boolean(),
  }).optional(),
  marketingPopup: z.object({
    isActive: z.boolean(),
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }).optional(),
});

export type StoreThemeResult = z.infer<typeof StoreThemeSchema>;

// Section schema map for validation
const SECTION_SCHEMAS: Record<string, z.ZodSchema> = {
  hero: HeroSectionSchema,
  features: FeaturesSectionSchema,
  testimonials: TestimonialsSectionSchema,
  theme: ThemeConfigSchema,
  colors: ThemeConfigSchema,
  themeConfig: ThemeConfigSchema,
};

// ============================================================================
// FULL PAGE GENERATION SCHEMA
// ============================================================================

// Full page config response schema (for GENERATE_FULL_PAGE action)
export const FullPageConfigSchema = z.object({
  templateId: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  ctaText: z.string(),
  ctaSubtext: z.string().optional(),
  urgencyText: z.string().optional(),
  guaranteeText: z.string().optional(),
  features: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  testimonials: z.array(z.object({
    name: z.string(),
    text: z.string(),
  })).optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
    text: z.string().optional(),
  }).optional(),
  socialProof: z.object({
    count: z.number(),
    text: z.string(),
  }).optional(),
  benefits: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })).optional(),
});

export type FullPageConfigResult = z.infer<typeof FullPageConfigSchema>;

// ============================================================================
// HELPER: Make OpenAI-Compatible API call (Raw Fetch for maximum compatibility)
// ============================================================================
async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<string> {
  console.warn(`[AI] Calling AI with model: ${model} at ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ozzyl.com', // OpenRouter App URL
        'X-Title': 'Ozzyl SaaS', // OpenRouter App Name
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] API Error ${response.status}:`, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { 
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };
    
    const content = data.choices?.[0]?.message?.content;
    console.warn(`[AI] Response received. Length: ${content?.length || 0}${data.usage ? `, Tokens: ${data.usage.total_tokens}` : ''}`);
    
    if (!content) {
      console.error('[AI] Empty response from AI');
      throw new Error('No response from AI');
    }

    return content;
  } catch (error) {
    console.error('[AI] Error in callAI:', error);
    throw error;
  }
}

// ============================================================================
// HELPER: Extract JSON from AI response
// ============================================================================
// ============================================================================
// HELPER: Extract JSON from AI response
// ============================================================================
function extractJSON(text: string): unknown {
  console.warn('[AI] Extracting JSON from response...');
  
  try {
    // 1. Try to find JSON in markdown block first
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      console.warn('[AI] Found JSON inside markdown block');
      return JSON.parse(jsonMatch[1]);
    }
    
    // 2. Try to find the first `{` and last `}` to handle unwrapped JSON with extra text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
       console.warn('[AI] Found JSON object pattern in text');
       return JSON.parse(objectMatch[0]);
    }
    
    // 3. Fallback: Try to parse the whole text (rarely works if there's noise)
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      console.warn('[AI] Parsing whole response as JSON');
      return JSON.parse(trimmed);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('[AI] JSON Parse Error:', e.message);
    console.error('[AI] Failed text snippet:', text.substring(0, 200) + '...');
  }
  
  throw new Error('Could not extract JSON from AI response');
}

// ============================================================================
// ACTION: Generate Store Setup
// ============================================================================
export async function generateStoreSetup(
  apiKey: string,
  businessDescription: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<StoreSetupResult> {
  const systemPrompt = `You are an expert e-commerce consultant. Given a business description, generate:
1. A catchy, professional store name
2. SEO keywords (5-8 keywords)
3. A sample product with title, description, and suggested price in BDT

Your response MUST be valid JSON in this exact format:
{
  "storeName": "Store Name Here",
  "seoKeywords": ["keyword1", "keyword2", ...],
  "product": {
    "title": "Product Title",
    "description": "Compelling product description in Bengali or English",
    "suggestedPrice": 150000
  }
}

Important:
- Store name should be memorable and relevant
- Product description should be persuasive and highlight benefits
- Price should be realistic for Bangladesh market (in CENTS, e.g. 1500 Taka = 150000)
- If business is in Bangladesh, use Bengali for descriptions`;

  const userPrompt = `Business description: ${businessDescription}

Generate store setup JSON:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return StoreSetupSchema.parse(parsed);
}

// ============================================================================
// ACTION: Generate Landing Page Config
// ============================================================================
export async function generateLandingConfig(
  apiKey: string,
  productInfo: { title: string; description?: string; price: number },
  style: string | undefined = undefined,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<LandingConfigResult> {
  const systemPrompt = `You are an expert conversion copywriter. Create a high-converting landing page configuration.

Your response MUST be valid JSON matching this structure:
{
  "hero": {
    "headline": "Attention-grabbing headline (max 150 chars)",
    "subheadline": "Supporting text that builds desire",
    "ctaText": "Action button text",
    "ctaSubtext": "Risk reducer like 'Free shipping'"
  },
  "features": [
    { "icon": "✨", "title": "Feature Title", "description": "Benefit description" }
  ],
  "testimonials": [
    { "name": "Customer Name", "text": "Their positive review" }
  ],
  "trust": {
    "urgencyText": "Limited time offer!",
    "guaranteeText": "30-day money back guarantee"
  }
}

Guidelines:
- Write compelling, benefit-focused copy
- Use Bengali if product appears to be for Bangladesh market
- Create 3-4 features with relevant emojis
- Generate 2-3 realistic testimonials
- Make urgency and guarantee text convincing`;

  const userPrompt = `Product: ${productInfo.title}
Description: ${productInfo.description || 'N/A'}
Price: ৳${productInfo.price}
Style preference: ${style || 'Professional and trustworthy'}

Generate landing page JSON:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return LandingConfigSchema.parse(parsed);
}

// ============================================================================
// ACTION: Edit Section (Strict JSON Enforcement)
// ============================================================================

// Strict system prompt for JSON-only responses
const EDIT_SECTION_SYSTEM_PROMPT = `You are a UI Configuration Assistant. You receive a JSON object representing a website section and a user request.

Your task: Modify the JSON values based on the request.

Rules:
1. RETURN ONLY JSON. No markdown, no explanations, no code fences.
2. Do NOT change keys or data structure. Only change values.
3. Maintain professional, high-converting copywriting.
4. If asked to add items (e.g., "add a feature", "add a testimonial"), append new items to the existing array.
5. For theme/color changes, update the appropriate color values in hex format (e.g., "#3B82F6" for blue).
6. Keep text concise and impactful.
7. For Bengali products, use Bengali language in the copy.`;

// Detect if the prompt is asking to add items to an array
function isAddItemIntent(prompt: string): boolean {
  const addPatterns = [
    /add\s+(a\s+)?(new\s+)?feature/i,
    /add\s+(a\s+)?(new\s+)?benefit/i,
    /add\s+(a\s+)?(new\s+)?testimonial/i,
    /add\s+(a\s+)?(new\s+)?review/i,
    /add\s+\d+\s+more/i,
    /include\s+(a\s+)?new/i,
    /append/i,
  ];
  return addPatterns.some(pattern => pattern.test(prompt));
}

// Detect theme/color change intent
function isThemeChangeIntent(prompt: string): boolean {
  const themePatterns = [
    /change\s+(the\s+)?(theme|color|primary|secondary|accent)/i,
    /make\s+it\s+(blue|red|green|purple|orange|pink|yellow)/i,
    /use\s+(blue|red|green|purple|orange|pink|yellow)/i,
    /(primary|secondary|accent)\s+color/i,
  ];
  return themePatterns.some(pattern => pattern.test(prompt));
}

export async function editSection(
  apiKey: string,
  sectionName: string,
  currentData: unknown,
  editPrompt: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<unknown> {
  // Normalize section name for schema lookup
  const normalizedSection = sectionName.toLowerCase().replace(/[^a-z]/g, '');
  
  // Detect special intents
  const isAddIntent = isAddItemIntent(editPrompt);
  const isThemeIntent = isThemeChangeIntent(editPrompt);
  
  // Build context-aware user prompt
  let contextHint = '';
  if (isAddIntent && (normalizedSection === 'features' || normalizedSection === 'testimonials')) {
    contextHint = '\n\nIMPORTANT: The user wants to ADD new items. Append new items to the array while keeping all existing items intact.';
  }
  if (isThemeIntent) {
    contextHint = '\n\nIMPORTANT: The user wants to change colors. Use hex color codes (e.g., "#3B82F6" for blue, "#EF4444" for red, "#10B981" for green).';
  }

  const userPrompt = `Section: ${sectionName}

Current JSON:
${JSON.stringify(currentData, null, 2)}

User's request: "${editPrompt}"${contextHint}

Return ONLY the updated JSON:`;

  const response = await callAI(apiKey, EDIT_SECTION_SYSTEM_PROMPT, userPrompt, model, baseUrl);
  
  // Parse JSON from response
  let parsed: unknown;
  try {
    parsed = extractJSON(response);
  } catch (parseError) {
    console.error('[AI editSection] JSON parse failed:', response.substring(0, 500));
    throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
  
  // Validate against section-specific schema if available
  const schema = SECTION_SCHEMAS[normalizedSection];
  if (schema) {
    try {
      return schema.parse(parsed);
    } catch (validationError) {
      // Log but don't fail - the AI might return a slightly different structure
      console.warn('[AI editSection] Schema validation warning:', validationError);
      // Return parsed data anyway for flexibility
      return parsed;
    }
  }
  
  // No schema for this section, return as-is
  return parsed;
}

// ============================================================================
// ACTION: Enhance Text (For field-specific text improvement)
// ============================================================================

// Field-specific prompts
const ENHANCE_PROMPTS: Record<string, string> = {
  headline: 'You are a conversion copywriter. Create a compelling, attention-grabbing headline.',
  subheadline: 'You are a conversion copywriter. Create a supporting subheadline that builds desire.',
  description: 'You are a product copywriter. Write persuasive product descriptions that highlight benefits.',
  urgency: 'You are a marketing expert. Create urgency text that motivates immediate action.',
  guarantee: 'You are a trust-building expert. Write a reassuring guarantee statement.',
  cta: 'You are a CTA specialist. Write a short, action-oriented button text.',
  testimonial: 'You are a review writer. Create a realistic, specific customer testimonial.',
  seo: 'You are an SEO expert. Generate relevant search keywords.',
};

// ============================================================================
// ACTION: Generate List Items (Updates an array field)
// ============================================================================

export async function generateListItems(
  apiKey: string,
  fieldType: 'features' | 'faqs' | 'testimonials' | 'benefits' | string,
  count: number,
  topic: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<unknown[]> {
  const systemPrompt = `You are an expert e-commerce content generator.
Your task is to generate a list of ${fieldType} items for an online store.

Rules:
1. Return strictly valid JSON array.
2. No markdown, no explanations.
3. Use Bengali if the topic seems to be in Bengali.
4. Generate exactly ${count} items.`;

  let itemStructure = '';
  if (fieldType === 'features' || fieldType === 'benefits') {
    itemStructure = `{ "icon": "LucideIconName", "title": "Benefit Title", "description": "Short description" }`;
  } else if (fieldType === 'faqs') {
    itemStructure = `{ "question": "Common Question?", "answer": "Helpful answer" }`;
  } else if (fieldType === 'testimonials') {
    itemStructure = `{ "name": "Customer Name", "text": "Positive review", "rating": 5 }`;
  } else {
    itemStructure = `{ "title": "Item Title", "description": "Item Description" }`;
  }

  const userPrompt = `Topic/Context: "${topic}"
Generate ${count} items in this JSON structure:
[
  ${itemStructure}
]`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  
  if (!Array.isArray(parsed)) {
    throw new Error('AI did not return an array');
  }
  
  return parsed;
}

export async function enhanceText(
  apiKey: string,
  fieldType: string,
  currentText: string,
  keywords: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<string> {
  const basePrompt = ENHANCE_PROMPTS[fieldType] || ENHANCE_PROMPTS.headline;
  
  const systemPrompt = `${basePrompt}

Guidelines:
- Use Bengali if keywords appear to be in Bengali, otherwise use English
- Keep it concise and impactful
- Focus on benefits and emotions
- Return ONLY the enhanced text, no explanations or quotes`;

  const userPrompt = currentText 
    ? `Current text: "${currentText}"
Keywords/Topic: "${keywords}"

Improve this text based on the keywords:`
    : `Keywords/Topic: "${keywords}"

Create new text based on these keywords:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  return response.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any
}

// ============================================================================
// ACTION: Quick Edit (Simple text changes)
// ============================================================================
export async function quickEdit(
  apiKey: string,
  currentText: string,
  editPrompt: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<string> {
  const systemPrompt = `You are a copywriting assistant. Edit the given text according to the user's instructions.
Return ONLY the edited text, no explanations or quotes.`;

  const userPrompt = `Current text: "${currentText}"
Edit instruction: "${editPrompt}"

Edited text:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  return response.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any
}

// ============================================================================
// ACTION: Generate Full Page from Business Description
// ============================================================================
export async function generateFullPage(
  apiKey: string,
  businessDescription: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<FullPageConfigResult> {
  const systemPrompt = `You are an expert e-commerce landing page designer. Given a business description, generate a complete high-converting landing page configuration.

Your response MUST be valid JSON in this exact structure:
{
  "templateId": "modern-dark",
  "headline": "Compelling Bengali/English headline (max 100 chars)",
  "subheadline": "Supporting text that builds desire",
  "ctaText": "Action button text like 'এখনই অর্ডার করুন'",
  "ctaSubtext": "Risk reducer like 'ক্যাশ অন ডেলিভারি'",
  "urgencyText": "সীমিত সময়ের অফার! 🔥",
  "guaranteeText": "১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি",
  "features": [
    { "icon": "✨", "title": "Feature 1 Title", "description": "Benefit description" },
    { "icon": "🚚", "title": "Feature 2 Title", "description": "Benefit description" },
    { "icon": "💯", "title": "Feature 3 Title", "description": "Benefit description" }
  ],
  "testimonials": [
    { "name": "Customer Name, Location", "text": "Their positive review in Bengali" },
    { "name": "Another Customer", "text": "Another review" }
  ],
  "colors": {
    "primary": "#HEX_CODE",
    "secondary": "#HEX_CODE",
    "accent": "#HEX_CODE",
    "background": "#HEX_CODE",
    "text": "#HEX_CODE"
  },
  "socialProof": {
    "count": 500,
    "text": "সন্তুষ্ট গ্রাহক"
  },
  "benefits": [
    { "icon": "💡", "title": "Benefit 1", "description": "Short description" },
    { "icon": "🚀", "title": "Benefit 2", "description": "Short description" },
    { "icon": "🛡️", "title": "Benefit 3", "description": "Short description" }
  ]
}

Color Guidelines:
- Honey/Food: Warm colors (Gold #F59E0B, Orange #F97316, Amber #D97706)
- Tech/Electronics: Cool colors (Blue #3B82F6, Indigo #6366F1)
- Health/Beauty: Fresh colors (Green #10B981, Teal #14B8A6)
- Fashion/Luxury: Elegant colors (Purple #8B5CF6, Rose #F43F5E)
- General: Professional (Blue #2563EB, Gray #374151)

Important:
- Detect if business is Bangladeshi, use Bengali for all copy
- Create exactly 3 features with relevant emojis
- Create exactly 3 benefits with different icons
- Create exactly 2 testimonials with realistic Bengali names
- Choose colors that match the product category
- Write compelling, benefit-focused copy
- Make urgency text feel authentic, not pushy`;

  const userPrompt = `Business description: ${businessDescription}

Generate a complete landing page configuration JSON:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return FullPageConfigSchema.parse(parsed);
}

// ============================================================================
// STORE THEME GENERATION
// ============================================================================
export async function generateStoreThemeConfig(
  apiKey: string,
  description: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<StoreThemeResult> {
  const systemPrompt = `You are an expert UI/UX designer and conversion optimization specialist for e-commerce.
Your goal is to design a high-converting, aesthetically pleasing online store theme based on the user's business description.

### Available Resources:
1. **Fonts**: 'inter', 'poppins', 'roboto', 'playfair', 'montserrat', 'hind-siliguri', 'noto-sans-bengali', 'noto-serif-bengali', 'baloo-da', 'tiro-bangla', 'anek-bangla'
2. **Sections**: 
   - 'hero': Large banner with heading & CTA
   - 'product-grid': Grid of products
   - 'newsletter': Email signup
   - 'features': Trust signals/Icons
   - 'category-list': Grid of categories
   - 'banner': Promo banner
   - 'faq': Frequently asked questions
   - 'product-scroll': Horizontal scrolling products
   - 'rich-text': Brand story or text block

### Output Format:
Return VALID JSON matching this structure:
{
  "primaryColor": "#HEX",
  "accentColor": "#HEX", 
  "backgroundColor": "#HEX",
  "textColor": "#HEX",
  "borderColor": "#HEX",
  "fontFamily": "font-id",
  "sections": [
    {
      "id": "unique-id-1",
      "type": "hero",
      "settings": {
        "heading": "Catchy Headline",
        "subheading": "Persuasive subheading",
        "alignment": "center" (or "left", "right"),
        "layout": "standard"
      }
    },
    ... more sections in logical order
  ]
}

### Design Logic:
- **Luxury/Fashion**: Use 'playfair' or 'montserrat'. Elegant dark or cream colors.
- **Tech/Gadgets**: Use 'inter' or 'roboto'. Cool blues, greys, dark mode.
- **Organic/Food**: Use 'poppins'. Greens, earth tones.
- **Bengali Store**: Use 'hind-siliguri' or 'anek-bangla' if the description implies Bengali content.
- **Layout**: Always start with a 'hero'. Include 'product-grid' and 'features'. End with 'newsletter'.
- **Copy**: Write persuasive default copy for the sections based on the business type.

CRITICAL: Return ONLY JSON. No markdown fences.`;

  const userPrompt = `Design a store theme for: "${description}"`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return StoreThemeSchema.parse(parsed);
}

// ============================================================================
// ELEMENTOR BUILDER GENERATION
// ============================================================================
export const ElementorPageSchema = z.object({
  html: z.string(),
  css: z.string().optional(),
});

export type ElementorPageResult = z.infer<typeof ElementorPageSchema>;

export async function generateElementorPage(
  apiKey: string,
  prompt: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<ElementorPageResult> {
  const systemPrompt = `You are an elite landing page designer and conversion expert.
Your goal is to generate a world-class, high-converting landing page for the Bangladesh e-commerce market using HTML and Tailwind CSS.

### Design Principles:
- Use Tailwind CSS version 2.2 utility classes only.
- Direct rendering: Do not use React/Vue, just raw HTML strings.
- Mobile First: Ensure the layout looks stunning on mobile devices.
- Style: Premium, clean, and modern. Use gradients, rounded-3xl corners, and glassmorphism where appropriate.
- Font: Use 'Hind Siliguri' for Bengali text (it's already available in the canvas).
- Language: If the prompt is in Bengali or mentions a Bangladeshi context, use Persuasive Bengali for all headers and copy.

### Content Strategy:
1. Hero Section: Catchy headline, benefit-driven subheadline, and a prominent CTA button.
2. Trust Features: Include 3-4 trust badges (Fast Delivery, COD, etc.) with icons or emojis.
3. Product Showcase: Describe the product features and benefits clearly.
4. Social Proof: Include realistic testimonials with Bengali names (e.g., সাদমান কবির, তানজিনা আক্তার).
5. Professional Order Form: Include a section with a form to "Order Now".
6. Link CTAs: Ensure all "Order Now" or primary call-to-action buttons use <a> tags with href="#order" instead of <button>.

### CSS Rule:
- Return any custom CSS needed (e.g., animations or specific fonts) in the "css" field.
- Most styling should be done via Tailwind classes.

### Output Format:
Your response MUST be valid JSON:
{
  "html": "<section class='...'>...</section>",
  "css": ".animation { ... }"
}

Important: Return ONLY the JSON. No conversational text.`;

  const userPrompt = `Generate a high-converting landing page for: "${prompt}"
  
Include sections: Hero, Trust Badges, Features, Feedbacks, and Order Form.
Tone: Professional and Trustworthy.
Language: Bengali (if applicable).`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return ElementorPageSchema.parse(parsed);
}

// ============================================================================
// GRAPESJS PAGE GENERATION
// ============================================================================
const GrapesJsPageSchema = z.object({
  pageName: z.string().describe("Name of the landing page"),
  blocks: z.array(z.object({
    type: z.enum([
      'bd-hero', 
      'bd-trust', 
      'bd-order-form', 
      'bd-call-now', 
      'bd-video', 
      'bd-dual-order', 
      'bd-features-grid', 
      'bd-sticky-footer',
      'bd-faq',
      'bd-testimonials',
      'bd-comparison',
      'bd-gallery',
      'bd-social-proof',
      'bd-delivery-info',
      'bd-guarantee',
      'bd-why-buy',
      'bd-urgency-timer',
      'bd-trust-glass',
      'bd-order-form-premium',
      'bd-comparison-advanced',
      'bd-benefits-grid-rich'
    ]).describe("The type of GrapesJS block to use"),
    content: z.record(z.string()).describe("Key-value pairs for customizable content like headlines, button text, etc."),
    order: z.number().describe("Order of the block on the page"),
  })),
  primaryColor: z.string().describe("Primary brand color hex code"),
});

export type GrapesJsPageConfig = z.infer<typeof GrapesJsPageSchema>;

export async function generateGrapesJsPage(
  apiKey: string,
  prompt: string, 
  productInfo: { title: string; description?: string; price: number } | null = null,
  model = DEFAULT_MODEL, 
  baseUrl = DEFAULT_BASE_URL
): Promise<GrapesJsPageConfig> {
  // Use createAIService internally to pass options if needed, or just use callAI directly as helper
  // Use createAIService internally to pass options if needed, or just use callAI directly as helper
  // const service = createAIService(apiKey, { model, baseUrl });

  const systemPrompt = `
    You are an expert Landing Page Designer for the Bangladeshi e-commerce market.
    Your goal is to generate a high-conversion landing page structure using a predefined set of GrapesJS blocks.
    
    The available blocks are:
    - bd-hero: Hero section with product image and headline
    - bd-trust: Trust badges (Delivery, COD, Warranty)
    - bd-order-form: Bangla order form
    - bd-call-now: Sticky call button
    - bd-video: YouTube video embed
    - bd-dual-order: Product details + Order form side-by-side
    - bd-features-grid: 3-column feature grid
    - bd-sticky-footer: Mobile sticky footer with Call/Order buttons
    - bd-faq: FAQ accordion
    - bd-testimonials: Customer review grid
    - bd-comparison: Before/After comparison table
    - bd-gallery: Product image gallery
    - bd-social-proof: Order count/Live visitor count
    - bd-delivery-info: Delivery charges inside/outside Dhaka
    - bd-guarantee: Money back guarantee box
    - bd-why-buy: Problem vs Solution comparison
    - bd-urgency-timer: Sticky top bar with countdown and gradient
    - bd-trust-glass: Glassmorphism trust badges
    - bd-order-form-premium: Advanced 2-column order form with product summary
    - bd-comparison-advanced: Detailed problem/solution comparison with labels
    - bd-benefits-grid-rich: High-end icons and card design for benefits grid

    Rules for Multilingual Support:
    1. If user asks in Bengali/Banglish, content MUST be in **Bengali**.
    2. **CRITICAL:** ALL JSON KEYS (pageName, type, content, title, blocks) MUST BE IN ENGLISH.
    3. Do NOT translate "type" values (e.g., use "bd-hero", NOT "bd-hero-bangla").

    Layout Rules:
    1. ALWAYS include 'bd-hero' at the top (order: 1).
    2. ALWAYS include 'bd-order-form' or 'bd-dual-order' at least once.
    3. Use 'bd-sticky-footer' for mobile optimization (last block).
    4. Include 'bd-delivery-info' and 'bd-guarantee' near the order form.
    5. Choose a primary color that fits the product niche (e.g., #10B981 for organic/health, #3B82F6 for tech).

    Output STRICTLY in this JSON format (no other text):
    {
      "pageName": "Page Name",
      "blocks": [
        {
          "type": "bd-hero",
          "content": { 
             "title": "Title in appropriate language", 
             "subtitle": "Subtitle...",
             "buttonText": "Order Now"
          },
          "order": 1
        }
      ],
      "primaryColor": "#hexcode"
    }

    }

    CRITICAL: Return ONLY the JSON object. No explanations, no markdown code fences.
  `;

  const productContext = productInfo 
    ? `\n\nProduct Information (USE THIS FOR COPY):\n- Title: ${productInfo.title}\n- Description: ${productInfo.description || 'N/A'}\n- Price: ৳${productInfo.price}`
    : '';

  const userPrompt = `Create a high-converting landing page for: ${prompt}${productContext}`;

  // We reuse callAI helper but need to be careful with args
  const completion = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(completion);
  return GrapesJsPageSchema.parse(parsed);
}

// ============================================================================
// GRAPESJS CHAT COMMAND GENERATION - WORLD-CLASS (30 Actions)
// ============================================================================



export const GrapesJsCommandSchema = z.object({
  action: z.enum([
    // Design & Style (8)
    'update_style',
    'apply_color_scheme',
    'apply_typography',
    'add_animation',
    'apply_glassmorphism',
    'apply_gradient',
    'add_shadow',
    'make_responsive',
    
    // Content & Copy (5)
    'update_content',
    'generate_headline',
    'generate_description',
    'generate_cta',
    'improve_copy',
    
    // Smart Sections (12)
    'add_hero_section',
    'add_features_section',
    'add_pricing_table',
    'add_testimonials',
    'add_faq_section',
    'add_contact_form',
    'add_footer',
    'add_cta_banner',
    'add_image_gallery',
    'add_team_section',
    'add_stats_section',
    'add_logo_cloud',
    
    // Generic Components
    'add_component',
    'remove_component',
    'update_trait',
    
    // Advanced
    'update_layout',
    'optimize_seo',
    'add_custom_css',
    'duplicate_section',
    'reorder_sections',
    
    // Fallback
    'general_advice'
  ]).describe("The action to perform on the editor"),
  target: z.enum(['selected', 'wrapper']).optional().default('selected'),
  value: z.any().describe("Action-specific data"),
  message: z.string().describe("User-friendly message in Bengali/English"),
  commandId: z.string().optional(), // Unique ID to prevent loops
});

export type GrapesJsAction = z.infer<typeof GrapesJsCommandSchema.shape.action>;

export interface GrapesJsCommandResult {
  action: GrapesJsAction;
  target?: 'selected' | 'wrapper';
  value?: unknown;
  message?: string;
  commandId?: string; // Unique ID to prevent loops
}

export async function commandGrapesJs(
  apiKey: string,
  userPrompt: string,
  context: {
    selectedTagName?: string;
    selectedHtml?: string | null;
    selectedContent?: string;
    selectedClasses?: string[];
    selectedAttributes?: Record<string, unknown>;
    selectedStyles?: Record<string, unknown>;
    hasSelection?: boolean;
    productInfo?: { title: string; description?: string; price: number } | null;
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<GrapesJsCommandResult> {
  const systemPrompt = `You are a WORLD-CLASS AI Page Builder for landing pages. You can translate natural language (Bengali/English) into JSON commands for the GrapesJS editor.

### Available Actions (30 total):

#### 🎨 Design & Style
1. **update_style**: value = CSS object { backgroundColor: 'red', fontSize: '20px' }
2. **apply_color_scheme**: value = { primary, secondary, accent, background, text }
3. **apply_typography**: value = { headingFont, bodyFont, headingSize, bodySize }
4. **add_animation**: value = animation_name (fadeIn, slideUp, bounceIn, pulse, etc.)
5. **apply_glassmorphism**: value = true (adds backdrop-blur + transparency)
6. **apply_gradient**: value = { from, to, direction } or preset name (sunset, ocean, forest)
7. **add_shadow**: value = preset (sm, md, lg, xl, 2xl) or custom CSS
8. **make_responsive**: value = { mobile, tablet, desktop } responsive adjustments

#### 📝 Content & Copy (AI Generated)
9. **update_content**: value = new text string
10. **generate_headline**: value = { industry, tone } - AI generates compelling headline
11. **generate_description**: value = { product, audience } - AI generates description
12. **generate_cta**: value = { goal } - AI generates call-to-action text
13. **improve_copy**: value = 'persuasive' | 'professional' | 'casual' - rewrites text

#### 📦 Smart Sections (Pre-built Templates)
14. **add_hero_section**: value = { headline?, subheadline?, ctaText? }
15. **add_features_section**: value = { features?: [{ icon, title, desc }] }
16. **add_pricing_table**: value = { tiers?: 3 }
17. **add_testimonials**: value = { count?: 3 }
18. **add_faq_section**: value = { questions?: [{ q, a }] }
19. **add_contact_form**: value = { fields?: ['name', 'email', 'message'] }
20. **add_footer**: value = { columns?: 4 }
21. **add_cta_banner**: value = { text?, ctaText? }
22. **add_image_gallery**: value = { columns?: 4 }
23. **add_team_section**: value = { members?: 4 }
24. **add_stats_section**: value = { stats?: [{ number, label }] }
25. **add_logo_cloud**: value = { count?: 5 }

#### 🧩 Generic Components
26. **add_component**: value = HTML string (with Tailwind classes)
27. **remove_component**: value = true
28. **update_trait**: value = { href, src, alt, etc. }

#### ⚙️ Advanced
29. **update_layout**: value = { display, flexDirection, justifyContent, alignItems, gap }
30. **add_custom_css**: value = raw CSS string
31. **duplicate_section**: value = true
32. **reorder_sections**: value = 'up' | 'down'
33. **optimize_seo**: value = { title?, description?, keywords? }
34. **general_advice**: Cannot act, explain in message

### Rules:
1. **Language**: If user speaks Bengali/Banglish, respond in Bengali. Otherwise English.
2. **CRITICAL - Selected Element Priority**: 
   - If a specific element is selected (Tag is NOT 'none'), you MUST modify THAT element using update_content, update_style, update_trait, or update_layout.
   - DO NOT use add_component or add_*_section when user wants to modify the selected element.
   - Only use add_* actions when user explicitly asks to ADD something NEW to the page.
3. **For Button Modifications**: When user selects a button and asks to modify it:
   - Use update_content to change button text
   - Use update_trait with { href: '#order', 'data-action': 'order' } to connect to order form
   - Use update_style to change appearance
   - NEVER create a new section for button modifications
4. **Smart Sections**: When user asks for "pricing", "testimonials", etc., AND nothing specific is selected, use the smart section actions.
5. **CSS in update_style**: Use camelCase (backgroundColor, not background-color).
6. **Tailwind in add_component**: Use Tailwind classes in HTML (only when genuinely adding new content).
7. **Creativity**: For copywriting actions, be creative and persuasive.

### Color Presets:
- sunset: from-orange-500 to-pink-500
- ocean: from-blue-500 to-teal-400
- forest: from-green-600 to-emerald-400
- royal: from-indigo-600 to-purple-600
- midnight: from-gray-900 to-black

### Animation Presets:
fadeIn, fadeInUp, fadeInDown, slideUp, slideDown, slideLeft, slideRight, bounceIn, pulse, shake

### Output Format:
{
  "action": "update_trait",
  "target": "selected",
  "value": { "href": "#order", "data-action": "order" },
  "message": "বাটনে Order link যোগ করে দিলাম! 🛒"
}

CRITICAL: Return ONLY valid JSON. No markdown.`;

  const fullUserPrompt = `Context - Selected Component:
- ⚠️ ELEMENT SELECTED: ${context.hasSelection ? 'YES - MODIFY THIS ELEMENT' : 'NO - Can add new content'}
- Tag: ${context.selectedTagName || 'none (no selection)'}
- Selected HTML: ${context.selectedHtml ? context.selectedHtml.substring(0, 300) : 'none'}
- Content: ${context.selectedContent ? context.selectedContent.substring(0, 100) : 'none'}
- Classes: ${context.selectedClasses?.join(', ') || 'none'}
- Current Styles: ${context.selectedStyles ? JSON.stringify(context.selectedStyles).substring(0, 100) : 'none'}
- Featured Product: ${context.productInfo ? `${context.productInfo.title} (${context.productInfo.price} BDT)` : 'none'}

User Request: "${userPrompt}"

${context.hasSelection ? '⚠️ IMPORTANT: User has SELECTED an element. MODIFY it using update_content/update_style/update_trait. DO NOT create new sections!' : ''}

Generate GrapesJS Command JSON:`;

  const response = await callAI(apiKey, systemPrompt, fullUserPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  const command = GrapesJsCommandSchema.parse(parsed);

  return {
    ...command,
    commandId: crypto.randomUUID() // Ensure every command has a unique ID
  };
}


// ============================================================================
// ELEMENTOR SECTION EDITING
// ============================================================================
export const ElementorEditSchema = z.object({
  html: z.string(),
  css: z.string().optional(),
});

export type ElementorEditResult = z.infer<typeof ElementorEditSchema>;

export async function editElementorSection(
  apiKey: string,
  currentHtml: string,
  prompt: string,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<ElementorEditResult> {
  const systemPrompt = `You are an elite web developer and designer specialized in Tailwind CSS.
Your task is to EDIT the provided HTML component based on the user's request.

### Rules:
1. Maintain the overall structure unless asked to change it significantly.
2. Use Tailwind CSS utility classes for styling.
3. Preserve responsiveness and mobile-first design.
4. If the user asks for text changes, ensure the tone matches the context.
5. If the user asks for design changes, use modern, premium aesthetics.
6. Use 'Hind Siliguri' for Bengali text.
7. CRITICAL: When adding or modifying CTA buttons, ALWAYS use <a> tags with href="#order" to link to the order form.
8. CRITICAL: If asked to "Connect to Backend" or fix order form: Set <form> action="/api/create-order" method="POST", and inputs name="customer_name", name="phone", name="address".

### Output Format:
Your response MUST be valid JSON:
{
  "html": "<div class='updated-html'>...</div>",
  "css": ".optional-custom-css { ... }"
}`;

  const userPrompt = `Current HTML:
${currentHtml}

User Instruction:
${prompt}

Generate the updated JSON:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return ElementorEditSchema.parse(parsed);
}

export async function designCustomSection(
  apiKey: string,
  prompt: string,
  currentHtml?: string,
  productInfo: { title: string; description?: string; price: number } | null = null,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<ElementorPageResult> {
  const systemPrompt = `You are a world-class UI designer and Tailwind CSS developer.
Your task is to either DESIGN a new landing page section or EDIT an existing one using HTML and Tailwind CSS.

### Design Principles:
- Use Tailwind CSS 2.2 utility classes.
- Mobile-First: Ensure the section looks stunning on small screens.
- Aesthetics: Use rich gradients, glassmorphism, rounded-3xl corners, and smooth spacing.
- Font: Use 'Hind Siliguri' for all Bengali text.
- Language: If the prompt is in Bengali or mentions Bangladesh, use Persuasive Bengali.
- Interactive: Use hover effects (e.g., hover:scale-105) for CTA buttons.
- Links: ALL buttons should be <a> tags with href="#order".

### Combined Capability (Edit & Design):
- If 'currentHtml' is provided:
    - You MUST preserve the core structure if possible, but apply the requested changes.
    - If user says 'make it red', update background/text classes to red variants.
    - If user says 'move it right', use flex/grid alignment or margin classes.
    - If user says 'redesign completely', throw away old HTML and build fresh.
    - ALWAYS return a complete, valid <section> or <div>.
- If 'currentHtml' is NOT provided:
    - Design a fresh, premium section from scratch based on the prompt.

### Response format:
Your response MUST be valid JSON:
{
  "html": "<section class='...'>...</section>",
  "css": ".optional-custom-css { ... }"
}
Return ONLY the JSON. No markdown, no code fences.`;

  const productContext = productInfo 
    ? `\n\nFeatured Product Content (USE THIS):\n- Title: ${productInfo.title}\n- Description: ${productInfo.description || 'N/A'}\n- Price: ৳${productInfo.price}`
    : '';

  const userPrompt = currentHtml 
    ? `Objective: Edit/Refine the existing section.\nPrompt: "${prompt}"${productContext}\n\nCurrent HTML:\n${currentHtml}`
    : `Objective: Design from scratch.\nPrompt: "${prompt}"${productContext}`;

  const response = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return ElementorPageSchema.parse(parsed);
}

// ============================================================================
// CHATBOT: RAG & SYSTEM KNOWLEDGE
// ============================================================================

export async function chatWithMerchant(
  apiKey: string,
  userMessage: string,
  storeId: number,
  context: {
    storeName: string;
    userName: string;
    planType?: string;
    pageContext?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    analytics?: {
      todaySales: string | number;
      salesTrend: number;
      revenue: string | number;
      pendingOrders: number;
      lowStock: number;
      orders: number;
      products: number;
      abandonedCarts: number;
    };
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL,
  aiContext?: { AI: unknown; VECTORIZE: unknown } // Added Cloudflare Env Context
): Promise<string> {
  // 1. RAG: Search for relevant context using Vectorize
  let ragContext = "";
  if (aiContext?.VECTORIZE) {
    try {
      console.warn('[AI] Searching vectors for query:', userMessage);
      // Pass storeId for tenant isolation
      const vectors = await searchVectors(userMessage, storeId, aiContext, 3);
      if (vectors.length > 0) {
        ragContext = "\n\nRelevant Documentation/Context:\n" + 
          vectors.map(v => `- ${v.metadata?.text || 'No text'}`).join("\n");
        console.warn('[AI] RAG Context injected:', vectors.length, 'items');
      }
    } catch (e) {
      console.error('[AI] RAG Search failed:', e);
    }
  }

  // 2. Format Chat History
  let historyText = '';
  if (context.history && context.history.length > 0) {
    historyText = context.history.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
  }

  // Simplified RAG: We inject knowledge about the system
  const systemKnowledge = `
    MultiStore SaaS Platform Knowledge Base:
    - **Stores**: Merchants can create online stores with custom domains.
    - **Products**: Supports variants, inventory tracking, and logical categories.
    - **Orders**: Tracks status (pending, shipped, delivered), payment status, and courier tracking (Pathao, RedX).
    - **Shipping**: Configurable zones (Inside Dhaka, Outside Dhaka) with different rates.
    - **Payments**: Supports Manual (bKash/Nagad send money) and Automated (Stripe, SSLCommerz).
    - **Marketing**: Email campaigns, discount codes, and upsells are available.
    - **Themes**: GrapesJS builder for custom landing pages.
  `;

  const systemPrompt = `You are a helpful AI Assistant for a Merchant on the MultiStore SaaS platform.
  
  Your goal is to help the merchant (${context.userName} from store "${context.storeName}") manage their business.
  You have access to their REAL-TIME business data only through the "Store Health Report" below. Use it to provide intelligent insights.
  
  ### Context
  - Store ID: ${storeId}
  - Plan: ${context.planType || 'Free'}
  - Current Page: ${context.pageContext || 'Dashboard'}

  ### Chat History
  ${historyText ? historyText : "No previous messages."}

  ### Relevant Documentation (RAG)
  ${ragContext ? ragContext : "No specific documentation found for this query."}

  ### Store Health Report (Real-time)
  ${context.analytics ? `
  - Today's Sales: ৳${context.analytics.todaySales} (Trend: ${context.analytics.salesTrend > 0 ? '+' : ''}${context.analytics.salesTrend}% vs yesterday)
  - Total Revenue: ৳${context.analytics.revenue}
  - Pending Orders: ${context.analytics.pendingOrders} (Action required!)
  - Low Stock Items: ${context.analytics.lowStock} (Restock needed!)
  - Total Orders: ${context.analytics.orders}
  - Total Products: ${context.analytics.products}
  - Abandoned Carts: ${context.analytics.abandonedCarts}
  ` : "No analytics data available."}

  ### General Knowledge Base
  ${systemKnowledge}

  ### Rules
  1. **Language & Tone**: 
     - IF User speaks **Bengali** (or Banglish) -> You MUST reply in **Bengali**. Translate all analytics terms (e.g., "Pending Orders" -> "অপেক্ষমান অর্ডার") contextually.
     - IF User speaks **English** -> Reply in **English**.
     - Be friendly, professional, and concise.
  2. **Data Safety**: You CANNOT access data from other stores. If asked about global stats, say you can only see their store.
  3. **Capabilities**: You can explain how to use features or answer questions about *their* store based on the provided data only.
  4. **Strictness**: If asked to generate code or SQL, refuse politely. You are a business assistant.
  5. **Analytics Usage & UI**: 
     - You have real-time data. USE IT. 
     - IF the user asks "How is business?", "Sales update", "Any new orders?", or generally about the store's status:
       **YOU MUST RETURN A JSON OBJECT** (and nothing else, strictly JSON) in this format:
       {
         "type": "insight_card",
         "data": {
           "totalSales": "৳15,000",
           "orderCount": 5,
           "trend": 12,
           "suggestions": ["Check pending orders", "Restock low items", "Send email campaign"]
         }
       }
       - 'totalSales': Today's sales with currency symbol.
       - 'orderCount': Today's order count (number).
       - 'trend': Sales trend percentage (number, can be negative).
       - 'suggestions': Array of 2-3 short, actionable strings in the user's language (Bengali/English).
     - For other questions, reply normally in plain text.
  
  User Question: "${userMessage}"
  
  Answer:`;

  return callAI(apiKey, systemPrompt, userMessage, model, baseUrl);
}

export async function chatWithSuperAdmin(
  apiKey: string,
  userMessage: string,
  context: {
    userId: number;
    userName: string;
    platformStats?: {
      currentRevenue: number;
      currentOrders: number;
      revenueGrowth: number;
      activeStores: number;
    };
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<string> {
  const systemPrompt = `You are the Super Admin Assistant.
  You have high-level privileges and can discuss system-wide health, revenue, and user growth.
  
  User: ${context.userName} (Super Admin)
  
  CURRENT PLATFORM METRICS (USE ONLY THESE VALUES):
  - Revenue (Last 7 days): ৳${context.platformStats?.currentRevenue ?? 0}
  - Orders (Last 7 days): ${context.platformStats?.currentOrders ?? 0}
  - Revenue Growth vs previous 7 days: ${context.platformStats?.revenueGrowth ?? 0}%
  - Active Stores: ${context.platformStats?.activeStores ?? 0}
  
  Rules:
  1. Be professional and concise.
  2. You can discuss sensitive platform metrics ONLY from the data above.
  3. NEVER invent numbers. If a metric is not provided, say you don't have access.
  4. NEVER say "reflected above", "shown above", or reference hidden charts/cards. Always include the required numbers directly in your reply.
  5. If the prompt is vague (e.g., "ok", "status", "update"), reply with a short live snapshot using the metrics above.
  `;

  return callAI(apiKey, systemPrompt, userMessage, model, baseUrl);
}

/**
 * Generate vector embeddings for text using Cloudflare Workers AI
 * Free Tier: 10,000 requests/day
 */
async function generateEmbedding(text: string, context: { AI: unknown }): Promise<number[]> {
  if (!context?.AI) {
    console.warn('[AI] Cloudflare Workers AI binding not found. Mocking embedding.');
    // Fallback or throw based on strictness. Throwing for now to ensure config is correct.
    throw new Error('Cloudflare AI binding (env.AI) missing');
  }

  try {
    const ai = context.AI as { run: (model: string, input: { text: string[] }) => Promise<{ data: number[][] }> };
    const response = await ai.run(EMBEDDING_MODEL, {
      text: [text] // Array input supported
    });

    // Response format: { shape: [1, 768], data: [[...]] } or { data: [[...]] }
    if (response?.data && response.data.length > 0) {
      // API returns [[0.1, 0.2...]], we want the first vector
      return response.data[0];
    }
    
    throw new Error('Invalid embedding response');
  } catch (error) {
    console.error('Embedding Generation Failed:', error);
    throw error;
  }
}

/**
 * Insert a vector into the Cloudflare Vectorize index
 */
/**
 * Insert a vector into the Cloudflare Vectorize index
 */
/**
 * Insert or Update a vector in the Cloudflare Vectorize index
 */
async function insertVector(
  text: string, 
  metadata: { storeId: number | string; customId?: string; [key: string]: unknown }, 
  context: { AI: unknown; VECTORIZE: unknown }
): Promise<void> {
  if (!context?.VECTORIZE) {
    console.warn('[AI] Vectorize binding missing. Skipping vector insertion.');
    return;
  }

  try {
    const values = await generateEmbedding(text, context);
    // Use customId if provided (for Sync), otherwise random
    const id = metadata.customId || crypto.randomUUID();
    
    // Cloudflare Vectorize upsert (inserts or replaces)
    const vectorize = context.VECTORIZE as { upsert: (vectors: unknown[]) => Promise<void> };
    await vectorize.upsert([{
      id,
      values,
      metadata: {
        ...metadata,
        storeId: String(metadata.storeId), // Ensure storeId is string
        text // Store text in metadata
      }
    }]);
    
    console.warn(`[AI] Vector upserted: ${id} for Store: ${metadata.storeId}`);
  } catch (error) {
    console.error('[AI] Vector Upsert Failed:', error);
  }
}

/**
 * Delete a vector by ID
 */
async function deleteVector(
  id: string,
  context: { VECTORIZE: unknown }
): Promise<void> {
  if (!context?.VECTORIZE) return;
  try {
    const vectorize = context.VECTORIZE as { deleteByIds: (ids: string[]) => Promise<void> };
    await vectorize.deleteByIds([id]);
    console.warn(`[AI] Vector deleted: ${id}`);
  } catch (error) {
    console.error('[AI] Vector Deletion Failed:', error);
  }
}

/**
 * Search for similar vectors in the Cloudflare Vectorize index
 */
async function searchVectors(
  query: string, 
  storeId: number | string,
  context: { AI: unknown; VECTORIZE: unknown },
  limit: number = 3
): Promise<Array<{ score: number; metadata: Record<string, unknown> }>> {
  if (!context?.VECTORIZE) {
    console.warn('[AI] Vectorize binding missing. Skipping vector search.');
    return [];
  }

  try {
    const vector = await generateEmbedding(query, context);
    
    // TENANT ISOLATION:
    // We STRICTLY filter by storeId to ensure one store cannot see another's data.
    const vectorize = context.VECTORIZE as { query: (vector: number[], options: unknown) => Promise<{ matches: Array<{ score: number; metadata: Record<string, unknown> }> }> };
    const results = await vectorize.query(vector, {
      topK: limit,
      filter: { storeId: String(storeId) }, // Only match vectors with this storeId
      returnMetadata: true
    });

    console.warn(`[AI] Vector search for Store ${storeId} found ${results.matches.length} matches`);
    return results.matches || [];
  } catch (error) {
    console.error('[AI] Vector Search Failed:', error);
    return [];
  }
}

// ============================================================================
// OZZYL AI: Enterprise-Grade Visitor Chatbot
// ============================================================================

/**
 * Ozzyl AI - The first impression chatbot for marketing landing page visitors.
 * This chatbot has complete knowledge of the Ozzyl platform and can
 * answer any question about pricing, features, integrations, and business value.
 */
export async function chatWithVisitor(
  apiKey: string,
  userMessage: string,
  context: {
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  } = {},
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<string> {
  // Format Chat History for context
  let historyText = '';
  if (context.history && context.history.length > 0) {
    historyText = context.history.map(msg => 
      `${msg.role === 'user' ? 'Visitor' : 'Ozzyl AI'}: ${msg.content}`
    ).join('\n\n');
  }

  const signupLink = 'https://app.ozzyl.com/auth/register';
  const systemPrompt = `# Ozzyl AI - Ozzyl বিক্রয় সহায়ক

তুমি **Ozzyl AI** - Ozzyl প্ল্যাটফর্মের অফিসিয়াল AI assistant। তোমার প্রধান কাজ হলো visitors দের প্রশ্নের উত্তর দেওয়া এবং সঠিক তথ্য দিয়ে sign up করতে help করা।

---

## 🏢 কোম্পানি সম্পর্কে

**Ozzyl** হলো বাংলাদেশী মার্চেন্টদের জন্য তৈরি e-commerce solution। এটি বর্তমানে **Beta** লঞ্চ পর্যায়ে আছে।

**Tagline**: "মিনিটে অনলাইন স্টোর, লক্ষ টাকার বিজনেস"

---

## ⛔ STRICT KNOWLEDGE RULES (ANTI-HALLUCINATION)
- **ONLY** use the information provided in this prompt (Pricing, Features, Company Info).
- **DO NOT** make up features that are not listed here.
- If asked about a feature not listed (e.g. "Do you have POS?", "Do you have mobile app?"), say "Currently we don't have that feature, but we are working on it."
- If asked about reviews/ratings/large user counts, say: "আমরা এখন Beta পর্যায়ে আছি, এখনো public reviews/ratings প্রকাশ করা হয়নি।"
- Do not claim specific counts (users, reviews, orders) unless explicitly listed here.
- **Accuracy** is more important than being helpful. Do not guess.

---

## 💰 প্রাইসিং (BDT)

### Free Plan (৳${PLAN_PRICES.free}/মাস)
- ${PLAN_LIMITS.free.max_products}টি প্রোডাক্ট
- ${PLAN_LIMITS.free.max_orders} অর্ডার/মাস
- Landing Page Mode
- Cash on Delivery
- Basic Analytics
- Subdomain: yourstore.ozzyl.com

### Starter Plan (৳${PLAN_PRICES.starter}/মাস) ⭐ সবচেয়ে জনপ্রিয়
- ${PLAN_LIMITS.starter.max_products}টি প্রোডাক্ট
- ${PLAN_LIMITS.starter.max_orders} অর্ডার/মাস
- Full Store Mode
- বিকাশ + নগদ + COD
- Inventory Tracking
- Email Notifications
- Order Management Dashboard

### Premium Plan (৳${PLAN_PRICES.premium}/মাস)
- ${PLAN_LIMITS.premium.max_products}টি প্রোডাক্ট
- ${PLAN_LIMITS.premium.max_orders} অর্ডার/মাস
- কাস্টম ডোমেইন
- Priority Support
- Team Members (৩ জন)
- কুরিয়ার Integration (Pathao, RedX, Steadfast)
- AI-Powered Features
- Advanced Analytics

---

## 🚚 পেমেন্ট ও ডেলিভারি

### পেমেন্ট মেথড
- **বিকাশ**: সরাসরি আপনার personal বিকাশে পেমেন্ট যায়
- **নগদ**: সরাসরি আপনার personal নগদে পেমেন্ট যায়
- **Cash on Delivery (COD)**: কাস্টমার প্রোডাক্ট হাতে পেয়ে টাকা দেবে
- **Stripe/Card**: International payment support (Premium)

### কুরিয়ার Integration
- **Pathao**: Auto-create shipments
- **RedX**: Auto-create shipments
- **Steadfast**: Auto-create shipments
- Real-time tracking
- Delivery status updates

### শিপিং চার্জ
- ঢাকার ভিতরে: মার্চেন্ট সেট করে (সাধারণত ৬০-৮০ টাকা)
- ঢাকার বাইরে: মার্চেন্ট সেট করে (সাধারণত ১২০-১৫০ টাকা)

---

## ✨ মূল ফিচারসমূহ

### All‑in‑One Platform
- ✅ Store + Landing Page + Marketing + Analytics একসাথে
- ✅ AI‑assisted setup ও কনটেন্ট

### Store Management
- ✅ Professional storefront
- ✅ Product variants (Size, Color, etc.)
- ✅ Inventory tracking
- ✅ SKU management
- ✅ Category organization
- ✅ Product images upload

### Order Management
- ✅ Order dashboard
- ✅ Order status tracking (Pending → Processing → Shipped → Delivered)
- ✅ Invoice printing
- ✅ COD collection tracking
- ✅ Customer communication

### Marketing Tools
- ✅ Discount codes
- ✅ Email campaigns
- ✅ Upsell features
- ✅ Facebook Pixel integration
- ✅ Google Analytics

### Landing Page Builder (GrapesJS)
- ✅ Drag & drop page builder
- ✅ ২০+ ready-made templates
- ✅ AI-powered page generation
- ✅ Mobile responsive designs
- ✅ Bengali-first templates

### AI Features (Pro)
- ✅ AI Store Setup - বিজনেস describe করলে AI পুরো store সেটআপ করে দেয়
- ✅ AI Landing Page - AI হাই-কনভার্টিং ল্যান্ডিং পেজ বানায়
- ✅ AI Design Assistant - চ্যাট করে ডিজাইন এডিট করুন

---

## 🏆 কেন Ozzyl?

### Speed (গতি)
- Cloudflare infrastructure ব্যবহার করা হয় যাতে লোডিং দ্রুত হয়
- লক্ষ্য: দ্রুত ও স্থিতিশীল অভিজ্ঞতা

### Trust (বিশ্বাস)
- Beta পর্যায়ে আছি, তাই এখনো public reviews/ratings দেখাই না
- সাপোর্ট চ্যানেল রয়েছে (WhatsApp, Facebook Messenger, Email)

### Simplicity (সহজতা)
- ১০ মিনিটে store ready
- কোনো টেকনিক্যাল knowledge দরকার নেই
- বাংলায় সম্পূর্ণ interface

---

## 🔄 কিভাবে শুরু করবেন?

1. **Sign Up**: Email দিয়ে রেজিস্টার করুন (${signupLink})
2. **Store Name**: আপনার store এর নাম দিন (yourstore.ozzyl.com)
3. **Add Product**: প্রোডাক্ট ছবি ও দাম যোগ করুন
4. **Share Link**: Facebook এ লিংক শেয়ার করে অর্ডার নিন!

**১০ মিনিটে আপনার অনলাইন বিজনেস ready!**

---

## ❓ FAQ

**Q: Free plan চিরকাল ফ্রি?**
A: হ্যাঁ! কোনো hidden charge নেই। আপগ্রেড করতে চাইলে করবেন, না চাইলে ফ্রি তেই থাকুন।

**Q: আমার টাকা কি Ozzyl hold করে?**
A: না! বিকাশ/নগদ পেমেন্ট সরাসরি আপনার personal account এ যায়। আমরা কখনো টাকায় হাত দিই না।

**Q: কাস্টম ডোমেইন কিভাবে?**
A: Premium plan এ আপনার নিজের domain (যেমন www.yourshop.com) connect করতে পারবেন।

**Q: Support কিভাবে পাব?**
A: WhatsApp, Facebook Messenger, এবং Email এ 24/7 support আছে।

---

## 💬 Chat History
${historyText || "কোনো previous message নেই।"}

---

## 📋 তোমার নিয়ম

1. **ভাষা**: Visitor যে ভাষায় প্রশ্ন করবে সেই ভাষায় উত্তর দাও। Bengali হলে Bengali, English হলে English।

2. **Tone**: Friendly, helpful, এবং professional। Sales-focused কিন্তু pushy না।

3. **Length**: সংক্ষেপে কিন্তু পূর্ণাঙ্গ উত্তর দাও। প্রশ্ন অনুযায়ী ২-৪ বাক্যে উত্তর দেওয়ার চেষ্টা করো, খুব বেশি বড় করো না।

4. **CTA**: প্রতিটি উত্তরের শেষে softly sign up করতে encourage করো।

5. **Out of scope**: 
   - কোড লিখতে বললে বলো "আমি কোড লেখার জন্য নই, কিন্তু আমাদের platform এ কোনো coding দরকার নেই!"
   - প্রতিযোগী সম্পর্কে negative কিছু বলো না
   - ব্যক্তিগত/sensitive তথ্য চাইও না

6. **Accuracy**: শুধু উপরের knowledge base থেকে তথ্য দাও, কিছু বানিয়ে বলো না।

7. **FORMATTING - MOST IMPORTANT**:
   - কখনো markdown formatting (** বা ## বা ### বা - বা *) ব্যবহার করো না
   - শুধু plain text লেখো
   - প্রতিটি point বা step নতুন line এ লেখো (ENTER দিয়ে)
   - Lists এ প্রতি item আলাদা line এ এভাবে দেখাও:
     ✅ প্রথম point
     ✅ দ্বিতীয় point  
     ✅ তৃতীয় point
   - Response সংক্ষিপ্ত এবং readable রাখো
   - Emojis ব্যবহার করো structure বোঝাতে

---

Visitor এর প্রশ্ন: "${userMessage}"

তোমার উত্তর:`;

  return callAI(apiKey, systemPrompt, userMessage, model, baseUrl);
}

// ============================================================================
// STORE EDITOR NATURAL LANGUAGE COMMANDS
// ============================================================================

/**
 * Schema for Store Editor Commands
 * Supports ALL editable fields for Lovable-like editing experience
 */
// Store Editor Natural Language Commands - WORLD CLASS (30+ Actions)
export const StoreEditorCommandSchema = z.object({
  action: z.enum([
    // Theme & Colors (Existing)
    'update_colors', 'update_font', 'apply_preset',
    
    // Sections (Existing)
    'add_section', 'remove_section', 'update_section', 'reorder_sections',
    
    // Header & Footer (Existing)
    'update_header', 'update_footer',
    
    // Announcement & Banner (Existing)
    'update_announcement', 'update_banner',
    
    // Store Info (Existing)
    'update_logo', 'update_business_info', 'update_social_links',
    
    // Advanced UI (Existing)
    'update_floating_buttons', 'update_checkout', 'update_typography', 'update_custom_css',
    
    // NEW: Sales & Marketing (Business Growth)
    'setup_flash_sale',       // Banner + Timer + Colors
    'add_trust_badges',       // Payment icons, guarantee seals
    'add_marketing_popup',    // Email collection/Offer popup
    'create_policy_pages',    // Privacy, Terms, Refund pages
    'optimize_seo',           // Meta title, description
    
    // NEW: Content & Navigation
    'update_navigation',             // Add menu items (New Arrivals, Sale)
    'generate_product_description',  // AI-generated product copy
    'setup_blog',                    // Create/update blog section
    
    // NEW: Visual Polish
    'apply_modern_card_style',       // Update product card design
    'add_video_section',             // Add YouTube/video section
    
    // Fallback
    'general_response'
  ]),
  target: z.string().optional(),
  position: z.enum(['before', 'after', 'first', 'last']).optional(),
  value: z.any(),
  message: z.string(),
  confidence: z.number().min(0).max(1),
  requiresConfirmation: z.boolean().optional(),
});

export type StoreEditorCommandResult = z.infer<typeof StoreEditorCommandSchema>;

/**
 * Command Store Editor - Natural Language to JSON Actions
 */
export async function commandStoreEditor(
  apiKey: string,
  userPrompt: string,
  context: {
    sections: Array<{ id: string; type: string; settings: unknown }>;
    currentColors: { primary: string; accent: string; background: string; text: string };
    currentFont: string;
    storeName: string;
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<StoreEditorCommandResult> {
  const systemPrompt = `You are an expert Store Editor AI. Your goal is to help merchants build a "World-Class" online store.
Translate natural language commands (Bengali/English) into JSON actions.

### Available Actions (30 total - covering Design, Sales, Marketing):

#### 🎨 Design & Theme
1. **update_colors**: value = { primaryColor?, accentColor?, ... }
2. **update_font**: value = font_id
3. **apply_preset**: value = preset_name
4. **update_typography**: value = { headingSize, bodySize }
5. **update_custom_css**: value = css_string
6. **apply_modern_card_style**: value = 'minimal' | 'bordered' | 'shadow'

#### 🏗️ Structure & Layout
7. **add_section**: value = { type: 'hero'|'features'|'testimonials'|'flash-sale'|'trust-badge'|'video' }
8. **remove_section**: target = id/type
9. **update_section**: target = id/type, value = settings
10. **reorder_sections**: target = id, value = 'up'/'down'
11. **update_header**: value = { layout, showSearch }
12. **update_footer**: value = { copyrightText, description }
13. **update_navigation**: value = { items: [{ label, url }] } - Add 'New Arrivals', 'Sale' etc.

#### 📢 Marketing & Sales (Growth Tools)
14. **setup_flash_sale**: value = { text, endTime, backgroundColor } - Creates urgency
15. **add_trust_badges**: value = { showPaymentIcons: true, showGuarantee: true } - Builds trust
16. **add_marketing_popup**: value = { title, description, offerCode } - Collects leads
17. **update_announcement**: value = { text, link } - Top bar notification
18. **update_banner**: value = { text, url } - Hero banner
19. **optimize_seo**: value = { metaTitle, metaDescription } - Improve Google ranking

#### 📝 Content & Info
20. **update_logo**: value = url
21. **update_business_info**: value = { phone, email }
22. **update_social_links**: value = { facebook, instagram }
23. **create_policy_pages**: value = { privacy: true, terms: true }
24. **generate_product_description**: value = { productName, tone }
25. **setup_blog**: value = { title, posts: 3 }

#### ⚙️ Advanced
26. **update_floating_buttons**: value = { whatsappEnabled, callEnabled }
27. **update_checkout**: value = 'one_page' | 'standard'

### Rules:
1. **Language**: Respond in the same language as the user (Bengali/English).
2. **Flash Sale Intent**: "Flash Sale" or "Offer" -> setup_flash_sale.
3. **Trust Intent**: "Trusted korbe kivabe" or "Trust badges" -> add_trust_badges.
4. **Popup Intent**: "Email collect" or "Popup" -> add_marketing_popup.
5. **SEO Intent**: "Google ranking" or "SEO" -> optimize_seo.

### Output Format:
{
  "action": "setup_flash_sale",
  "target": "header",
  "value": { "text": "🔥 50% OFF Ends Soon!", "endTime": "2025-12-31" },
  "message": "Flash Sale সেটআপ করে দিয়েছি! এখন ভিজিটররা তাড়া অনুভব করবে। 🔥",
  "confidence": 0.95
}

CRITICAL: Return ONLY valid JSON.`;

  const fullUserPrompt = `
Current Store: ${context.storeName}
User Command: "${userPrompt}"

Generate Store Editor Command JSON:`;

  const response = await callAI(apiKey, systemPrompt, fullUserPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return StoreEditorCommandSchema.parse(parsed);
}

// ============================================================================
// EXPORT: AI Service Factory
// ============================================================================
export function createAIService(apiKey: string | undefined, options?: { model?: string, baseUrl?: string, context?: unknown }) {
  // Ensure API key is present for AI features
  // We allow undefined initialization but methods will fail if called without key, 
  // OR we enforce it here. Given the lint errors, strict enforcement or default empty string is needed.
  // The downstream functions require string.
  const validApiKey = apiKey || ''; 


  const model = options?.model || DEFAULT_MODEL;
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiContext = (options?.context as any) || {};

  return {
    // List Generation
    generateListItems: (fieldType: string, count: number, topic: string) => 
      generateListItems(validApiKey, fieldType, count, topic, model, baseUrl),

    generateStoreSetup: (description: string) => 
      generateStoreSetup(validApiKey, description, model, baseUrl),
    
    generateStoreThemeConfig: (description: string) =>
      generateStoreThemeConfig(validApiKey, description, model, baseUrl),

    // New Vector Capabilities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insertVector: (text: string, metadata: { storeId: number | string; customId?: string; [key: string]: any }) => insertVector(text, metadata, aiContext),
    deleteVector: (id: string) => deleteVector(id, aiContext),
    searchVectors: (query: string, storeId: number | string, limit?: number) => searchVectors(query, storeId, aiContext, limit),
    generateEmbedding: (text: string) => generateEmbedding(text, aiContext),
    
    generateLandingConfig: (productInfo: { title: string; description?: string; price: number }, style?: string) =>
      generateLandingConfig(validApiKey, productInfo, style, model, baseUrl),
    
    generateFullPage: (businessDescription: string) =>
      generateFullPage(validApiKey, businessDescription, model, baseUrl),
    
    editSection: (sectionName: string, currentData: unknown, prompt: string) =>
      editSection(validApiKey, sectionName, currentData, prompt, model, baseUrl),
    
    enhanceText: (fieldType: string, currentText: string, keywords: string) =>
      enhanceText(validApiKey, fieldType, currentText, keywords, model, baseUrl),
    
    quickEdit: (currentText: string, prompt: string) =>
      quickEdit(validApiKey, currentText, prompt, model, baseUrl),
    
    generateElementorPage: (prompt: string) =>
      generateElementorPage(validApiKey, prompt, model, baseUrl),
    editElementorSection: (currentHtml: string, prompt: string) => 
      editElementorSection(validApiKey, currentHtml, prompt, options?.model, options?.baseUrl),
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateGrapesJsPage: (prompt: string, productInfo?: any) => 
      generateGrapesJsPage(validApiKey, prompt, productInfo, model, baseUrl),
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    designCustomSection: (prompt: string, currentHtml?: string, productInfo?: any) =>
      designCustomSection(validApiKey, prompt, currentHtml, productInfo, model, baseUrl),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commandGrapesJs: (prompt: string, context: any) =>
      commandGrapesJs(validApiKey, prompt, context, options?.model, options?.baseUrl),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatWithMerchant: (message: string, storeId: number, context: any) =>
      chatWithMerchant(validApiKey, message, storeId, context, options?.model, options?.baseUrl, aiContext),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatWithSuperAdmin: (message: string, context: any) =>
      chatWithSuperAdmin(validApiKey, message, context, options?.model, options?.baseUrl),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatWithVisitor: (message: string, context: any = {}) =>
      chatWithVisitor(validApiKey, message, context, options?.model, options?.baseUrl),

    // Store Editor Natural Language Commands
    commandStoreEditor: (prompt: string, context: { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sections: Array<{ id: string; type: string; settings: any }>;
      currentColors: { primary: string; accent: string; background: string; text: string };
      currentFont: string;
      storeName: string;
    }) =>
      commandStoreEditor(validApiKey, prompt, context, options?.model, options?.baseUrl),
  };
}
