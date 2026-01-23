---
name: Cloudflare R2
description: Expert skill for Cloudflare R2 - object storage, direct uploads, signed URLs, media optimization, and CORS configuration.
---

# Cloudflare R2 Skill

This skill covers Cloudflare R2 for building scalable media storage, direct uploads from browsers, signed URLs for secure access, and image optimization.

## 1) Core Concepts

### R2 Binding

```typescript
// wrangler.toml
[[r2_buckets]];
binding = 'R2';
bucket_name = 'multi-store-saas-media';

// TypeScript
interface Env {
  R2: R2Bucket;
}
```

### R2 Characteristics

| Feature             | Details                     |
| ------------------- | --------------------------- |
| **Egress**          | Free (no bandwidth charges) |
| **Max Object Size** | 5TB                         |
| **Storage Classes** | Standard, Infrequent Access |
| **S3 Compatible**   | Yes (API compatible)        |
| **Public Access**   | Via public bucket or Worker |

---

## 2) Basic Operations

### Put Object

```typescript
// Simple put
await env.R2.put('path/to/file.jpg', imageBuffer);

// Put with metadata
await env.R2.put('products/image.jpg', imageBuffer, {
  httpMetadata: {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000',
  },
  customMetadata: {
    storeId: 'store-abc',
    productId: '123',
    uploadedBy: 'user-xyz',
  },
});
```

### Get Object

```typescript
// Get object
const object = await env.R2.get('path/to/file.jpg');

if (object) {
  const arrayBuffer = await object.arrayBuffer();
  const blob = await object.blob();
  const text = await object.text();

  // Access metadata
  console.log(object.httpMetadata); // contentType, cacheControl, etc.
  console.log(object.customMetadata); // Your custom metadata
  console.log(object.size);
  console.log(object.etag);
}
```

### Head Object (Metadata Only)

```typescript
const head = await env.R2.head('path/to/file.jpg');

if (head) {
  console.log('Size:', head.size);
  console.log('Content-Type:', head.httpMetadata?.contentType);
  console.log('Uploaded:', head.uploaded);
}
```

### Delete Object

```typescript
// Single delete
await env.R2.delete('path/to/file.jpg');

// Batch delete
await env.R2.delete(['file1.jpg', 'file2.jpg', 'file3.jpg']);
```

### List Objects

```typescript
// List all objects
const list = await env.R2.list();

for (const object of list.objects) {
  console.log(object.key, object.size, object.uploaded);
}

// List with prefix (folder-like)
const productImages = await env.R2.list({
  prefix: 'products/',
  delimiter: '/',
});

// Paginated listing
let cursor: string | undefined;
do {
  const result = await env.R2.list({ cursor, limit: 100 });
  for (const obj of result.objects) {
    // Process object
  }
  cursor = result.truncated ? result.cursor : undefined;
} while (cursor);
```

---

## 3) Direct Browser Uploads

### Generate Signed Upload URL

```typescript
import { AwsClient } from 'aws4fetch';

interface UploadUrlResult {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

export async function generateUploadUrl(
  env: Env,
  storeId: string,
  filename: string,
  contentType: string
): Promise<UploadUrlResult> {
  const key = `stores/${storeId}/uploads/${Date.now()}-${filename}`;
  const expiresIn = 3600; // 1 hour

  // Create AWS client for R2
  const r2 = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  });

  const url = new URL(
    `https://${env.R2_BUCKET_NAME}.${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
  );

  // Generate presigned URL
  const signed = await r2.sign(
    new Request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
    }),
    {
      aws: { signQuery: true },
      expiresIn,
    }
  );

  return {
    uploadUrl: signed.url,
    key,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}
```

### API Route for Upload URL

```typescript
// Hono route
app.post(
  '/api/uploads/signed-url',
  zValidator(
    'json',
    z.object({
      filename: z.string().min(1),
      contentType: z.string().regex(/^(image|video)\//),
      storeId: z.string(),
    })
  ),
  async (c) => {
    const { filename, contentType, storeId } = c.req.valid('json');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowedTypes.includes(contentType)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }

    const result = await generateUploadUrl(c.env, storeId, filename, contentType);
    return c.json(result);
  }
);
```

### Client-Side Upload

```typescript
// Frontend upload code
async function uploadFile(file: File, storeId: string) {
  // 1. Get signed URL from backend
  const response = await fetch('/api/uploads/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      storeId,
    }),
  });

  const { uploadUrl, key } = await response.json();

  // 2. Upload directly to R2
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  // 3. Return the public URL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

---

## 4) Serving Files

### Worker-Based Serving

```typescript
app.get('/media/*', async (c) => {
  const key = c.req.path.replace('/media/', '');

  const object = await c.env.R2.get(key);

  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000');
  headers.set('ETag', object.etag);

  // Handle conditional requests
  const ifNoneMatch = c.req.header('If-None-Match');
  if (ifNoneMatch === object.etag) {
    return new Response(null, { status: 304 });
  }

  return new Response(object.body, { headers });
});
```

### Public Bucket Configuration

```bash
# Enable public access for bucket
npx wrangler r2 bucket create multi-store-saas-media --public

# Get public URL
# Format: https://pub-{hash}.r2.dev
```

---

## 5) CORS Configuration

### r2-cors.json

