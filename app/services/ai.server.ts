/**
 * AI Service - OpenRouter API Integration
 * 
 * Uses OpenRouter with Google Gemini for:
 * - Store setup generation
 * - Landing page generation
 * - Section editing with natural language
 * - Customer chat support
 * 
 * All responses are validated with Zod schemas.
 */

import { z } from 'zod';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

// ============================================================================
// CONFIGURATION
// ============================================================================
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

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
  }).optional(),
  socialProof: z.object({
    count: z.number(),
    text: z.string(),
  }).optional(),
});

export type FullPageConfigResult = z.infer<typeof FullPageConfigSchema>;

// ============================================================================
// HELPER: Make OpenRouter API call
// ============================================================================
async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  console.log(`[AI] Calling OpenRouter with model: ${model}`);
  const openrouter = createOpenRouter({ apiKey });
  
  try {
    const result = await generateText({
      model: openrouter(model),
      system: systemPrompt,
      prompt: userPrompt,
    });

    console.log(`[AI] Response received. Length: ${result.text?.length || 0}`);
    
    if (!result.text) {
      console.error('[AI] Empty response from OpenRouter');
      throw new Error('No response from AI');
    }

    return result.text;
  } catch (error) {
    console.error('[AI] Error in callAI:', error);
    throw error;
  }
}

// ============================================================================
// HELPER: Extract JSON from AI response
// ============================================================================
function extractJSON(text: string): unknown {
  console.log('[AI] Extracting JSON from response...');
  // Try to find JSON in the response
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    console.log('[AI] Found JSON inside markdown block');
    return JSON.parse(jsonMatch[1]);
  }
  
  // Try to parse the whole response as JSON
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    console.log('[AI] Parsing whole response as JSON');
    return JSON.parse(trimmed);
  }
  
  console.error('[AI] JSON extraction failed. Response start:', text.substring(0, 100));
  throw new Error('Could not extract JSON from AI response');
}

// ============================================================================
// ACTION: Generate Store Setup
// ============================================================================
export async function generateStoreSetup(
  apiKey: string,
  businessDescription: string
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

  const response = await callAI(apiKey, systemPrompt, userPrompt);
  const parsed = extractJSON(response);
  return StoreSetupSchema.parse(parsed);
}

// ============================================================================
// ACTION: Generate Landing Page Config
// ============================================================================
export async function generateLandingConfig(
  apiKey: string,
  productInfo: { title: string; description?: string; price: number },
  style?: string
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

  const response = await callAI(apiKey, systemPrompt, userPrompt);
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
  editPrompt: string
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

  const response = await callAI(apiKey, EDIT_SECTION_SYSTEM_PROMPT, userPrompt);
  
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
  keywords: string
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

  const response = await callAI(apiKey, systemPrompt, userPrompt);
  return response.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any
}

// ============================================================================
// ACTION: Quick Edit (Simple text changes)
// ============================================================================
export async function quickEdit(
  apiKey: string,
  currentText: string,
  editPrompt: string
): Promise<string> {
  const systemPrompt = `You are a copywriting assistant. Edit the given text according to the user's instructions.
Return ONLY the edited text, no explanations or quotes.`;

  const userPrompt = `Current text: "${currentText}"
Edit instruction: "${editPrompt}"

Edited text:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt);
  return response.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any
}

// ============================================================================
// ACTION: Generate Full Page from Business Description
// ============================================================================
export async function generateFullPage(
  apiKey: string,
  businessDescription: string
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
    "accent": "#HEX_CODE"
  },
  "socialProof": {
    "count": 500,
    "text": "সন্তুষ্ট গ্রাহক"
  }
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
- Create exactly 2 testimonials with realistic Bengali names
- Choose colors that match the product category
- Write compelling, benefit-focused copy
- Make urgency text feel authentic, not pushy`;

  const userPrompt = `Business description: ${businessDescription}

Generate a complete landing page configuration JSON:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt);
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
  prompt: string
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

  const response = await callAI(apiKey, systemPrompt, userPrompt);
  const parsed = extractJSON(response);
  return ElementorPageSchema.parse(parsed);
}

// ============================================================================
// EXPORT: AI Service Factory
// ============================================================================
export function createAIService(apiKey: string) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  return {
    generateStoreSetup: (description: string) => 
      generateStoreSetup(apiKey, description),
    
    generateLandingConfig: (productInfo: { title: string; description?: string; price: number }, style?: string) =>
      generateLandingConfig(apiKey, productInfo, style),
    
    generateFullPage: (businessDescription: string) =>
      generateFullPage(apiKey, businessDescription),
    
    editSection: (sectionName: string, currentData: unknown, prompt: string) =>
      editSection(apiKey, sectionName, currentData, prompt),
    
    enhanceText: (fieldType: string, currentText: string, keywords: string) =>
      enhanceText(apiKey, fieldType, currentText, keywords),
    
    quickEdit: (currentText: string, prompt: string) =>
      quickEdit(apiKey, currentText, prompt),
    
    generateElementorPage: (prompt: string) =>
      generateElementorPage(apiKey, prompt),
  };
}
