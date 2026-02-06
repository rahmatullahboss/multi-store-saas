# Deployment Guide

## Architecture

```
┌─────────────────────┐
│  AI Builder (Next.js)│ ──── Vercel
└─────────────────────┘
          │
          │ HTTP
          ▼
┌─────────────────────┐
│ Python Backend      │ ──── Railway/Render
│ (Flask + Playwright)│
└─────────────────────┘
```

## 1. Deploy Python Backend (Railway - Recommended)

### Why Railway?

- ✅ Free 500 hours/month
- ✅ Playwright/Browser automation supported
- ✅ Easy GitHub deployment
- ✅ Auto SSL

### Steps:

1. **Push to GitHub** (already done ✅)

2. **Create Railway Project**

   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Create project
   cd apps/arena-automation
   railway init
   ```

3. **Configure Buildpack**

   Create `railway.json`:

   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "playwright install chromium && python server.py",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

4. **Deploy**

   ```bash
   railway up
   ```

5. **Get URL** - Railway will provide: `https://your-app.railway.app`

## 2. Deploy Next.js to Vercel

```bash
cd apps/ai-builder
vercel

# Set environment variable:
# ARENA_API_URL=https://your-app.railway.app
```

## Alternative: Render (Also Free)

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command**: `pip install -r requirements.txt && playwright install chromium`
   - **Start Command**: `python server.py`
   - **Port**: 5000

## Alternative: Docker (Any Platform)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN playwright install chromium
RUN playwright install-deps chromium

COPY . .
CMD ["gunicorn", "-b", "0.0.0.0:5000", "server:app"]
```

## Local Development (Current Setup)

```bash
# Terminal 1 - Python Backend
cd apps/arena-automation
source venv/bin/activate
PORT=5001 python server.py

# Terminal 2 - Next.js
cd apps/ai-builder
npm run dev
```

Visit: http://localhost:3000

## Environment Variables

### Railway/Render

- `PORT` - Auto-set by platform
- `FLASK_DEBUG` - Set to `false` in production

### Vercel (AI Builder)

- `ARENA_API_URL` - Your Python backend URL
- `NEXT_PUBLIC_MAIN_API_URL` - Your main e-commerce API