```json
[
  {
    "AllowedOrigins": ["https://ozzyl.com", "https://*.ozzyl.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### Apply CORS

```bash
npx wrangler r2 bucket cors set multi-store-saas-media --file r2-cors.json
```

### CORS in Worker

```typescript
app.options('/api/uploads/*', (c) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': c.req.header('Origin') ?? '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600',
    },
  });
});
```

---

## 6) Image Optimization Patterns

### Store with Variants

```typescript
interface ImageVariant {
  width: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg';
}

const VARIANTS: Record<string, ImageVariant> = {
  thumbnail: { width: 150, quality: 80, format: 'webp' },
  small: { width: 300, quality: 85, format: 'webp' },
  medium: { width: 600, quality: 85, format: 'webp' },
  large: { width: 1200, quality: 90, format: 'webp' },
  original: { width: 2400, quality: 95 },
};

export async function storeImageWithVariants(
  env: Env,
  storeId: string,
  imageId: string,
  originalBuffer: ArrayBuffer
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};

  for (const [name, variant] of Object.entries(VARIANTS)) {
    const key = `stores/${storeId}/images/${imageId}/${name}.${variant.format ?? 'jpg'}`;

    // In production, use image processing service
    // For now, store original with metadata
    await env.R2.put(key, originalBuffer, {
      httpMetadata: {
        contentType: `image/${variant.format ?? 'jpeg'}`,
        cacheControl: 'public, max-age=31536000',
      },
      customMetadata: {
        variant: name,
        width: String(variant.width),
        storeId,
      },
    });

    urls[name] = `${env.R2_PUBLIC_URL}/${key}`;
  }

  return urls;
}
```

### Cloudflare Image Resizing (via URL)

```typescript
// Use Cloudflare Image Resizing if enabled
export function getOptimizedImageUrl(
  originalUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: string }
): string {
  const params = new URLSearchParams();

  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);
  params.set('fit', 'cover');

  return `/cdn-cgi/image/${params.toString()}/${originalUrl}`;
}
```

---

## 7) File Organization

### Recommended Key Structure

```
stores/
├── {storeId}/
│   ├── products/
│   │   ├── {productId}/
│   │   │   ├── main.webp
│   │   │   ├── gallery-1.webp
│   │   │   └── gallery-2.webp
│   ├── pages/
│   │   ├── {pageId}/
│   │   │   └── hero-bg.webp
│   ├── branding/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   └── uploads/
│       └── {timestamp}-{filename}
```

### Path Helpers

```typescript
export const R2Paths = {
  product: (storeId: string, productId: string, filename: string) =>
    `stores/${storeId}/products/${productId}/${filename}`,

  page: (storeId: string, pageId: string, filename: string) =>
    `stores/${storeId}/pages/${pageId}/${filename}`,

  branding: (storeId: string, filename: string) => `stores/${storeId}/branding/${filename}`,

  upload: (storeId: string, filename: string) =>
    `stores/${storeId}/uploads/${Date.now()}-${filename}`,
};
```

---

## 8) Asset Tracking in D1

### Assets Table

```sql
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  entity_type TEXT,  -- 'product', 'page', 'branding'
  entity_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX idx_assets_store ON assets(store_id);
CREATE INDEX idx_assets_entity ON assets(entity_type, entity_id);
```

### Asset Service

```typescript
export async function trackAsset(
  env: Env,
  asset: {
    storeId: string;
    r2Key: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    entityType?: string;
    entityId?: string;
  }
): Promise<string> {
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `
    INSERT INTO assets (id, store_id, r2_key, filename, content_type, size_bytes, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  )
    .bind(
      id,
      asset.storeId,
      asset.r2Key,
      asset.filename,
      asset.contentType,
      asset.sizeBytes,
      asset.entityType ?? null,
      asset.entityId ?? null
    )
    .run();

  return id;
}

export async function deleteAssetWithCleanup(
  env: Env,
  assetId: string,
  storeId: string
): Promise<void> {
  // Get asset info
  const asset = await env.DB.prepare(
    `
    SELECT r2_key FROM assets WHERE id = ? AND store_id = ?
  `
  )
    .bind(assetId, storeId)
    .first();

  if (!asset) return;

  // Delete from R2
  await env.R2.delete(asset.r2_key as string);

  // Delete from D1
  await env.DB.prepare(
    `
    DELETE FROM assets WHERE id = ?
  `
  )
    .bind(assetId)
    .run();
}
```

---

## 9) Best Practices

### Security

```typescript
// ✅ Always validate file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function validateUpload(contentType: string, size: number): void {
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new HTTPException(400, { message: 'Invalid file type' });
  }
  if (size > MAX_SIZE) {
    throw new HTTPException(400, { message: 'File too large' });
  }
}
```

### Performance

| Strategy          | Implementation                                     |
| ----------------- | -------------------------------------------------- |
| **Cache headers** | Set long `max-age` for immutable assets            |
| **Unique keys**   | Include timestamp/hash to enable immutable caching |
| **Compression**   | Store WebP/AVIF for images                         |
| **CDN**           | Use public bucket URL or Worker with caching       |

---

## Quick Reference

| Operation | Code                                                        |
| --------- | ----------------------------------------------------------- |
| Put       | `await r2.put(key, body, { httpMetadata, customMetadata })` |
| Get       | `await r2.get(key)`                                         |
| Head      | `await r2.head(key)`                                        |
| Delete    | `await r2.delete(key)`                                      |
| List      | `await r2.list({ prefix, delimiter, cursor })`              |
| Get body  | `await object.arrayBuffer()` / `.blob()` / `.text()`        |
