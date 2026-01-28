# R2 Asset Upload Instructions

## 🚀 Setup Cloudflare R2 for Landing Page Assets

### 1. Create R2 Bucket

```bash
# Login to Cloudflare
wrangler login

# Create bucket for public assets
wrangler r2 bucket create multi-store-saas-media
```

### 2. Upload Logos

```bash
# Navigate to web app public folder
cd apps/web/public

# Upload brand logos to R2
wrangler r2 object put multi-store-saas-media/brand/logo-white.png --file=brand/logo-white.png
wrangler r2 object put multi-store-saas-media/brand/logo-white-small.png --file=brand/logo-white-small.png
wrangler r2 object put multi-store-saas-media/brand/logo-white-xs.png --file=brand/logo-white-xs.png
wrangler r2 object put multi-store-saas-media/brand/logo-green.png --file=brand/logo-green.png
wrangler r2 object put multi-store-saas-media/ozzyl-logo.png --file=ozzyl-logo.png
wrangler r2 object put multi-store-saas-media/brand/ozzyl-logo-small-black.webp --file=ozzyl-logo-small-black.webp
wrangler r2 object put multi-store-saas-media/ozzyl-logo-small.png --file=ozzyl-logo-small.png
```

### 3. Enable Public Access

1. Go to Cloudflare Dashboard → R2
2. Select `multi-store-saas-media` bucket
3. Go to Settings → Public Access
4. Click "Allow Access" and get the public URL
5. Copy the URL (e.g., `https://pub-xxxxx.r2.dev`)

### 4. Set Environment Variable

```bash
# In apps/landing/.env.local
NEXT_PUBLIC_R2_ASSETS_URL=https://pub-xxxxx.r2.dev
```

### 5. (Optional) Custom Domain

If you want to use a custom domain like `assets.ozzyl.com`:

1. Add custom domain in R2 bucket settings
2. Create CNAME record in Cloudflare DNS:
   - Name: `assets`
   - Target: Your R2 public URL
3. Update `.env.local`:
   ```
   NEXT_PUBLIC_R2_ASSETS_URL=https://assets.ozzyl.com
   ```

## 📦 Asset Usage in Code

```typescript
import { ASSETS } from '~/config/assets';

// Use in components
<img src={ASSETS.logo.white} alt="Ozzyl Logo" />
<img src={ASSETS.logo.green} alt="Ozzyl" />
```

## ✅ Benefits

- ✨ No logos in Git repo (smaller bundle)
- 🚀 Served from Cloudflare CDN (faster)
- 🔄 Easy to update without redeploying
- 📦 Separate static assets from code

## 🗑️ After R2 Setup Complete

Once uploaded and verified, DELETE logos from `apps/web/public/brand/` to reduce bundle size.
