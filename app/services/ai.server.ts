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
// HELPER: Make OpenRouter API call
// ============================================================================
async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const openrouter = createOpenRouter({ apiKey });
  
  const result = await generateText({
    model: openrouter(model),
    system: systemPrompt,
    prompt: userPrompt,
  });

  if (!result.text) {
    throw new Error('No response from AI');
  }

  return result.text;
}

// ============================================================================
// HELPER: Extract JSON from AI response
// ============================================================================
function extractJSON(text: string): unknown {
  // Try to find JSON in the response
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  
  // Try to parse the whole response as JSON
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  
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
// ACTION: Edit Section
// ============================================================================
export async function editSection(
  apiKey: string,
  sectionName: string,
  currentData: unknown,
  editPrompt: string
): Promise<unknown> {
  const systemPrompt = `You are an expert copywriter editing a landing page section.

The user wants to modify the "${sectionName}" section. Apply their requested changes while:
- Keeping the same JSON structure
- Improving the copy if possible
- Following their specific instructions

Return ONLY the updated JSON for this section, no explanations.`;

  const userPrompt = `Current ${sectionName} section:
${JSON.stringify(currentData, null, 2)}

User's request: "${editPrompt}"

Return the updated JSON for this section only:`;

  const response = await callAI(apiKey, systemPrompt, userPrompt);
  const parsed = extractJSON(response);
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
    
    editSection: (sectionName: string, currentData: unknown, prompt: string) =>
      editSection(apiKey, sectionName, currentData, prompt),
    
    enhanceText: (fieldType: string, currentText: string, keywords: string) =>
      enhanceText(apiKey, fieldType, currentText, keywords),
    
    quickEdit: (currentText: string, prompt: string) =>
      quickEdit(apiKey, currentText, prompt),
  };
}
