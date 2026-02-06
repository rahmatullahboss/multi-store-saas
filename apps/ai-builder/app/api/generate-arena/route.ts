import { LANDING_PAGE_SYSTEM_PROMPT } from '@/lib/prompts';

export const maxDuration = 120; // Arena takes longer

const ARENA_API_URL = process.env.ARENA_API_URL || 'http://localhost:5000';
const DEFAULT_MODEL = process.env.ARENA_MODEL || 'claude-opus-4.5';

export async function POST(req: Request) {
  try {
    const { prompt, images, storeId, productId, model } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build full prompt with context
    const fullPrompt = `
${LANDING_PAGE_SYSTEM_PROMPT}

User Request: ${prompt}

${storeId ? `Store ID: ${storeId}` : ''}
${productId ? `Product ID: ${productId}` : ''}

IMPORTANT: Include the placeholder {ORDER_FORM} where the order form should appear.
`;

    // Prepare request body for arena automation
    const requestBody: {
      prompt: string;
      model: string;
      image?: string;
    } = {
      prompt: fullPrompt,
      model: model || DEFAULT_MODEL,
    };

    // Add first image if provided (arena supports one image)
    if (images && images.length > 0) {
      requestBody.image = images[0];
    }

    // Call arena automation backend
    const response = await fetch(`${ARENA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Arena API error:', errorData);
      return Response.json(
        { error: errorData.error || 'Arena generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success) {
      return Response.json(
        { error: data.error || 'Generation failed' },
        { status: 500 }
      );
    }

    // Return generated code
    return Response.json({
      code: data.code,
      model: data.model,
    });
  } catch (error) {
    console.error('Arena generation error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate' },
      { status: 500 }
    );
  }
}
