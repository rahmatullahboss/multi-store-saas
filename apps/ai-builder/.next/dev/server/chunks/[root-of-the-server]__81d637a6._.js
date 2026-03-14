module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/ai-builder/lib/prompts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
7. Include the placeholder \`{ORDER_FORM}\` where the order form should appear
8. Do NOT import external components or libraries
9. Use inline SVG icons or emoji instead of icon libraries

## Structure:
- Hero section with headline, subheadline, and CTA
- Product features/benefits section
- Social proof / testimonials (use placeholder data)
- Product showcase with images (use placeholder images from picsum.photos)
- Pricing section if applicable
- {ORDER_FORM} - This will be replaced with the actual order form
- Footer with contact info

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
      
      {/* Order Form Placeholder */}
      <section className="px-4 py-16">
        {ORDER_FORM}
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
"[project]/apps/ai-builder/app/api/generate-arena/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "maxDuration",
    ()=>maxDuration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/lib/prompts.ts [app-route] (ecmascript)");
;
const maxDuration = 120; // Arena takes longer
const ARENA_API_URL = process.env.ARENA_API_URL || 'http://localhost:5000';
const DEFAULT_MODEL = process.env.ARENA_MODEL || 'claude-opus-4.5';
async function POST(req) {
    try {
        const { prompt, images, storeId, productId, model } = await req.json();
        if (!prompt) {
            return Response.json({
                error: 'Prompt is required'
            }, {
                status: 400
            });
        }
        // Build full prompt with context
        const fullPrompt = `
${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LANDING_PAGE_SYSTEM_PROMPT"]}

User Request: ${prompt}

${storeId ? `Store ID: ${storeId}` : ''}
${productId ? `Product ID: ${productId}` : ''}

IMPORTANT: Include the placeholder {ORDER_FORM} where the order form should appear.
`;
        // Prepare request body for arena automation
        const requestBody = {
            prompt: fullPrompt,
            model: model || DEFAULT_MODEL
        };
        // Add first image if provided (arena supports one image)
        if (images && images.length > 0) {
            requestBody.image = images[0];
        }
        // Call arena automation backend
        const response = await fetch(`${ARENA_API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(()=>({}));
            console.error('Arena API error:', errorData);
            return Response.json({
                error: errorData.error || 'Arena generation failed'
            }, {
                status: response.status
            });
        }
        const data = await response.json();
        if (!data.success) {
            return Response.json({
                error: data.error || 'Generation failed'
            }, {
                status: 500
            });
        }
        // Return generated code
        return Response.json({
            code: data.code,
            model: data.model
        });
    } catch (error) {
        console.error('Arena generation error:', error);
        return Response.json({
            error: error instanceof Error ? error.message : 'Failed to generate'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__81d637a6._.js.map