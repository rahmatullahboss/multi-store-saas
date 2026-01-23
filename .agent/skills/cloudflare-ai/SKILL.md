---
name: Cloudflare Workers AI
description: Expert skill for Cloudflare Workers AI - LLM inference, embeddings, AI Gateway, streaming responses, and prompt engineering best practices.
---

# Cloudflare Workers AI Skill

This skill covers all aspects of building AI-powered features using Cloudflare Workers AI, including LLM inference, embedding generation, AI Gateway for observability, and streaming responses.

## 1) Core Concepts

### Workers AI Binding

Workers AI is accessed via the `AI` binding in your Worker/Pages function:

```typescript
// wrangler.toml
[ai];
binding = 'AI';

// TypeScript usage
interface Env {
  AI: Ai;
}
```

### Available Model Categories (Updated 2025)

| Category             | Models                                                                                 | Use Case                 |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| **Text Generation**  | `@cf/meta/llama-3.1-8b-instruct`, `@cf/mistral/mistral-7b-instruct-v0.2`               | Chat, content generation |
| **Text Embeddings**  | `@cf/baai/bge-base-en-v1.5`, `@cf/baai/bge-large-en-v1.5`, `@cf/baai/bge-m3`           | Semantic search, RAG     |
| **Reranking**        | `@cf/baai/bge-reranker-base`                                                           | Improve RAG relevance    |
| **Image Generation** | `@cf/black-forest-labs/flux-1-schnell`, `@cf/stabilityai/stable-diffusion-xl-base-1.0` | Image creation           |
| **Speech-to-Text**   | `@cf/openai/whisper-large-v3-turbo`, `@cf/openai/whisper`                              | Audio transcription      |
| **Text-to-Speech**   | `@cf/myshell-ai/melotts`                                                               | Voice audio generation   |
| **Translation**      | `@cf/meta/m2m100-1.2b`                                                                 | Language translation     |
| **Vision**           | `@cf/uform/uform-gen`                                                                  | Image captioning, VQA    |

> **New in 2025**: Multi-lingual embeddings (`bge-m3` - 100+ languages), reranking for RAG, TTS, and Flux image models.

---

## 2) Text Generation (LLM)

### Basic Text Generation

```typescript
export async function generateText(env: Env, prompt: string): Promise<string> {
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return response.response;
}
```

### Chat with Messages Array

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(env: Env, messages: Message[]): Promise<string> {
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages,
    max_tokens: 2048,
  });

  return response.response;
}

// Usage
const messages: Message[] = [
  { role: 'system', content: 'You are a helpful e-commerce assistant.' },
  { role: 'user', content: 'Suggest a product description for a red dress.' },
];
```

### Streaming Responses

```typescript
export async function streamResponse(env: Env, prompt: string): Promise<ReadableStream> {
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt,
    stream: true,
  });

  return response; // Returns ReadableStream
}

// In your route handler (Hono)
app.get('/api/ai/stream', async (c) => {
  const stream = await streamResponse(c.env, 'Tell me a story');

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});
```

---

## 3) Text Embeddings

### Generate Embeddings

```typescript
export async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text,
  });

  return response.data[0]; // 768-dimensional vector
}

// Batch embeddings
export async function generateEmbeddings(env: Env, texts: string[]): Promise<number[][]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: texts,
  });

  return response.data;
}
```

### Embedding Model Comparison

| Model               | Dimensions | Speed   | Quality   | Use Case                           |
| ------------------- | ---------- | ------- | --------- | ---------------------------------- |
| `bge-base-en-v1.5`  | 768        | Fast    | Good      | General semantic search            |
| `bge-large-en-v1.5` | 1024       | Slower  | Better    | High-quality RAG                   |
| `bge-small-en-v1.5` | 384        | Fastest | Basic     | Resource-constrained               |
| `bge-m3`            | 1024       | Medium  | Excellent | **Multi-lingual (100+ languages)** |

### Reranking for Better RAG Results

```typescript
// Use reranker to improve search result relevance
export async function rerankResults(
  env: Env,
  query: string,
  documents: string[]
): Promise<Array<{ index: number; score: number }>> {
  const response = await env.AI.run('@cf/baai/bge-reranker-base', {
    query,
    documents,
  });

  // Returns scores for each document
  return response.data
    .map((score: number, index: number) => ({ index, score }))
    .sort((a, b) => b.score - a.score);
}
```

---

## 4) AI Gateway (Observability & Rate Limiting)

### Configuration

```typescript
// wrangler.toml
[[ai.gateway]];
id = 'my-store-gateway';
```

### Using AI Gateway

```typescript
export async function generateWithGateway(env: Env, prompt: string) {
  // AI Gateway provides:
  // - Rate limiting
  // - Request/response logging
  // - Analytics
  // - Caching

  const response = await env.AI.run(
    '@cf/meta/llama-3.1-8b-instruct',
    { prompt },
    { gateway: { id: 'my-store-gateway' } }
  );

  return response;
}
```

### Rate Limiting with KV

```typescript
const RATE_LIMIT = 20; // requests per 15 minutes
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

