import { createOpenRouter } from '@openrouter/ai-sdk-provider';

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY is not set. AI features will not work.');
}

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Claude 3.5 Sonnet - excellent for code generation
export const codeModel = openrouter('anthropic/claude-3.5-sonnet');

// Alternative models (can be configured via env)
export const getModel = (modelId?: string) => {
  const id = modelId || process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet';
  return openrouter(id);
};
