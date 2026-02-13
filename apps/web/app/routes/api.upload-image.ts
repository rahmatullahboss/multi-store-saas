/**
 * R2 Image Upload API
 * 
 * Uses Cloudflare R2 for image storage.
 * Images should be compressed on the client before upload.
 * 
 * POST: Upload image file and return R2 public URL
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getStoreIdWithRecovery } from '~/services/auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const { storeId, headers: recoveryHeaders } = await getStoreIdWithRecovery(
    request,
    context.cloudflare.env,
    context.cloudflare.env.DB
  );
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const r2 = context.cloudflare.env.R2;
  const r2PublicUrl = context.cloudflare.env.R2_PUBLIC_URL;

  if (!r2) {
    console.error('R2 bucket not configured. Ensure R2 binding is set up in wrangler.toml and Cloudflare Dashboard.');
    return json({ error: 'Storage not configured' }, { status: 500 });
  }

  if (!r2PublicUrl) {
    console.error('R2_PUBLIC_URL not configured. Set it in environment variables.');
    return json({ error: 'Storage URL not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = ((formData.get('folder') as string) || 'temp').trim().toLowerCase();
    const allowedFolders = new Set([
      'products',
      'logos',
      'favicons',
      'banners',
      'collections',
      'builder',
      'og-images',
      'temp',
    ]);
    const folder = allowedFolders.has(requestedFolder) ? requestedFolder : 'temp';

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/ico',
    ];
    if (!allowedTypes.includes(file.type)) {
      return json({ 
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB - should be smaller after client compression)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return json({ error: 'File too large. Maximum 5MB' }, { status: 400 });
    }

    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico',
      'image/ico': 'ico',
    };
    const extension = extensionByType[file.type] || file.type.split('/')[1] || 'webp';
    const key = `stores/${storeId}/${folder}/${timestamp}-${random}.${extension}`;

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
    });

    // Build public URL
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
    const publicUrl = `${baseUrl}/${key}`;

    return json({
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      type: file.type,
    }, recoveryHeaders ? { headers: recoveryHeaders } : undefined);

  } catch (error) {
    console.error('Upload error:', error);
    return json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Block GET requests
export async function loader() {
  return json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
