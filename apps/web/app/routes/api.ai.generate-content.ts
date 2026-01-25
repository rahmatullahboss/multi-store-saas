/**
 * AI Content Generator API
 *
 * Generates content for page builder sections using OpenRouter.
 * Supports: headlines, descriptions, CTAs, FAQs, testimonials, etc.
 *
 * POST /api/ai/generate-content
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { callAIWithSystemPrompt } from '~/services/ai.server';

// Content generation types
type ContentType =
  | 'headline'
  | 'subheadline'
  | 'description'
  | 'cta'
  | 'feature'
  | 'faq'
  | 'testimonial'
  | 'benefit'
  | 'trust'
  | 'urgency';

interface GenerateContentRequest {
  type: ContentType;
  context: {
    productName?: string;
    productDescription?: string;
    productPrice?: number;
    sectionType?: string;
    currentContent?: string;
    tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
    language?: 'bn' | 'en';
  };
}

// System prompts for different content types
const SYSTEM_PROMPTS: Record<ContentType, string> = {
  headline: `You are an expert copywriter for Bangladeshi e-commerce. Generate compelling Bengali headlines that:
- Are short and punchy (5-10 words max)
- Create curiosity or urgency
- Focus on benefits, not features
- Use emotional triggers
Return ONLY the headline text, no quotes or explanation.`,

  subheadline: `You are an expert copywriter for Bangladeshi e-commerce. Generate Bengali subheadlines that:
- Support the main headline
- Add specific details or benefits
- Are 10-20 words max
- Build trust or credibility
Return ONLY the subheadline text, no quotes or explanation.`,

  description: `You are an expert copywriter for Bangladeshi e-commerce. Generate Bengali product descriptions that:
- Highlight key benefits
- Use sensory language
- Address customer pain points
- Are 2-3 sentences max
Return ONLY the description text, no quotes or explanation.`,

  cta: `You are an expert copywriter for Bangladeshi e-commerce. Generate Bengali CTA button text that:
- Creates urgency
- Uses action verbs
- Is 2-4 words max
- Motivates immediate action
Return ONLY the CTA text, no quotes or explanation.`,

  feature: `You are an expert copywriter for Bangladeshi e-commerce. Generate a Bengali feature/benefit point that:
- Starts with an emoji
- Has a short title (3-5 words)
- Has a brief description (10-15 words)
Format: emoji|title|description
Return ONLY in this format, no explanation.`,

  faq: `You are an expert copywriter for Bangladeshi e-commerce. Generate a relevant FAQ in Bengali that:
- Addresses a common customer concern
- Has a clear question
- Has a helpful answer (2-3 sentences)
Format: question|answer
Return ONLY in this format, no explanation.`,

  testimonial: `You are an expert copywriter for Bangladeshi e-commerce. Generate a realistic Bengali testimonial that:
- Sounds authentic and natural
- Mentions specific benefits experienced
- Includes a Bengali name
- Is 2-3 sentences
Format: name|testimonial
Return ONLY in this format, no explanation.`,

  benefit: `You are an expert copywriter for Bangladeshi e-commerce. Generate a Bengali benefit statement that:
- Focuses on transformation/outcome
- Uses "আপনি" (you) language
- Is emotionally compelling
- Is 1 sentence max
Return ONLY the benefit text, no quotes or explanation.`,

  trust: `You are an expert copywriter for Bangladeshi e-commerce. Generate a Bengali trust/guarantee statement that:
- Builds confidence
- Removes risk perception
- Mentions guarantee or support
- Is 1 sentence max
Return ONLY the trust statement, no quotes or explanation.`,

  urgency: `You are an expert copywriter for Bangladeshi e-commerce. Generate a Bengali urgency message that:
- Creates FOMO (fear of missing out)
- Mentions limited time/stock
- Motivates immediate action
- Is 1 sentence max
Return ONLY the urgency text, no quotes or explanation.`,
};

// Build user message based on context
function buildUserMessage(type: ContentType, context: GenerateContentRequest['context']): string {
  const parts: string[] = [];

  if (context.productName) {
    parts.push(`Product: ${context.productName}`);
  }
  if (context.productDescription) {
    parts.push(`Description: ${context.productDescription}`);
  }
  if (context.productPrice) {
    parts.push(`Price: ৳${context.productPrice}`);
  }
  if (context.sectionType) {
    parts.push(`Section: ${context.sectionType}`);
  }
  if (context.currentContent) {
    parts.push(`Current content (improve this): ${context.currentContent}`);
  }
  if (context.tone) {
    parts.push(`Tone: ${context.tone}`);
  }

  const language = context.language || 'bn';
  parts.push(`Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}`);

  if (parts.length === 0) {
    parts.push('Generate generic e-commerce content');
  }

  return parts.join('\n');
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = (await request.json()) as GenerateContentRequest;
    const { type, context: contentContext } = body;

    if (!type || !SYSTEM_PROMPTS[type]) {
      return json({ error: 'Invalid content type' }, { status: 400 });
    }

    const env = context.cloudflare.env as {
      OPENROUTER_API_KEY?: string;
      AI_MODEL?: string;
      AI_BASE_URL?: string;
    };

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return json({ error: 'AI service not configured' }, { status: 500 });
    }

    const systemPrompt = SYSTEM_PROMPTS[type];
    const userMessage = buildUserMessage(type, contentContext || {});

    console.log(`[AI Generate] Type: ${type}, Context:`, contentContext);

    const result = await callAIWithSystemPrompt(apiKey, systemPrompt, userMessage, {
      model: env.AI_MODEL,
      baseUrl: env.AI_BASE_URL,
    });

    // Parse structured responses
    let parsed: Record<string, string> = { content: result.trim() };

    if (type === 'feature' && result.includes('|')) {
      const [emoji, title, description] = result.split('|').map((s) => s.trim());
      parsed = { emoji, title, description };
    } else if (type === 'faq' && result.includes('|')) {
      const [question, answer] = result.split('|').map((s) => s.trim());
      parsed = { question, answer };
    } else if (type === 'testimonial' && result.includes('|')) {
      const [name, testimonial] = result.split('|').map((s) => s.trim());
      parsed = { name, testimonial };
    }

    return json({ success: true, type, result: parsed });
  } catch (error) {
    console.error('[AI Generate] Error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'AI generation failed' },
      { status: 500 }
    );
  }
}
