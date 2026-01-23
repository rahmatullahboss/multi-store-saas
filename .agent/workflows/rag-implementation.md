---
description: Implement RAG (Retrieval Augmented Generation) with Vectorize and Workers AI
---

# RAG Implementation Workflow

This workflow guides you through implementing a complete RAG (Retrieval Augmented Generation) system using Cloudflare Vectorize for semantic search and Workers AI for response generation.

## Prerequisites

- Read `.agent/skills/cloudflare-vectorize/SKILL.md`
- Read `.agent/skills/cloudflare-ai/SKILL.md`
- Vectorize index created with correct dimensions (768 for bge-base)

---

## Step 1: Plan the RAG System

### 1.1 Define Data Sources

What data will be indexed for retrieval?

- [ ] Products (name, description, category)
- [ ] Pages (content, sections)
- [ ] FAQs (questions, answers)
- [ ] Documentation (markdown content)

### 1.2 Define Use Cases

- [ ] Product search ("find red dresses under $50")
- [ ] Customer support ("what's your return policy?")
- [ ] Content discovery ("show me blog posts about summer fashion")

### 1.3 Choose Embedding Model

| Model               | Dimensions | Best For                  |
| ------------------- | ---------- | ------------------------- |
| `bge-base-en-v1.5`  | 768        | General use, good balance |
| `bge-large-en-v1.5` | 1024       | Higher quality, slower    |
| `bge-small-en-v1.5` | 384        | Fast, resource-limited    |

---

## Step 2: Create Vectorize Index

### 2.1 Create Index (if not exists)

```bash
npx wrangler vectorize create product-embeddings \
  --dimensions=768 \
  --metric=cosine
```

### 2.2 Add Binding to wrangler.toml

```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "product-embeddings"
```

---

## Step 3: Implement Document Chunking

For long documents, split into chunks:

```typescript
// app/services/rag/chunker.ts

interface Chunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export function chunkDocument(
  docId: string,
  content: string,
  metadata: Record<string, unknown>,
  maxChunkSize = 500,
  overlap = 50
): Chunk[] {
  const chunks: Chunk[] = [];
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim());

  let currentChunk = '';
  let chunkIndex = 0;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
      chunks.push({
        id: `${docId}-chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: { ...metadata, chunkIndex, docId },
      });

      // Keep last part for overlap
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-Math.floor(overlap / 5)).join(' ') + ' ';
      chunkIndex++;
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `${docId}-chunk-${chunkIndex}`,
      content: currentChunk.trim(),
      metadata: { ...metadata, chunkIndex, docId },
    });
  }

  return chunks;
}
```

---

## Step 4: Implement Embedding Generation

```typescript
// app/services/rag/embeddings.ts

export async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text,
  });
  return response.data[0];
}

export async function generateEmbeddings(env: Env, texts: string[]): Promise<number[][]> {
  // Batch in groups of 100
  const results: number[][] = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: batch,
    });
    results.push(...response.data);
  }

  return results;
}
```

---

## Step 5: Implement Indexing Pipeline

```typescript
// app/services/rag/indexer.ts

interface IndexableDocument {
  id: string;
  content: string;
  metadata: {
    storeId: string;
    type: 'product' | 'page' | 'faq';
    title: string;
    [key: string]: unknown;
  };
}

export async function indexDocument(env: Env, doc: IndexableDocument): Promise<void> {
  // 1. Chunk the document
  const chunks = chunkDocument(doc.id, doc.content, doc.metadata);

  // 2. Generate embeddings for all chunks
  const embeddings = await generateEmbeddings(
    env,
    chunks.map((c) => c.content)
  );

  // 3. Prepare vectors
  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: chunk.metadata,
  }));

  // 4. Upsert to Vectorize
  await env.VECTORIZE.upsert(vectors);
}

export async function indexProducts(
  env: Env,
  storeId: string
): Promise<{ indexed: number; errors: number }> {
  // Fetch products from D1
  const { results: products } = await env.DB.prepare(
    `
    SELECT id, name, description, category, price 
    FROM products 
    WHERE store_id = ? AND status = 'active'
  `
  )
    .bind(storeId)
    .all();

  let indexed = 0;
  let errors = 0;

  for (const product of products) {
    try {
      await indexDocument(env, {
        id: `product-${product.id}`,
        content: `${product.name}. ${product.description}. Category: ${product.category}`,
        metadata: {
          storeId,
          type: 'product',
          title: product.name as string,
          productId: product.id as string,
          category: product.category as string,
          price: product.price as number,
        },
      });
      indexed++;
    } catch (error) {
      console.error(`Failed to index product ${product.id}:`, error);
      errors++;
    }
  }

  return { indexed, errors };
}
```

---

## Step 6: Implement Retrieval

```typescript
// app/services/rag/retriever.ts

