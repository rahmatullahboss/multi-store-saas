/**
 * RAG (Retrieval-Augmented Generation) Service
 * Uses Cloudflare Vectorize for semantic search
 * Embeddings powered by MiMo (OpenAI-compatible endpoint) or Cloudflare AI
 */

export interface Env {
  AI: any;
  VECTORIZE: any;
  MIMO_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}

// Embedding dimensions - Mimo/OpenAI usually 1536, BGE-Base is 768
// We'll trust the API response, but fallbacks need a default.
const EMBEDDING_DIMENSIONS = 1536; 

// MiMo API Configuration (OpenAI-compatible)
const MIMO_EMBEDDING_API = 'https://api.xiaomimimo.com/v1/embeddings';

export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    agent_id: string;
    type: 'product' | 'property' | 'faq' | 'policy' | 'knowledge';
    [key: string]: string;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, string>;
}

interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate embeddings using MiMo (OpenAI-compatible endpoint)
 * Falls back to mock embeddings if API key is not configured
 */
export async function generateEmbedding(
  text: string,
  env: Env
): Promise<number[]> {
  // Use MiMo embeddings if API key is available
  const apiKey = env.MIMO_API_KEY || env.OPENROUTER_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(MIMO_EMBEDDING_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002', // OpenAI-compatible model name
          input: text.substring(0, 8000), // Limit text length
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('MiMo embedding error:', error);
        return generateMockEmbedding(text);
      }

      const data = await response.json() as OpenAIEmbeddingResponse;
      
      // OpenAI-compatible response format
      if (data.data && data.data.length > 0) {
        return data.data[0].embedding;
      }
      
      return generateMockEmbedding(text);
    } catch (error) {
      console.error('Failed to generate MiMo embedding:', error);
      return generateMockEmbedding(text);
    }
  }

  // Fallback to Cloudflare AI if available and Mimo key missing?
  // For now, sticking to AgentFlow logic with Mock fallback
  console.warn('MIMO_API_KEY not configured, using mock embeddings');
  return generateMockEmbedding(text);
}

/**
 * Generate mock embeddings for development/fallback
 * Uses simple hash-based approach
 */
function generateMockEmbedding(text: string): number[] {
  const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0);
  
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, idx) => {
    const hash = simpleHash(word);
    const position = hash % EMBEDDING_DIMENSIONS;
    embedding[position] += 1 / (idx + 1);
  });
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * Simple hash function for mock embeddings
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient for bulk operations
 */
export async function generateBatchEmbeddings(
  texts: string[],
  env: Env
): Promise<number[][]> {
  // Use MiMo batch embedding if API key is available
  const apiKey = env.MIMO_API_KEY || env.OPENROUTER_API_KEY;
  if (apiKey) {
    try {
      // OpenAI-compatible batch embedding
      const response = await fetch(MIMO_EMBEDDING_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: texts.map(t => t.substring(0, 8000)),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('MiMo batch embedding error:', error);
        return texts.map(text => generateMockEmbedding(text));
      }

      const data = await response.json() as OpenAIEmbeddingResponse;
      
      // Sort by index to ensure correct order
      const sortedData = data.data.sort((a, b) => a.index - b.index);
      return sortedData.map(item => item.embedding);
    } catch (error) {
      console.error('Failed to generate batch embeddings:', error);
      return texts.map(text => generateMockEmbedding(text));
    }
  }

  // Fallback to individual mock embeddings
  return texts.map(text => generateMockEmbedding(text));
}

/**
 * Index a document into Vectorize
 */
export async function indexDocument(
  doc: VectorDocument,
  env: Env
): Promise<void> {
  const embedding = await generateEmbedding(doc.content, env);
  
  await env.VECTORIZE.upsert([
    {
      id: doc.id,
      values: embedding,
      metadata: {
        ...doc.metadata,
        content: doc.content.substring(0, 1000), // Store truncated content in metadata
      },
    },
  ]);
}

/**
 * Index multiple documents in batch
 * Uses batch embedding for efficiency
 */
export async function indexDocuments(
  docs: VectorDocument[],
  env: Env
): Promise<void> {
  // Generate embeddings in batch
  const embeddings = await generateBatchEmbeddings(
    docs.map(doc => doc.content),
    env
  );
  
  const vectors = docs.map((doc, idx) => ({
    id: doc.id,
    values: embeddings[idx],
    metadata: {
      ...doc.metadata,
      content: doc.content.substring(0, 1000),
    },
  }));
  
  // Batch upsert (Vectorize supports up to 1000 vectors per batch)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await env.VECTORIZE.upsert(batch);
  }
}

/**
 * Search for similar documents
 */
export async function searchDocuments(
  query: string,
  agentId: string,
  env: Env,
  topK: number = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query, env);
  
  const results = await env.VECTORIZE.query(queryEmbedding, {
    topK,
    filter: { agent_id: agentId },
    returnMetadata: 'all',
  });
  
  return results.matches.map((match: any) => ({
    id: match.id,
    score: match.score,
    content: (match.metadata?.content as string) || '',
    metadata: match.metadata as Record<string, string>,
  }));
}

/**
 * Delete documents by IDs
 */
export async function deleteDocuments(
  ids: string[],
  env: Env
): Promise<void> {
  if (ids.length === 0) return;
  
  // Vectorize delete by IDs
  await env.VECTORIZE.deleteByIds(ids);
}

/**
 * Format search results into context string for AI
 */
export function formatContextForAI(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }
  
  return results
    .filter(r => r.score > 0.3) // Only include relevant results
    .map((r) => {
      const type = r.metadata?.type || 'info';
      const label = type === 'product' ? '📦 Product' :
                    type === 'faq' ? '❓ FAQ' :
                    type === 'property' ? '🏠 Property' :
                    type === 'policy' ? '📋 Policy' : '📄 Info';
      return `[${label}] ${r.content}`;
    })
    .join('\n\n');
}

/**
 * RAG Pipeline: Search and format context
 */
export async function getRAGContext(
  query: string,
  agentId: string,
  env: Env,
  topK: number = 5
): Promise<string> {
  const results = await searchDocuments(query, agentId, env, topK);
  return formatContextForAI(results);
}

/**
 * Chunk large text into smaller pieces for better embedding
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length - overlap) break;
  }
  
  return chunks;
}
