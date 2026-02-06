import { LANDING_PAGE_SYSTEM_PROMPT, IMAGE_ANALYSIS_PROMPT } from '@/lib/prompts';

export const runtime = 'edge';
export const maxDuration = 60;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet';

export async function POST(req: Request) {
  try {
    const { prompt, images, storeId, productId } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return Response.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    // Build user message content
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    // Add image analysis instruction if images provided
    if (images && images.length > 0) {
      userContent.push({
        type: 'text',
        text: IMAGE_ANALYSIS_PROMPT,
      });

      // Add images (up to 2) in OpenAI vision format
      for (const imageData of images.slice(0, 2)) {
        userContent.push({
          type: 'image_url',
          image_url: { url: imageData },
        });
      }
    }

    // Add the main prompt with store/product context
    const contextualPrompt = `
Create a landing page for the following requirement:

${prompt}

${storeId ? `Store ID: ${storeId}` : ''}
${productId ? `Product ID: ${productId}` : ''}

Remember to include the {ORDER_FORM} placeholder where the order form should appear.
`;

    userContent.push({
      type: 'text',
      text: contextualPrompt,
    });

    // Call OpenRouter API directly with streaming
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.get('origin') || 'https://ai-builder.vercel.app',
        'X-Title': 'AI Landing Builder',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: LANDING_PAGE_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return Response.json({ error: 'AI generation failed' }, { status: 500 });
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate code' },
      { status: 500 }
    );
  }
}
