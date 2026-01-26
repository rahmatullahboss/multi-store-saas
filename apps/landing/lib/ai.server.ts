/**
 * AI Service for Landing Page
 */

interface AIServiceOptions {
  model: string;
  baseUrl?: string;
  systemPrompt?: string;
}

export class AIService {
  private apiKey: string;
  private options: AIServiceOptions;

  constructor(apiKey: string, options: AIServiceOptions) {
    this.apiKey = apiKey;
    this.options = options;
  }

  async chatWithVisitor(message: string, context: { history: any[] }): Promise<string> {
    const messages = [
      {
        role: "system",
        content: this.options.systemPrompt || `You are Ozzyl AI, a helpful assistant for Ozzyl - a Bangladeshi E-commerce platform.
        
        Key Info:
        - Ozzyl helps merchants build online stores in 5 minutes.
        - Supports bKash, Nagad, COD.
        - Bengali-first platform.
        - Features: Order management, Inventory, Landing Page mode, Courier Integration.
        - Pricing: Free plan available. Starter: 490 BDT/month.
        
        Guidelines:
        - Answer in the same language as the user (Bengali or English).
        - Be concise, friendly, and helpful.
        - If asked about pricing/features, give specific details.
        - Encourage them to "Start for Free".
        `
      },
      ...context.history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    try {
      const response = await fetch(`${this.options.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ozzyl.com", 
          "X-Title": "Ozzyl"
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: messages,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.choices[0].message.content;
    } catch (error) {
      console.error("AI Service Error:", error);
      return "দুঃখিত, আমি এখন উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।";
    }
  }
}

export const createAIService = (apiKey: string, options: Partial<AIServiceOptions> = {}) => {
  return new AIService(apiKey, {
    model: options.model || (process.env.AI_MODEL ?? "meta-llama/llama-3-8b-instruct:free"),
    baseUrl: options.baseUrl || process.env.AI_BASE_URL,
    ...options
  });
};