export async function checkRateLimit(
  kv: KVNamespace,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${userId}`;
  const current = (await kv.get(key, 'json')) as { count: number; reset: number } | null;

  const now = Date.now();

  if (!current || now > current.reset) {
    await kv.put(key, JSON.stringify({ count: 1, reset: now + RATE_WINDOW }), {
      expirationTtl: Math.ceil(RATE_WINDOW / 1000),
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (current.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(key, JSON.stringify({ count: current.count + 1, reset: current.reset }));
  return { allowed: true, remaining: RATE_LIMIT - current.count - 1 };
}
```

---

## 5) Prompt Engineering Best Practices

### Structured Prompts

```typescript
interface ProductContext {
  name: string;
  category: string;
  features: string[];
  targetAudience: string;
}

export function buildProductPrompt(context: ProductContext): string {
  return `You are an expert e-commerce copywriter.

Product: ${context.name}
Category: ${context.category}
Key Features: ${context.features.join(', ')}
Target Audience: ${context.targetAudience}

Write a compelling product description that:
1. Highlights the key benefits
2. Uses persuasive language
3. Is optimized for SEO
4. Is under 200 words

Product Description:`;
}
```

### JSON Output Enforcement

```typescript
export async function generateStructuredOutput(env: Env, prompt: string) {
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that ONLY outputs valid JSON. 
                  Never include explanations or markdown. Only JSON.`,
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1024,
  });

  try {
    return JSON.parse(response.response);
  } catch {
    throw new Error('AI returned invalid JSON');
  }
}
```

---

## 6) Error Handling

### Robust AI Calls

```typescript
import { HTTPException } from 'hono/http-exception';

export async function safeAICall<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on rate limit
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new HTTPException(429, { message: 'AI rate limit exceeded' });
      }

      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 100));
    }
  }

  throw new HTTPException(500, { message: `AI call failed: ${lastError?.message}` });
}
```

---

## 7) Cost Optimization

### Best Practices

| Strategy                 | Implementation                          |
| ------------------------ | --------------------------------------- |
| **Cache responses**      | Use KV to cache identical prompts       |
| **Batch requests**       | Combine multiple embeddings in one call |
| **Choose right model**   | Use smaller models for simple tasks     |
| **Limit max_tokens**     | Set appropriate limits per use case     |
| **Stream when possible** | Reduces perceived latency               |

### Response Caching

```typescript
export async function cachedGenerate(env: Env, prompt: string, ttl = 3600): Promise<string> {
  const cacheKey = `ai:${hashString(prompt)}`;

  // Check cache
  const cached = await env.KV.get(cacheKey);
  if (cached) return cached;

  // Generate
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { prompt });

  // Cache result
  await env.KV.put(cacheKey, response.response, { expirationTtl: ttl });

  return response.response;
}
```

---

## 8) Integration with Store AI

### Store Context for AI

```typescript
interface StoreAIContext {
  storeName: string;
  storeType: 'fashion' | 'electronics' | 'food' | 'beauty';
  targetMarket: string;
  brandVoice: 'professional' | 'casual' | 'luxury';
}

export function buildStoreSystemPrompt(context: StoreAIContext): string {
  return `You are an AI assistant for "${context.storeName}", a ${context.storeType} store.
Target Market: ${context.targetMarket}
Brand Voice: ${context.brandVoice}

Guidelines:
- Always maintain the brand voice
- Be helpful and accurate
- Never make up product information
- Suggest alternatives when items are unavailable`;
}
```

---

## Quick Reference

| Task               | Model                   | Code                                                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| Generate text      | `llama-3.1-8b-instruct` | `env.AI.run('@cf/meta/llama-3.1-8b-instruct', { prompt })`               |
| Generate embedding | `bge-base-en-v1.5`      | `env.AI.run('@cf/baai/bge-base-en-v1.5', { text })`                      |
| Stream response    | Any text model          | `env.AI.run(model, { prompt, stream: true })`                            |
| Translate          | `m2m100-1.2b`           | `env.AI.run('@cf/meta/m2m100-1.2b', { text, source_lang, target_lang })` |
