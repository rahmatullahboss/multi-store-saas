/**
 * Agent Prompts & Configuration
 * Ported from AgentFlow
 */

export interface AgentConfig {
  store_name: string;
  store_url?: string;
  delivery_charge?: number;
  delivery_time?: string;
  return_policy?: string;
  payment_methods?: string[];
  product_list?: string;
  tone?: 'friendly' | 'formal' | 'urgent';
  language?: 'bn' | 'en' | 'banglish';
  objectives?: ('answer_only' | 'lead_gen' | 'booking' | 'order')[];
  persona_name?: string;
  business_name?: string;
  working_hours?: string;
  calendar_link?: string;
  
  // Real Estate specific
  property_location?: string;
  property_price?: string;
  property_size?: string;
  property_list?: PropertyItem[];
}

export interface PropertyItem {
  id: string;
  name: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  description: string;
}

// Language-specific content
const PROMPTS = {
  bn: {
    tone: {
      friendly: 'বন্ধুত্বপূর্ণভাবে এবং হাসিমুখে কথা বলুন। ইমোজি ব্যবহার করতে পারেন 😊',
      formal: 'পেশাদার এবং সম্মানজনক ভাষায় কথা বলুন। "আপনি" ব্যবহার করুন।',
      urgent: 'দ্রুত এবং সরাসরি উত্তর দিন।',
    },
    languageInstruction: 'সবসময় বাংলায় উত্তর দিন।',
    objectives: {
      answer_only: 'প্রশ্নের সঠিক উত্তর দিন।',
      lead_gen: 'গ্রাহকের ফোন নম্বর এবং নাম collectLead ফাংশন দিয়ে সংগ্রহ করুন।',
      booking: 'গ্রাহক আগ্রহী হলে মিটিং বুক করুন bookMeeting ফাংশন দিয়ে।',
      order: 'গ্রাহক অর্ডার করতে চাইলে createOrder ফাংশন কল করুন।',
    },
    labels: {
      myRole: 'আমার দায়িত্ব',
      style: 'যোগাযোগের স্টাইল',
      storeInfo: 'স্টোর তথ্য',
      store: 'স্টোর',
      website: 'ওয়েবসাইট',
      delivery: 'ডেলিভারি',
      returnPolicy: 'রিটার্ন',
      payment: 'পেমেন্ট',
      products: 'প্রোডাক্ট',
      rules: 'নিয়ম',
      noFakeProducts: 'নেই এমন প্রোডাক্টের কথা বলবেন না',
      noWrongPrice: 'ভুল দাম বলবেন না',
      bePolite: 'গ্রাহক অভিযোগ করলে বিনয়ী থাকুন',
      iAm: 'আমি',
      assistant: 'অ্যাসিস্ট্যান্ট',
      currency: '৳',
    },
  },
  en: {
    tone: {
      friendly: 'Be warm and friendly. Feel free to use emojis 😊',
      formal: 'Maintain a professional and respectful tone.',
      urgent: 'Be quick and direct.',
    },
    languageInstruction: 'Always respond in English.',
    objectives: {
      answer_only: 'Provide accurate answers to questions.',
      lead_gen: 'Collect customer phone number and name using the collectLead function.',
      booking: 'Book a meeting if customer is interested using bookMeeting function.',
      order: 'Call createOrder function when customer wants to place an order.',
    },
    labels: {
      myRole: 'My Responsibilities',
      style: 'Communication Style',
      storeInfo: 'Store Information',
      store: 'Store',
      website: 'Website',
      delivery: 'Delivery',
      returnPolicy: 'Return Policy',
      payment: 'Payment',
      products: 'Products',
      rules: 'Rules',
      noFakeProducts: 'Do not mention products we don\'t have',
      noWrongPrice: 'Do not quote incorrect prices',
      bePolite: 'Stay polite when handling complaints',
      iAm: 'I am',
      assistant: 'assistant',
      currency: '$',
    },
  },
};

