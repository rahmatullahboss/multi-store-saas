import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { buildEcommercePrompt, ECOMMERCE_FUNCTION_DEFINITIONS, type AgentConfig } from './agent.prompts';
import { getRAGContext } from './rag.server';
import { checkUsageLimit, LIMIT_CODES } from '../utils/plans.server';

// Types derived from schema or environment
type Env = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: any; // Cloudflare AI
  MIMO_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
};

const MIMO_API_URL = 'https://api.xiaomimimo.com/v1/chat/completions';
const DEFAULT_MODEL = 'mimo-v2-flash';

interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  text: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
}

/**
 * Process a message and generate AI response
 */
export async function processMessage(
  agentId: number,
  userMessage: string,
  conversationId: number,
  env: Env
): Promise<AIResponse> {
  const db = drizzle(env.DB, { schema });
  
  // 1. Fetch Agent Config
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.id, agentId), // Correct usage
  });
  
  if (!agent) throw new Error('Agent not found');
  
  // 2. Fetch Chat History
  const history = await db.query.messages.findMany({
    where: eq(schema.messages.conversationId, conversationId),
    orderBy: [desc(schema.messages.createdAt)],
    limit: 10,
  });

  // 2.5 Check Usage Limits (Spam + Monthly Quota)
  
  // A. Spam Protection: Check if last user message was < 2 seconds ago
  const lastUserMessage = history.find(m => m.role === 'user');
  if (lastUserMessage && lastUserMessage.createdAt) {
    const timeSinceLastMessage = Date.now() - lastUserMessage.createdAt.getTime();
    if (timeSinceLastMessage < 2000) { // 2 seconds cooldown
      return { text: 'অনুগ্রহ করে একটু ধীরে লিখুন। (Please slow down)' };
    }
  }

  // B. Monthly Quota Check
  const usageCheck = await checkUsageLimit(db, agent.storeId, 'ai_message');
  if (!usageCheck.allowed) {
    console.warn(`[AI LIMIT] Store ${agent.storeId} reached limit. Code: ${usageCheck.error?.code}`);
    return { 
      text: '⚠️ এই মাসে আপনার দোকানের AI মেসেজ লিমিট শেষ হয়ে গেছে। দয়া করে প্ল্যান আপগ্রেড করুন বা আগামী মাসের জন্য অপেক্ষা করুন।' 
      // "Your store's AI message limit for this month has been reached. Please upgrade plan..."
    };
  }
  
  // 3. RAG Search
  const ragContext = await getRAGContext(userMessage, String(agent.id), env);
  
  // 4. Build System Prompt
  const config = JSON.parse(agent.agentSettings || '{}') as Partial<AgentConfig>;
  // Fallback to defaults
  config.store_name = agent.name; 
  
  const systemPrompt = buildEcommercePrompt(config, ragContext);
  
  // 5. Prepare Tools
  const tools: Tool[] = ECOMMERCE_FUNCTION_DEFINITIONS.map(fn => ({
    type: 'function',
    function: {
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters,
    }
  }));

  // 6. Build Message Array
  const historyMessages = history.reverse().map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    ...(historyMessages.length > 0 && historyMessages[historyMessages.length - 1].content === userMessage 
      ? [] 
      : [{ role: 'user' as const, content: userMessage }]),
  ];

  // 7. Call AI API
  try {
    const response = await fetch(MIMO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.MIMO_API_KEY || env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: chatMessages,
        tools: tools.length > 0 ? tools : undefined,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error('AI API Error:', await response.text());
      return { text: 'দুঃখিত, আমি এখন উত্তর দিতে পারছি না। পরে চেষ্টা করুন।' };
    }

    const result = await response.json() as any;
    const message = result.choices?.[0]?.message;

    if (!message) return { text: 'দুঃখিত, আমি বুঝতে পারিনি।' };

    // Handle Tool Calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      return {
        text: message.content || '',
        functionCall: {
          name: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments),
        },
      };
    }

    return { text: message.content || '...' };
    
  } catch (error) {
    console.error('AI Processing Exception:', error);
    return { text: 'Technical error occurred.' };
  }
}

/**
 * Handle function call execution
 */
export async function handleFunctionCall(
  functionName: string,
  args: Record<string, unknown>,
  conversationId: number,
  env: Env
): Promise<string> {
  const db = drizzle(env.DB, { schema });

  switch (functionName) {
    case 'createOrder': // Simplified logic mostly for demo
      // In a real scenario, we would insert into the 'orders' table
      // For now, we just acknowledge.
      return `অর্ডার গ্রহণ করা হয়েছে! ধন্যবাদ, ${args.customer_name}।`;
      
    case 'collectLead':
      await db.insert(schema.leadsData).values({
        conversationId,
        key: args.key as string,
        value: args.value as string,
      });
      return 'তথ্য সংরক্ষণ করা হয়েছে।';
      
    default:
      return 'ফাংশনটি পাওয়া যায়নি।';
  }
}
