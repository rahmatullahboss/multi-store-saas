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

// Cloudflare Workers AI Binding Type
export interface Env {
  AI: any; // Cloudflare Workers AI namespace
  VECTORIZE: any; // Cloudflare Vectorize Index binding
}

// Embedding Model
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';



// ============================================================================
// CONFIGURATION
// ============================================================================
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

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
});

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
  console.log(`[AI] Calling AI with model: ${model} at ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    console.log(`[AI] Response received. Length: ${content?.length || 0}${data.usage ? `, Tokens: ${data.usage.total_tokens}` : ''}`);
    
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
  console.log('[AI] Extracting JSON from response...');
  
  try {
    // 1. Try to find JSON in markdown block first
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      console.log('[AI] Found JSON inside markdown block');
      return JSON.parse(jsonMatch[1]);
    }
    
    // 2. Try to find the first `{` and last `}` to handle unwrapped JSON with extra text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
       console.log('[AI] Found JSON object pattern in text');
       return JSON.parse(objectMatch[0]);
    }
    
    // 3. Fallback: Try to parse the whole text (rarely works if there's noise)
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      console.log('[AI] Parsing whole response as JSON');
      return JSON.parse(trimmed);
    }
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
    "suggestedPrice": 1500
  }
}

Important:
- Store name should be memorable and relevant
- Product description should be persuasive and highlight benefits
- Price should be realistic for Bangladesh market (in BDT/Taka)
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
  model = DEFAULT_MODEL, 
  baseUrl = DEFAULT_BASE_URL
): Promise<GrapesJsPageConfig> {
  // Use createAIService internally to pass options if needed, or just use callAI directly as helper
  const service = createAIService(apiKey, { model, baseUrl });

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

  const userPrompt = `Create a high-converting landing page for: ${prompt}`;

  // We reuse callAI helper but need to be careful with args
  const completion = await callAI(apiKey, systemPrompt, userPrompt, model, baseUrl);
  const parsed = extractJSON(completion);
  return GrapesJsPageSchema.parse(parsed);
}

// ============================================================================
// GRAPESJS CHAT COMMAND GENERATION
// ============================================================================
export const GrapesJsCommandSchema = z.object({
  action: z.enum([
    'update_style', 
    'update_content', 
    'add_component', 
    'remove_component', 
    'update_trait',
    'general_advice'
  ]).describe("The action to perform on the editor"),
  target: z.enum(['selected', 'wrapper']).optional().default('selected').describe("The target element (selected component or the entire page wrapper)"),
  value: z.any().describe("The data required for the action (CSS object for style, HTML string for add_component, text for update_content)"),
  message: z.string().describe("A short, friendly message to the user explaining what the AI did"),
});

export type GrapesJsCommandResult = z.infer<typeof GrapesJsCommandSchema>;

export async function commandGrapesJs(
  apiKey: string,
  userPrompt: string,
  context: {
    selectedTagName?: string;
    selectedContent?: string;
    selectedClasses?: string[];
    selectedAttributes?: Record<string, any>;
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<GrapesJsCommandResult> {
  const systemPrompt = `You are an expert GrapesJS Loop Controller. Your job is to translate natural language user requests into JSON commands that the GrapesJS editor can execute.

You have access to the currently selected component's context.

### Available Actions:
1. **update_style**: Return a CSS object in "value". Use camelCase properties (e.g., { backgroundColor: 'red', fontSize: '20px' }).
2. **update_content**: Return the new text string in "value". Used for changing text inside elements.
3. **add_component**: Return an HTML string in "value". Appends this HTML *after* the selected component (or inside, if it's a container and the intent is to add inside).
4. **remove_component**: Set "value" to true. Deletes the selected component.
5. **update_trait**: Return an object of traits in "value" (e.g., { href: 'https://...' }).
6. **general_advice**: If the request is a question or cannot be acted upon, explain why or answer the question in "message". Set "value" to null.

### Rules:
- If the user wants to change the look, use 'update_style'.
- If the user wants to change the text, use 'update_content'.
- If the user wants to add a section, button, or element, use 'add_component'.
- If the user asks to "delete this", use 'remove_component'.
- **CRITICAL**: Use Tailwind CSS classes in 'add_component' HTML strings if possible, but for 'update_style', use raw CSS properties.
- **CRITICAL**: Return ONLY JSON.

### Output Format:
{
  "action": "update_style",
  "target": "selected",
  "value": { "color": "#ff0000" },
  "message": "I've changed the text color to red for you."
}`;

  const fullUserPrompt = `
Context - Selected Component:
- Tag: ${context.selectedTagName || 'none'}
- Content Preview: ${context.selectedContent ? context.selectedContent.substring(0, 100) + '...' : 'none'}
- Classes: ${context.selectedClasses?.join(', ') || 'none'}

User Request: "${userPrompt}"

Generate GrapesJS API Command JSON:`;

  const response = await callAI(apiKey, systemPrompt, fullUserPrompt, model, baseUrl);
  const parsed = extractJSON(response);
  return GrapesJsCommandSchema.parse(parsed);
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

  const userPrompt = currentHtml 
    ? `Objective: Edit/Refine the existing section.\nPrompt: "${prompt}"\n\nCurrent HTML:\n${currentHtml}`
    : `Objective: Design from scratch.\nPrompt: "${prompt}"`;

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
    analytics?: any;
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL,
  aiContext?: { AI: any; VECTORIZE: any } // Added Cloudflare Env Context
): Promise<string> {
  // 1. RAG: Search for relevant context using Vectorize
  let ragContext = "";
  if (aiContext?.VECTORIZE) {
    try {
      console.log('[AI] Searching vectors for query:', userMessage);
      // Pass storeId for tenant isolation
      const vectors = await searchVectors(userMessage, storeId, aiContext, 3);
      if (vectors.length > 0) {
        ragContext = "\n\nRelevant Documentation/Context:\n" + 
          vectors.map(v => `- ${v.metadata?.text || 'No text'}`).join("\n");
        console.log('[AI] RAG Context injected:', vectors.length, 'items');
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
  You have access to their REAL-TIME business data. Use it to provide intelligent insights.
  
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
  3. **Capabilities**: You can explain how to use features or answer questions about *their* store if you had access (currently answering based on general knowledge).
  4. **Strictness**: If asked to generate code or SQL, refuse politely. You are a business assistant.
  5. **Analytics Usage & UI**: 
     - You have real-time data. USE IT. 
     - IF the user asks "How is business?", "Sales update", "Any new orders?", or generally about the store's status:
       **YOU MUST RETURN A JSON OBJECT** (and nothing else) in this format:
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
  },
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<string> {
  const systemPrompt = `You are the Super Admin Assistant.
  You have high-level privileges and can discuss system-wide health, revenue, and user growth.
  
  User: ${context.userName} (Super Admin)
  
  Rules:
  1. Be professional and concise.
  2. You can discuss sensitive platform metrics.
  `;

  return callAI(apiKey, systemPrompt, userMessage, model, baseUrl);
}

/**
 * Generate vector embeddings for text using Cloudflare Workers AI
 * Free Tier: 10,000 requests/day
 */
async function generateEmbedding(text: string, context: { AI: any }): Promise<number[]> {
  if (!context?.AI) {
    console.warn('[AI] Cloudflare Workers AI binding not found. Mocking embedding.');
    // Fallback or throw based on strictness. Throwing for now to ensure config is correct.
    throw new Error('Cloudflare AI binding (env.AI) missing');
  }

  try {
    const response = await context.AI.run(EMBEDDING_MODEL, {
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
  metadata: { storeId: number | string; customId?: string; [key: string]: any }, 
  context: { AI: any; VECTORIZE: any }
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
    await context.VECTORIZE.upsert([{
      id,
      values,
      metadata: {
        ...metadata,
        storeId: String(metadata.storeId), // Ensure storeId is string
        text // Store text in metadata
      }
    }]);
    
    console.log(`[AI] Vector upserted: ${id} for Store: ${metadata.storeId}`);
  } catch (error) {
    console.error('[AI] Vector Upsert Failed:', error);
  }
}

/**
 * Delete a vector by ID
 */
async function deleteVector(
  id: string,
  context: { VECTORIZE: any }
): Promise<void> {
  if (!context?.VECTORIZE) return;
  try {
    await context.VECTORIZE.deleteByIds([id]);
    console.log(`[AI] Vector deleted: ${id}`);
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
  context: { AI: any; VECTORIZE: any },
  limit: number = 3
): Promise<Array<{ score: number; metadata: any }>> {
  if (!context?.VECTORIZE) {
    console.warn('[AI] Vectorize binding missing. Skipping vector search.');
    return [];
  }

  try {
    const vector = await generateEmbedding(query, context);
    
    // TENANT ISOLATION:
    // We STRICTLY filter by storeId to ensure one store cannot see another's data.
    const results = await context.VECTORIZE.query(vector, {
      topK: limit,
      filter: { storeId: String(storeId) }, // Only match vectors with this storeId
      returnMetadata: true
    });

    console.log(`[AI] Vector search for Store ${storeId} found ${results.matches.length} matches`);
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
 * This chatbot has complete knowledge of the Multi-Store SaaS platform and can
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

  const systemPrompt = `# Ozzyl AI - Ozzyl SaaS বিক্রয় সহায়ক

তুমি **Ozzyl AI** - বাংলাদেশের সবচেয়ে advanced e-commerce platform Ozzyl এর official AI assistant। তোমার প্রধান কাজ হলো visitors দের সব প্রশ্নের উত্তর দেওয়া এবং তাদের sign up করতে encourage করা।

---

## 🏢 কোম্পানি সম্পর্কে

**Ozzyl** হলো বাংলাদেশী মার্চেন্টদের জন্য তৈরি সম্পূর্ণ e-commerce solution। আমরা Cloudflare এর global infrastructure ব্যবহার করি যার কারণে আমাদের stores বাংলাদেশের সবচেয়ে দ্রুত।

**Tagline**: "মিনিটে অনলাইন স্টোর, লক্ষ টাকার বিজনেস"

---

## 💰 প্রাইসিং (BDT)

### Free Plan (৳০/মাস)
- ১টি প্রোডাক্ট
- ৫০ অর্ডার/মাস
- Landing Page Mode
- Cash on Delivery
- Basic Analytics
- Subdomain: yourstore.ozzyl.com

### Starter Plan (৳৫০০/মাস) ⭐ সবচেয়ে জনপ্রিয়
- ৫০টি প্রোডাক্ট
- ৫০০ অর্ডার/মাস
- Full Store Mode
- বিকাশ + নগদ + COD
- Inventory Tracking
- Email Notifications
- Order Management Dashboard

### Premium Plan (৳২,০০০/মাস)
- আনলিমিটেড প্রোডাক্ট
- আনলিমিটেড অর্ডার
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
- Cloudflare CDN - বিশ্বের ৩০০+ location থেকে serve
- বাংলাদেশের সবচেয়ে দ্রুত e-commerce platform
- 99.9% uptime guarantee

### Trust (বিশ্বাস)
- ৫০০+ সন্তুষ্ট মার্চেন্ট
- ১ লক্ষ+ অর্ডার প্রসেস
- 24/7 support

### Simplicity (সহজতা)
- ১০ মিনিটে store ready
- কোনো টেকনিক্যাল knowledge দরকার নেই
- বাংলায় সম্পূর্ণ interface

---

## 🔄 কিভাবে শুরু করবেন?

1. **Sign Up**: Email দিয়ে রেজিস্টার করুন
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
// EXPORT: AI Service Factory
// ============================================================================
export function createAIService(apiKey: string | undefined, options?: { model?: string, baseUrl?: string, context?: any }) {
  // Ensure API key is present for AI features
  // We allow undefined initialization but methods will fail if called without key, 
  // OR we enforce it here. Given the lint errors, strict enforcement or default empty string is needed.
  // The downstream functions require string.
  const validApiKey = apiKey || ''; 


  const model = options?.model || DEFAULT_MODEL;
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
  const aiContext = options?.context || {};

  return {
    generateStoreSetup: (description: string) => 
      generateStoreSetup(validApiKey, description, model, baseUrl),
    
    // New Vector Capabilities
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
    
    generateGrapesJsPage: (prompt: string) => 
      generateGrapesJsPage(validApiKey, prompt, options?.model, options?.baseUrl),
    
    designCustomSection: (prompt: string, currentHtml?: string) =>
      designCustomSection(validApiKey, prompt, currentHtml, options?.model, options?.baseUrl),

    commandGrapesJs: (prompt: string, context: any) =>
      commandGrapesJs(validApiKey, prompt, context, options?.model, options?.baseUrl),

    chatWithMerchant: (message: string, storeId: number, context: any) =>
      chatWithMerchant(validApiKey, message, storeId, context, options?.model, options?.baseUrl, aiContext),

    chatWithSuperAdmin: (message: string, context: any) =>
      chatWithSuperAdmin(validApiKey, message, context, options?.model, options?.baseUrl),

    chatWithVisitor: (message: string, context: any = {}) =>
      chatWithVisitor(validApiKey, message, context, options?.model, options?.baseUrl),
  };
}
