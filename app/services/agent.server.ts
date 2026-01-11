import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
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
    where: eq(schema.agents.id, agentId),
  });
  
  if (!agent) throw new Error('Agent not found');
  
  // 2. Fetch Chat History from messages table
  const history = await db.query.messages.findMany({
    where: eq(schema.messages.conversationId, conversationId),
    orderBy: [desc(schema.messages.createdAt)],
    limit: 10,
  });

  // 2.5 Check Usage Limits & Credits
  
  // A. Spam Protection
  const lastUserMessage = history.find(m => m.role === 'user');
  if (lastUserMessage && lastUserMessage.createdAt) {
    const timeSinceLastMessage = Date.now() - lastUserMessage.createdAt.getTime();
    if (timeSinceLastMessage < 2000) { 
      return { text: 'অনুগ্রহ করে একটু ধীরে লিখুন।' };
    }
  }

  // B. Credit Check & Deduction (NEW)
  // Check if store has credits
  const creditLogs = await db.select({
      amount: schema.creditUsageLogs.amount
  }).from(schema.creditUsageLogs)
  .where(eq(schema.creditUsageLogs.storeId, agent.storeId));
  
  const totalCredits = creditLogs.reduce((sum, log) => sum + log.amount, 0);

  if (totalCredits <= 0) {
      return { text: '⚠️ দোকানের ক্রেডিট শেষ হয়ে গেছে। দয়া করে রিচার্জ করুন।' };
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

  // 6. Build Message Array & Save User Message
  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.reverse().map(msg => ({ role: msg.role as any, content: msg.content })),
    { role: 'user', content: userMessage }
  ];

  // Save USER message to DB
  await db.insert(schema.messages).values({
      conversationId,
      role: 'user',
      content: userMessage,
      creditsUsed: 0, // Customer message doesn't cost credit
  });

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
      }),
    });

    if (!response.ok) throw new Error('AI API Failed');

    const result = await response.json() as any;
    const aiMsg = result.choices?.[0]?.message;

    if (!aiMsg) return { text: 'দুঃখিত, বুঝতে পারিনি।' };

    // 8. Save AI Response to DB & Deduct Credit
    let responseText = aiMsg.content || '';
    let toolCallData = null;

    if (aiMsg.tool_calls?.[0]) {
       const tc = aiMsg.tool_calls[0];
       toolCallData = {
           name: tc.function.name,
           args: JSON.parse(tc.function.arguments)
       };
       
       // EXECUTE TOOL CALL
       const toolResult = await executeToolCall(db, toolCallData, agent.storeId, conversationId);
       responseText = toolResult; // Use tool result as the response text
    }

    await db.insert(schema.messages).values({
        conversationId,
        role: 'assistant',
        content: responseText,
        functionName: toolCallData?.name, 
        functionArgs: toolCallData ? JSON.stringify(toolCallData.args) : null,
        functionResult: toolCallData ? responseText : null,
        creditsUsed: 1, 
    });

    // Log Credit Usage Transaction
    await db.insert(schema.creditUsageLogs).values({
        storeId: agent.storeId,
        amount: -1, // Deduct 1
        type: 'usage',
        description: 'AI Chat Response',
        metadata: JSON.stringify({ conversationId }),
    });

    return {
      text: responseText,
      functionCall: toolCallData || undefined
    };
    
  } catch (error) {
    console.error('AI Processing Exception:', error);
    return { text: 'Technical error occurred.' };
  }
}

// Helper: Execute Tool Function
async function executeToolCall(
    db: any, 
    toolCall: { name: string, args: any }, 
    storeId: number,
    conversationId: number
): Promise<string> {
    
    // 1. ORDER STATUS CHECK
    if (toolCall.name === 'checkOrderStatus') {
       const { order_id, phone_number } = toolCall.args;
       
       if (!order_id) return "দয়া করে অর্ডার আইডি দিন।";

       // Clean order ID (remove #, ord_, etc)
       const cleanOrderId = String(order_id).replace(/\D/g, ''); 
       const orderIdInt = parseInt(cleanOrderId);

       if (isNaN(orderIdInt)) return "ভুল অর্ডার আইডি ফরম্যাট।";

       // Find order
       const order = await db.query.orders.findFirst({
           where: (orders: any, { eq, and }: any) => and(
               eq(orders.id, orderIdInt),
               eq(orders.storeId, storeId)
           ),
           with: {
               customer: true
           }
       });

       if (!order) return `SYSTEM: Order #${cleanOrderId} NOT FOUND. You MUST tell the user: "দুঃখিত, #${cleanOrderId} আইডি দিয়ে কোনো অর্ডার আমাদের সিস্টেমে নেই।" Do NOT make up any status.`;

       // Optional: Verify Phone if provided
       if (phone_number && order.customer?.phone) {
            // Check last 4 digits match
            const p1 = phone_number.replace(/\D/g, '').slice(-4);
            const p2 = order.customer.phone.replace(/\D/g, '').slice(-4);
            if (p1 !== p2) {
                 return "অর্ডারটি পাওয়া গেছে কিন্তু ফোন নম্বর মিলছে না। নিরাপত্তার জন্য সঠিক ফোন নম্বর দিন।";
            }
       }

       let statusText = order.status;
       const bnStatus: Record<string, string> = {
           pending: 'পেন্ডিং (অপেক্ষা করুন)',
           processing: 'প্রসেসিং হচ্ছে',
           shipped: 'শিপ করা হয়েছে (কুরিয়ারে আছে)',
           delivered: 'ডেলিভারি সম্পন্ন হয়েছে ✅',
           cancelled: 'বাতিল করা হয়েছে ❌',
           returned: 'রিটার্ন করা হয়েছে'
       };
       if (bnStatus[order.status]) statusText = bnStatus[order.status];

       return `📦 অর্ডার #${order.id} এর বর্তমান অবস্থা: **${statusText}**\n💰 মোট বিল: ৳${order.total}\n📅 তারিখ: ${new Date(order.createdAt).toLocaleDateString()}`;
    }

    // 2. LEAD COLLECTION
    if (toolCall.name === 'collectLead') {
        const { key, value } = toolCall.args;
        
        await db.insert(schema.leadsData).values({
            conversationId,
            key,
            value,
            createdAt: new Date()
        });
        
        return "তথ্য সেভ করা হয়েছে। ধন্যবাদ! আমরা শীঘ্রই যোগাযোগ করব।";
    }

    // 3. CREATE ORDER (Placeholder)
    if (toolCall.name === 'createOrder') {
        return "অর্ডার করার জন্য ধন্যবাদ! একজন প্রতিনিধি আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।";
    }

    return "Function executed successfully.";
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
