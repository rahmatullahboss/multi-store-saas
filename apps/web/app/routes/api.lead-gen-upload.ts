/**
 * Lead Gen File Upload API
 *
 * Handles file uploads for lead generation forms:
 * - Images: client-side compression before upload
 * - PDFs: uploaded directly (PDF compression not supported in browser)
 *
 * Security:
 * - Rate limiting via DO (20 uploads/minute per IP per store)
 * - File type validation
 * - File size limits
 * - Multi-tenant isolation (store-scoped keys)
 * - Filename sanitization
 *
 * POST: Upload file and return R2 public URL
 */

import type { ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { stores } from '@db/schema';
import { eq, or } from 'drizzle-orm';
import { createDb } from '~/lib/db.server';
import { checkRateLimit } from '~/services/rate-limiter-do.server';

// Allow only specific folders for security
const ALLOWED_FOLDERS = new Set(['leads', 'documents', 'resumes', 'attachments']);

// Preset: 'upload' = 20 req/min
const RATE_LIMIT_PRESET = 'upload';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
  }

  const env = context.cloudflare.env as {
    DB: D1Database;
    R2?: R2Bucket;
    R2_PUBLIC_URL?: string;
    RATE_LIMITER_SERVICE: Fetcher;
  };

  const r2 = env.R2;
  const r2PublicUrl = env.R2_PUBLIC_URL;

  if (!r2) {
    console.error('R2 bucket not configured');
    return json({ error: 'Storage not configured' }, { status: 500 });
  }

  if (!r2PublicUrl) {
    console.error('R2_PUBLIC_URL not configured');
    return json({ error: 'Storage URL not configured' }, { status: 500 });
  }

  // Rate limiting via DO
  const url = new URL(request.url);
  const hostname = url.hostname;
  const db = createDb(env.DB);

  const [store] = await db
    .select()
    .from(stores)
    .where(or(eq(stores.customDomain, hostname), eq(stores.subdomain, hostname.split('.')[0])))
    .limit(1);

  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Rate limiting via DO (use store.id for tenant isolation)
  if (env.RATE_LIMITER_SERVICE) {
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown';

    const rateLimitResult = await checkRateLimit(env, store.id, ip, RATE_LIMIT_PRESET);
    if (!rateLimitResult.allowed) {
      return json(
        { error: 'Too many uploads. Please wait a moment.' },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      );
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = ((formData.get('folder') as string) || 'leads').trim().toLowerCase();

    // Security: Whitelist folder validation
    const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'leads';

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - allow images and PDFs only
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedPdfTypes = ['application/pdf'];
    const allowedTypes = [...allowedImageTypes, ...allowedPdfTypes];

    if (!allowedTypes.includes(file.type)) {
      return json(
        {
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF',
        },
        { status: 400 }
      );
    }

    // Validate file size
    const isPdf = file.type === 'application/pdf';
    const maxSize = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for PDF, 5MB for images
    if (file.size > maxSize) {
      return json({ error: `File too large. Maximum ${isPdf ? '10MB' : '5MB'}` }, { status: 400 });
    }

    // Generate unique key with sanitized filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    // Security: Sanitize filename - only allow safe characters
    const sanitizedName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100); // Limit length
    const key = `stores/${store.id}/${folder}/${timestamp}-${random}-${sanitizedName}`;

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Build public URL
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
    const publicUrl = `${baseUrl}/${key}`;

    console.log(`📎 Lead gen file uploaded: ${key} (${file.size} bytes, ${file.type})`);

    return json({
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      type: file.type,
      name: file.name,
    });
  } catch (error) {
    console.error('Lead gen upload error:', error);
    return json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
}
