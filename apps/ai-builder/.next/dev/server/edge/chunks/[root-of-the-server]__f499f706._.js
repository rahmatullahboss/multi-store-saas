(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f499f706._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/apps/ai-builder/lib/prompts.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IMAGE_ANALYSIS_PROMPT",
    ()=>IMAGE_ANALYSIS_PROMPT,
    "LANDING_PAGE_SYSTEM_PROMPT",
    ()=>LANDING_PAGE_SYSTEM_PROMPT
]);
const LANDING_PAGE_SYSTEM_PROMPT = `You are an expert frontend developer specializing in creating beautiful, high-converting landing pages. 

Your task is to generate a SINGLE React component that renders a complete landing page based on the user's requirements.

## Rules:
1. Output ONLY the React component code - no explanations, no markdown, no code fences
2. Use Tailwind CSS for all styling
3. Make the design modern, premium, and visually striking
4. Ensure the page is fully responsive (mobile-first)
5. Include smooth animations and hover effects
6. Use a consistent color scheme based on the product/brand
7. Do NOT import external components or libraries
8. Use inline SVG icons or emoji instead of icon libraries

## Structure:
- Hero section with headline, subheadline, and CTA
- Product features/benefits section
- Social proof / testimonials (use placeholder data)
- Product showcase with images (use placeholder images from picsum.photos)
- Pricing section if applicable
- ORDER FORM - You MUST design a beautiful, unique order form (see below)
- Footer with contact info

## ORDER FORM REQUIREMENTS (CRITICAL):
You MUST create an order form with a UNIQUE DESIGN that matches the page theme. The form MUST:

1. **Include these exact input fields:**
   - customer_name (text, required) - label: "আপনার নাম"
   - phone (tel, required, pattern for BD mobile) - label: "মোবাইল নম্বর"
   - address (textarea, required) - label: "সম্পূর্ণ ঠিকানা"
   - division (select with options: dhaka, outside_dhaka) - label: "এলাকা"
   - quantity (number, default 1, min 1) - label: "পরিমাণ"

2. **Use this EXACT form submission handler:**
\`\`\`
onSubmit={async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  const orderData = {
    store_id: __STORE_ID__,
    product_id: __PRODUCT_ID__,
    customer_name: formData.get('customer_name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    division: formData.get('division'),
    quantity: parseInt(formData.get('quantity') || '1'),
    payment_method: 'cod',
  };
  
  try {
    const res = await fetch('__API_URL__/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (data.success) {
      alert('অর্ডার সফল হয়েছে! অর্ডার নম্বর: ' + data.orderNumber);
      form.reset();
    } else {
      alert('ত্রুটি: ' + (data.error || 'অর্ডার করতে সমস্যা হয়েছে'));
    }
  } catch (err) {
    alert('নেটওয়ার্ক ত্রুটি! আবার চেষ্টা করুন।');
  }
}}
\`\`\`

3. **Design Freedom:** Make the form design UNIQUE and match the landing page theme:
   - Can use any layout (single column, two-column, card style, floating, etc.)
   - Can use any color scheme that matches the page
   - Can add icons, decorative elements, glassmorphism, gradients, etc.
   - Can position it anywhere on the page
   - MUST look premium and professional

## Example Output Format:
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Product Name</h1>
        <p className="text-xl text-gray-300">Tagline here</p>
      </section>
      
      {/* Features */}
      <section className="px-4 py-16">
        {/* ... */}
      </section>
      
      {/* Order Form - YOUR UNIQUE DESIGN */}
      <section className="px-4 py-16">
        <div className="max-w-lg mx-auto ...your unique design...">
          <form onSubmit={...handler above...}>
            {/* Your creative form layout */}
          </form>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="px-4 py-8 text-center text-gray-500">
        © 2024 Brand Name
      </footer>
    </div>
  );
}

Remember: Only output the code, nothing else!`;
const IMAGE_ANALYSIS_PROMPT = `Analyze the provided reference image(s) and incorporate the following visual elements into your landing page design:
- Color scheme and palette
- Typography style
- Layout structure
- Visual hierarchy
- Design patterns and components
- Overall aesthetic and mood

Create a landing page that matches or is inspired by this visual style.`;
}),
"[project]/apps/ai-builder/app/api/generate/route.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "maxDuration",
    ()=>maxDuration,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/lib/prompts.ts [app-edge-route] (ecmascript)");
;
const runtime = 'edge';
const maxDuration = 60;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.AI_MODEL || 'arcee-ai/trinity-large-preview:free';
async function POST(req) {
    try {
        const { prompt, images, storeId, productId } = await req.json();
        if (!prompt) {
            return Response.json({
                error: 'Prompt is required'
            }, {
                status: 400
            });
        }
        if (!OPENROUTER_API_KEY) {
            return Response.json({
                error: 'OpenRouter API key not configured'
            }, {
                status: 500
            });
        }
        // Build user message content
        const userContent = [];
        // Add image analysis instruction if images provided
        if (images && images.length > 0) {
            userContent.push({
                type: 'text',
                text: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["IMAGE_ANALYSIS_PROMPT"]
            });
            // Add images (up to 2) in OpenAI vision format
            for (const imageData of images.slice(0, 2)){
                userContent.push({
                    type: 'image_url',
                    image_url: {
                        url: imageData
                    }
                });
            }
        }
        // Add the main prompt with store/product context
        const contextualPrompt = `
Create a landing page for the following requirement:

${prompt}

${storeId ? `Store ID: ${storeId}` : ''}
${productId ? `Product ID: ${productId}` : ''}

Remember to include the {ORDER_FORM} placeholder where the order form should appear.
`;
        userContent.push({
            type: 'text',
            text: contextualPrompt
        });
        // Call OpenRouter API directly with streaming
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': req.headers.get('origin') || 'https://ai-builder.vercel.app',
                'X-Title': 'AI Landing Builder'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["LANDING_PAGE_SYSTEM_PROMPT"]
                    },
                    {
                        role: 'user',
                        content: userContent
                    }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 16000
            })
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('OpenRouter error:', error);
            return Response.json({
                error: 'AI generation failed'
            }, {
                status: 500
            });
        }
        // Return the stream directly
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        console.error('Generation error:', error);
        return Response.json({
            error: error instanceof Error ? error.message : 'Failed to generate code'
        }, {
            status: 500
        });
    }
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f499f706._.js.map