---
description: Implement AI-powered features using Workers AI, Vectorize, and RAG patterns
---

# AI Feature Implementation Workflow

This workflow guides you through implementing AI-powered features in the Multi Store SaaS platform using Cloudflare Workers AI, Vectorize, and RAG (Retrieval Augmented Generation) patterns.

## Prerequisites

1. Ensure bindings are configured in `wrangler.toml`:
   - `AI` binding for Workers AI
   - `VECTORIZE` binding for vector database
   - `AI_RATE_LIMIT` KV for rate limiting

2. Read the relevant skills:
   - `.agent/skills/wrangler/SKILL.md`
   - `.agent/skills/systematic-debugging/SKILL.md`

---

## Step 1: Define the AI Feature Requirements

Before coding, clarify:

1. **What is the user's goal?** (e.g., semantic search, product recommendations, content generation)
2. **What data is needed?** (product catalog, user history, store context)
3. **What is the expected output?** (text, JSON, streaming response)
4. **What are the rate limits?** (free tier: 20/15min, pro: 100/15min)

---

## Step 2: Create Zod Schema for AI Input/Output

Create validation schemas in `app/schemas/ai/`:

```typescript
// app/schemas/ai/search.ts
import { z } from 'zod';

export const semanticSearchSchema = z.object({
  query: z.string().min(1).max(500),
  storeId: z.string().uuid(),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const aiResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      score: z.number(),
    })
  ),
  confidence: z.number().min(0).max(1),
});
```

---

## Step 3: Implement Embedding Generation

If the feature requires semantic search or RAG:

```typescript
// app/services/ai/embeddings.ts
export async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text,
  });
  return response.data[0];
}

export async function generateEmbeddings(env: Env, texts: string[]): Promise<number[][]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: texts,
  });
  return response.data;
}
```

---

## Step 4: Store/Query Vectors in Vectorize

```typescript
// app/services/ai/vectorSearch.ts
export async function searchProducts(env: Env, query: string, storeId: string, topK = 10) {
  // Generate query embedding
  const queryVector = await generateEmbedding(env, query);

  // Search in Vectorize
  const results = await env.VECTORIZE.query(queryVector, {
    topK,
    filter: { storeId: { $eq: storeId } },
    returnMetadata: 'all',
  });

  return results.matches;
}
```

---

## Step 5: Implement RAG (if needed)

For features that need LLM with context:

```typescript
// app/services/ai/rag.ts
export async function ragQuery(
  env: Env,
  question: string,
  storeId: string
): Promise<{ answer: string; sources: any[] }> {
  // 1. Get relevant context from Vectorize
  const context = await searchProducts(env, question, storeId, 5);

  // 2. Build prompt with context
  const contextText = context
    .map((m) => `- ${m.metadata.name}: ${m.metadata.description}`)
    .join('\n');

  const systemPrompt = `You are a helpful shopping assistant.
Answer based ONLY on these products:
${contextText}

If you can't answer from the products, say "I don't have that information."`;

  // 3. Generate response
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    max_tokens: 512,
  });

  return {
    answer: response.response,
    sources: context.map((m) => ({
      id: m.id,
      name: m.metadata.name,
      score: m.score,
    })),
  };
}
```

---

## Step 6: Add Rate Limiting

```typescript
// app/services/ai/rateLimit.ts
export async function checkAIRateLimit(
  kv: KVNamespace,
  userId: string,
  tier: 'free' | 'pro'
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = { free: 20, pro: 100 };
  const limit = limits[tier];
  const key = `ai:${userId}`;

  const current = (await kv.get(key, 'json')) as { count: number } | null;
  const count = (current?.count ?? 0) + 1;

  if (count > limit) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(key, JSON.stringify({ count }), {
    expirationTtl: 15 * 60, // 15 minutes
  });

  return { allowed: true, remaining: limit - count };
}
```

---

## Step 7: Create API Route

```typescript
// app/routes/api.ai.search.ts (Remix) or server/routes/ai.ts (Hono)
import { json } from '@remix-run/cloudflare';
import { semanticSearchSchema } from '~/schemas/ai/search';
import { searchProducts } from '~/services/ai/vectorSearch';
import { checkAIRateLimit } from '~/services/ai/rateLimit';

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const userId = context.session.userId;

  // Rate limit check
  const { allowed, remaining } = await checkAIRateLimit(
    env.AI_RATE_LIMIT,
    userId,
    context.session.tier
  );

  if (!allowed) {
    return json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Validate input
  const body = await request.json();
  const parsed = semanticSearchSchema.safeParse(body);

  if (!parsed.success) {
    return json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Execute search
  const results = await searchProducts(
    env,
    parsed.data.query,
    parsed.data.storeId,
    parsed.data.limit
  );

  return json({
    success: true,
    data: results,
    meta: { remaining },
  });
}
```

---

## Step 8: Add Streaming (Optional)

For better UX with long responses:

```typescript
export async function streamAIResponse(env: Env, prompt: string): Promise<ReadableStream> {
  return await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt,
    stream: true,
  });
}

// Route handler
export async function action({ request, context }: ActionFunctionArgs) {
  const stream = await streamAIResponse(context.cloudflare.env, prompt);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

---

## Step 9: Test the Feature

// turbo

```bash
npm run test -- --grep "ai"
```

---

## Step 10: Verify in Browser

1. Open the feature in browser
2. Test with various queries
3. Verify rate limiting works
4. Check response quality

---

## Step 11: Commit Changes

// turbo

```bash
git add -A && git commit -m "feat(ai): implement AI feature with RAG"
```

---

## Checklist

- [ ] Zod schemas defined
- [ ] Embedding generation implemented
- [ ] Vector search working
- [ ] RAG query implemented (if needed)
- [ ] Rate limiting added
- [ ] API route created
- [ ] Streaming implemented (if needed)
- [ ] Tests passing
- [ ] Committed to git