interface RetrievalResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export async function retrieve(
  env: Env,
  query: string,
  storeId: string,
  options: {
    topK?: number;
    type?: 'product' | 'page' | 'faq';
    minScore?: number;
  } = {}
): Promise<RetrievalResult[]> {
  const { topK = 5, type, minScore = 0.7 } = options;

  // Generate query embedding
  const queryVector = await generateEmbedding(env, query);

  // Build filter
  const filter: Record<string, unknown> = {
    storeId: { $eq: storeId },
  };

  if (type) {
    filter.type = { $eq: type };
  }

  // Query Vectorize
  const results = await env.VECTORIZE.query(queryVector, {
    topK,
    filter,
    returnMetadata: 'all',
  });

  // Filter by minimum score and format
  return results.matches
    .filter((m) => m.score >= minScore)
    .map((m) => ({
      id: m.id,
      content: (m.metadata as { content?: string }).content ?? '',
      score: m.score,
      metadata: m.metadata as Record<string, unknown>,
    }));
}
```

---

## Step 7: Implement Generation (LLM)

```typescript
// app/services/rag/generator.ts

interface GenerationContext {
  query: string;
  retrievedDocs: RetrievalResult[];
  storeContext: {
    name: string;
    type: string;
  };
}

export async function generateResponse(env: Env, context: GenerationContext): Promise<string> {
  // Build context from retrieved documents
  const docsContext = context.retrievedDocs
    .map((doc, i) => `[${i + 1}] ${doc.metadata.title}: ${doc.content}`)
    .join('\n\n');

  const systemPrompt = `You are a helpful assistant for "${context.storeContext.name}", a ${context.storeContext.type} store.

Answer the user's question based ONLY on the following information:

${docsContext}

Guidelines:
- Be helpful and accurate
- If the answer is not in the provided information, say "I don't have that information"
- Reference specific products/pages when relevant
- Keep responses concise but complete`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context.query },
    ],
    max_tokens: 512,
    temperature: 0.7,
  });

  return response.response;
}
```

---

## Step 8: Implement Complete RAG Pipeline

```typescript
// app/services/rag/pipeline.ts

interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    score: number;
  }>;
  processingTime: number;
}

export async function ragQuery(env: Env, query: string, storeId: string): Promise<RAGResponse> {
  const startTime = Date.now();

  // 1. Retrieve relevant documents
  const retrieved = await retrieve(env, query, storeId, {
    topK: 5,
    minScore: 0.6,
  });

  if (retrieved.length === 0) {
    return {
      answer: "I couldn't find any relevant information for your question.",
      sources: [],
      processingTime: Date.now() - startTime,
    };
  }

  // 2. Get store context
  const store = await env.DB.prepare('SELECT name, type FROM stores WHERE id = ?')
    .bind(storeId)
    .first();

  // 3. Generate response
  const answer = await generateResponse(env, {
    query,
    retrievedDocs: retrieved,
    storeContext: {
      name: (store?.name as string) ?? 'Store',
      type: (store?.type as string) ?? 'e-commerce',
    },
  });

  return {
    answer,
    sources: retrieved.map((doc) => ({
      id: doc.id,
      title: doc.metadata.title as string,
      score: doc.score,
    })),
    processingTime: Date.now() - startTime,
  };
}
```

---

## Step 9: Create API Routes

```typescript
// app/routes/api.ai.query.ts

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const { query, storeId } = await request.json();

  if (!query || !storeId) {
    return json({ error: 'Missing query or storeId' }, { status: 400 });
  }

  const result = await ragQuery(env, query, storeId);

  return json(result);
}
```

---

## Step 10: Test the RAG System

### 10.1 Index Test Data

```typescript
// Test script
await indexProducts(env, 'test-store-id');
```

### 10.2 Test Queries

```bash
curl -X POST http://localhost:8787/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "show me red dresses", "storeId": "test-store-id"}'
```

### 10.3 Verify Results

- Relevant documents retrieved
- Score > 0.6 for good matches
- LLM response uses retrieved context
- Sources properly attributed

---

## Step 11: Commit Changes

// turbo

```bash
git add -A && git commit -m "feat(rag): implement RAG pipeline with Vectorize"
```

---

## RAG Checklist

### Setup

- [ ] Vectorize index created
- [ ] Binding configured
- [ ] Embedding model chosen

### Implementation

- [ ] Document chunking
- [ ] Embedding generation
- [ ] Indexing pipeline
- [ ] Retrieval function
- [ ] LLM generation
- [ ] Complete RAG pipeline

### Testing

- [ ] Test data indexed
- [ ] Queries return relevant results
- [ ] LLM uses context correctly
- [ ] Edge cases handled

### Deployment

- [ ] Index production data
- [ ] API routes deployed
- [ ] Monitoring in place

---

## Performance Tuning

| Aspect             | Optimization                       |
| ------------------ | ---------------------------------- |
| **Chunk size**     | 300-500 chars optimal              |
| **Overlap**        | 50-100 chars prevents context loss |
| **topK**           | 3-5 for most queries               |
| **minScore**       | 0.6-0.7 filters noise              |
| **Batch indexing** | Process 100 at a time              |

---

## Common Issues

| Issue           | Solution                                  |
| --------------- | ----------------------------------------- |
| Low relevance   | Improve chunking, check embedding quality |
| Hallucination   | Strengthen system prompt, verify context  |
| Slow response   | Reduce topK, cache embeddings             |
| Missing results | Lower minScore, check indexing            |
