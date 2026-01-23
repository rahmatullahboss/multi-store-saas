---
name: Cloudflare Vectorize
description: Expert skill for Cloudflare Vectorize - vector database, semantic search, RAG implementation, and embedding workflows.
---

# Cloudflare Vectorize Skill

This skill covers Cloudflare Vectorize for building semantic search, RAG (Retrieval Augmented Generation), and AI-powered recommendation systems.

## 1) Core Concepts

### Vectorize Binding

```typescript
// wrangler.toml
[[vectorize]];
binding = 'VECTORIZE';
index_name = 'product-embeddings';

// TypeScript
interface Env {
  VECTORIZE: VectorizeIndex;
}
```

### Index Configuration

| Parameter       | Recommended | Notes                        |
| --------------- | ----------- | ---------------------------- |
| **Dimensions**  | 768 or 1024 | Match your embedding model   |
| **Metric**      | `cosine`    | Best for semantic similarity |
| **Max vectors** | 5M          | Per index limit              |

---

## 2) Index Management

### Create Index (CLI)

```bash
# Create index with cosine similarity
npx wrangler vectorize create product-embeddings \
  --dimensions=768 \
  --metric=cosine

# List indexes
npx wrangler vectorize list

# Delete index
npx wrangler vectorize delete product-embeddings
```

### Index Info (Runtime)

```typescript
export async function getIndexInfo(env: Env) {
  const info = await env.VECTORIZE.describe();
  return {
    dimensions: info.dimensions,
    metric: info.metric,
    vectorCount: info.vectorsCount,
  };
}
```

---

## 3) Vector Operations

### Insert Vectors

```typescript
interface ProductVector {
  id: string;
  values: number[];
  metadata: {
    productId: string;
    name: string;
    category: string;
    price: number;
    storeId: string;
  };
}

export async function insertProduct(
  env: Env,
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    storeId: string;
  }
): Promise<void> {
  // Generate embedding from product text
  const textToEmbed = `${product.name}. ${product.description}. Category: ${product.category}`;

  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: textToEmbed,
  });

  const vector: ProductVector = {
    id: `product-${product.id}`,
    values: embeddingResponse.data[0],
    metadata: {
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      storeId: product.storeId,
    },
  };

  await env.VECTORIZE.insert([vector]);
}
```

### Batch Insert

```typescript
export async function batchInsertProducts(
  env: Env,
  products: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    storeId: string;
  }>
): Promise<void> {
  // Generate embeddings in batch
  const texts = products.map((p) => `${p.name}. ${p.description}. Category: ${p.category}`);

  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: texts,
  });

  const vectors = products.map((product, index) => ({
    id: `product-${product.id}`,
    values: embeddingResponse.data[index],
    metadata: {
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      storeId: product.storeId,
    },
  }));

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await env.VECTORIZE.insert(batch);
  }
}
```

### Update Vectors

```typescript
export async function updateProduct(
  env: Env,
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    storeId: string;
  }
): Promise<void> {
  // Upsert = Insert or Update
  const textToEmbed = `${product.name}. ${product.description}. Category: ${product.category}`;

  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: textToEmbed,
  });

  await env.VECTORIZE.upsert([
    {
      id: `product-${product.id}`,
      values: embeddingResponse.data[0],
      metadata: {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        storeId: product.storeId,
      },
    },
  ]);
}
```

### Delete Vectors

```typescript
export async function deleteProduct(env: Env, productId: string): Promise<void> {
  await env.VECTORIZE.deleteByIds([`product-${productId}`]);
}

// Bulk delete
export async function deleteProducts(env: Env, productIds: string[]): Promise<void> {
  const vectorIds = productIds.map((id) => `product-${id}`);
  await env.VECTORIZE.deleteByIds(vectorIds);
}
```

---

## 4) Semantic Search

### Basic Query

```typescript
export async function searchProducts(
  env: Env,
  query: string,
  storeId: string,
  topK = 10
): Promise<Array<{ id: string; score: number; metadata: Record<string, unknown> }>> {
  // Generate query embedding
  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: query,
  });

  const queryVector = embeddingResponse.data[0];

  // Search with metadata filter
  const results = await env.VECTORIZE.query(queryVector, {
    topK,
    filter: { storeId: { $eq: storeId } },
    returnMetadata: 'all',
  });

  return results.matches.map((match) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata,
  }));
}
```

### Advanced Filtering

```typescript
// Filter by category and price range
export async function searchWithFilters(
  env: Env,
  query: string,
  filters: {
    storeId: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  },
  topK = 10
) {
  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: query,
  });

  // Build filter object
  const filter: Record<string, unknown> = {
    storeId: { $eq: filters.storeId },
  };

  if (filters.category) {
    filter.category = { $eq: filters.category };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.price = {};
    if (filters.minPrice !== undefined) {
      (filter.price as Record<string, number>).$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (filter.price as Record<string, number>).$lte = filters.maxPrice;
    }
  }

  const results = await env.VECTORIZE.query(embeddingResponse.data[0], {
    topK,
    filter,
    returnMetadata: 'all',
  });

  return results.matches;
}
```

### Filter Operators

