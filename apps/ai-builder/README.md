# AI Landing Page Builder

An AI-powered landing page builder that generates beautiful, high-converting landing pages from text prompts and reference images.

## Features

- 🤖 **AI Code Generation** - Claude 3.5 Sonnet via OpenRouter
- 🖼️ **Reference Images** - Upload images to inspire the design
- 👀 **Live Preview** - See changes in real-time with Sandpack
- 🛒 **Order Integration** - Auto-inject order forms connected to your main system
- 📱 **Responsive** - Mobile-first generated pages

## Quick Start

```bash
# Install dependencies
npm install

# Create .env.local with your API key
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_MAIN_API_URL=https://your-domain.com
NEXT_PUBLIC_DEFAULT_STORE_ID=1
NEXT_PUBLIC_DEFAULT_PRODUCT_ID=1
```

## Order Integration

Generated landing pages automatically include an order form that:

- Collects customer name, phone, address
- Submits to your main system's `/api/create-order` endpoint
- Supports Cash on Delivery (COD)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/ai-builder)

## Tech Stack

- Next.js 15 (App Router)
- Vercel AI SDK + OpenRouter
- Sandpack (CodeSandbox preview)
- Tailwind CSS v4
