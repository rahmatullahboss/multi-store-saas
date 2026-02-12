/**
 * R2 Image Delete API
 * 
 * Deletes images from Cloudflare R2 bucket to save storage.
 * Called when user removes an image from the UI.
 * 
 * POST: Delete image by URL or key
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getStoreId } from '~/services/auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Require authentication
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const r2 = context.cloudflare.env.R2;
  const r2PublicUrl = context.cloudflare.env.R2_PUBLIC_URL;

  if (!r2) {
    console.error('R2 bucket not configured');
    return json({ error: 'Storage not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const imageUrl = formData.get('imageUrl') as string;
    const imageKey = formData.get('imageKey') as string;

    // Extract key from URL or use provided key
    let keyToDelete = imageKey;
    
    if (!keyToDelete && imageUrl && r2PublicUrl) {
      // Extract key from full URL
      // URL format: https://r2-url.com/folder/timestamp-random.ext
      const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
      if (imageUrl.startsWith(baseUrl)) {
        keyToDelete = imageUrl.replace(baseUrl + '/', '');
      }
    }

    if (!keyToDelete) {
      return json({ error: 'No image URL or key provided' }, { status: 400 });
    }

    // Security: Validate key format to prevent path traversal
    if (keyToDelete.includes('..') || keyToDelete.startsWith('/')) {
      console.warn(`[SECURITY] Invalid key format attempted: ${keyToDelete}`);
      return json({ error: 'Invalid image key' }, { status: 400 });
    }

    const requiredPrefix = `stores/${storeId}/`;
    if (!keyToDelete.startsWith(requiredPrefix)) {
      console.warn(`[SECURITY] Cross-store delete blocked for store ${storeId}: ${keyToDelete}`);
      return json({ error: 'Forbidden image key scope' }, { status: 403 });
    }

    // Delete from R2
    await r2.delete(keyToDelete);
    
    console.warn(`[R2] Deleted image: ${keyToDelete}`);

    return json({
      success: true,
      deleted: keyToDelete,
    });

  } catch (error) {
    console.error('Delete error:', error);
    return json({ error: 'Delete failed' }, { status: 500 });
  }
}

// Block GET requests
export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}


export default function() {}