| Operator | Description      | Example                                |
| -------- | ---------------- | -------------------------------------- |
| `$eq`    | Equals           | `{ category: { $eq: 'Electronics' } }` |
| `$ne`    | Not equals       | `{ status: { $ne: 'archived' } }`      |
| `$gt`    | Greater than     | `{ price: { $gt: 100 } }`              |
| `$gte`   | Greater or equal | `{ price: { $gte: 100 } }`             |
| `$lt`    | Less than        | `{ price: { $lt: 500 } }`              |
| `$lte`   | Less or equal    | `{ price: { $lte: 500 } }`             |
| `$in`    | In array         | `{ category: { $in: ['A', 'B'] } }`    |

---

## 5) RAG Implementation

### Complete RAG Flow

```typescript
interface RAGResult {
  answer: string;
  sources: Array<{ id: string; name: string; score: number }>;
}

export async function ragQuery(env: Env, question: string, storeId: string): Promise<RAGResult> {
  // Step 1: Generate query embedding
  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: question,
  });

  // Step 2: Search for relevant products
  const searchResults = await env.VECTORIZE.query(embeddingResponse.data[0], {
    topK: 5,
    filter: { storeId: { $eq: storeId } },
    returnMetadata: 'all',
  });

  // Step 3: Build context from results
  const context = searchResults.matches
    .map((match) => {
      const meta = match.metadata as { name: string; category: string; price: number };
      return `- ${meta.name} (${meta.category}): $${meta.price}`;
    })
    .join('\n');

  // Step 4: Generate answer with LLM
  const systemPrompt = `You are a helpful shopping assistant. Answer questions based ONLY on the following products:

${context}

If the answer cannot be found in the products, say "I don't have information about that."`;

  const llmResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    max_tokens: 512,
  });

  return {
    answer: llmResponse.response,
    sources: searchResults.matches.map((match) => ({
      id: match.id,
      name: (match.metadata as { name: string }).name,
      score: match.score,
    })),
  };
}
```

---

## 6) Product Recommendations

### Similar Products

```typescript
export async function getSimilarProducts(
  env: Env,
  productId: string,
  storeId: string,
  topK = 5
): Promise<Array<{ productId: string; name: string; score: number }>> {
  // Get the product's vector by ID
  const productVector = await env.VECTORIZE.getByIds([`product-${productId}`]);

  if (productVector.length === 0) {
    return [];
  }

  // Query for similar products (excluding the original)
  const results = await env.VECTORIZE.query(productVector[0].values, {
    topK: topK + 1, // +1 because it will include itself
    filter: { storeId: { $eq: storeId } },
    returnMetadata: 'all',
  });

  return results.matches
    .filter((match) => match.id !== `product-${productId}`)
    .slice(0, topK)
    .map((match) => ({
      productId: (match.metadata as { productId: string }).productId,
      name: (match.metadata as { name: string }).name,
      score: match.score,
    }));
}
```

### Category-Based Recommendations

```typescript
export async function getCategoryRecommendations(
  env: Env,
  category: string,
  storeId: string,
  excludeProductIds: string[] = [],
  topK = 10
) {
  // Generate embedding for category concept
  const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: `Best products in ${category} category`,
  });

  const results = await env.VECTORIZE.query(embeddingResponse.data[0], {
    topK: topK + excludeProductIds.length,
    filter: {
      storeId: { $eq: storeId },
      category: { $eq: category },
    },
    returnMetadata: 'all',
  });

  return results.matches
    .filter(
      (match) => !excludeProductIds.includes((match.metadata as { productId: string }).productId)
    )
    .slice(0, topK);
}
```

---

## 7) Index Maintenance

### Re-index Products

```typescript
export async function reindexAllProducts(
  env: Env,
  storeId: string
): Promise<{ indexed: number; errors: number }> {
  // Fetch all products from D1
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

  // Process in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    try {
      await batchInsertProducts(
        env,
        batch.map((p) => ({
          id: String(p.id),
          name: String(p.name),
          description: String(p.description || ''),
          category: String(p.category),
          price: Number(p.price),
          storeId,
        }))
      );
      indexed += batch.length;
    } catch (error) {
      console.error(`Batch error: ${error}`);
      errors += batch.length;
    }
  }

  return { indexed, errors };
}
```

---

## 8) Best Practices

### Performance Optimization

| Strategy             | Implementation                            |
| -------------------- | ----------------------------------------- |
| **Batch operations** | Insert/update in batches of 100           |
| **Limit topK**       | Use minimal topK needed (default 10)      |
| **Index by store**   | Include storeId in metadata for filtering |
| **Cache embeddings** | Cache frequently queried embeddings in KV |

### Metadata Design

```typescript
// Good: Flat, indexed metadata
{
  productId: "123",
  name: "Red Dress",
  category: "Fashion",
  price: 4999,  // In cents/paisa
  storeId: "store-abc",
  inStock: true,
}

// Bad: Nested objects (not filterable)
{
  product: {
    id: "123",
    details: { name: "Red Dress" }
  }
}
```

---

## Quick Reference

| Operation  | Code                                                            |
| ---------- | --------------------------------------------------------------- |
| Insert     | `env.VECTORIZE.insert([{ id, values, metadata }])`              |
| Upsert     | `env.VECTORIZE.upsert([{ id, values, metadata }])`              |
| Query      | `env.VECTORIZE.query(vector, { topK, filter, returnMetadata })` |
| Delete     | `env.VECTORIZE.deleteByIds([id1, id2])`                         |
| Get by ID  | `env.VECTORIZE.getByIds([id1, id2])`                            |
| Index info | `env.VECTORIZE.describe()`                                      |