export function buildEcommercePrompt(config: Partial<AgentConfig>, ragContext: string = ''): string {
  const lang = (config.language === 'en' || config.language === 'bn') ? config.language : 'bn'; // Default to bn for banglish too for now
  const p = PROMPTS[lang];
  const l = p.labels;

  const personaIntro = config.persona_name 
    ? `${l.iAm} ${config.persona_name}, ${config.store_name || 'our store'}-${lang === 'en' ? "'s" : 'এর'} ${l.assistant}.`
    : `${l.iAm} ${config.store_name || 'our store'}-${lang === 'en' ? "'s" : 'এর'} ${l.assistant}.`;

  const objectivesList = (config.objectives || ['answer_only'])
    .map(obj => p.objectives[obj])
    .join('\n- ');

  const deliveryText = `${l.currency}${config.delivery_charge || 0} (${config.delivery_time || '2-3 days'})`;

  return `${personaIntro}

## ${l.myRole}:
- ${objectivesList}

## ${l.style}:
${p.tone[config.tone || 'friendly']}
${p.languageInstruction}

## ${l.storeInfo}:
- ${l.store}: ${config.store_name || 'Our Store'}
- ${l.website}: ${config.store_url || 'N/A'}
- ${l.delivery}: ${deliveryText}
- ${l.returnPolicy}: ${config.return_policy || 'N/A'}
- ${l.payment}: ${config.payment_methods?.join(', ') || 'Cash on Delivery'}

## ${l.products}:
${config.product_list || ragContext || 'See catalog.'}

## ${l.rules}:
- ${l.noFakeProducts}
- ${l.noFakeProducts}
- ${l.noWrongPrice}
- ${l.bePolite}

## STRUCTURED RESPONSE FORMAT (FOR RICH UI):
For data-heavy answers (stats, warnings, lists), return a JSON object (NOT markdown):
1. **Insight Cards** (For Sales/Stats):
   \`{ "type": "insight_cards", "data": [{ "title": "Sales", "value": "৳5000", "trend": 12, "color": "green", "icon": "sales" }] }\`
2. **Alerts** (For Errors/Warnings):
   \`{ "type": "alert", "data": { "severity": "warning", "title": "Notice", "message": "Stock low!" } }\`
3. **Action Chips** (For Suggestions):
   \`{ "type": "action_chips", "data": [{ "label": "View Orders", "url": "/app/orders" }] }\`
4. **Mixed** (Text + Cards):
   \`{ "type": "mixed", "items": [{ "type": "text", "data": "Summary:" }, { "type": "insight_cards", "data": [...] }] }\`

Use plain text for simple chats. NEVER use Markdown for data tables.

## STRICT RULES (ANTI-HALLUCINATION):
- NEVER invent an Order Status. You MUST use 'checkOrderStatus' function.
- If 'checkOrderStatus' returns "not found", tell the user exactly that. Do NOT say it is processing or shipped if the tool says otherwise.
- If user does not provide Order ID, ask for it. Do NOT guess.`;
}

export const ECOMMERCE_FUNCTION_DEFINITIONS = [
  {
    name: 'createOrder',
    description: 'Create an order when customer confirms they want to buy',
    parameters: {
      type: 'object',
      properties: {
        customer_name: { type: 'string' },
        customer_phone: { type: 'string' },
        delivery_address: { type: 'string' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              price: { type: 'number' },
            },
            required: ['name', 'quantity', 'price'],
          },
        },
      },
      required: ['customer_name', 'customer_phone', 'delivery_address', 'products'],
    },
  },
  {
    name: 'collectLead',
    description: 'Save customer information',
    parameters: {
      type: 'object',
      properties: {
        key: { type: 'string', enum: ['phone', 'name', 'budget', 'product_interest'] },
        value: { type: 'string' },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'checkOrderStatus',
    description: 'Check the status of an existing order. Ask for Order ID if not provided.',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'The Order ID (e.g. 1205)' },
        phone_number: { type: 'string', description: 'Customer phone number for verification (optional if already known)' },
      },
      required: ['order_id'],
    },
  },
];
