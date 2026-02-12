/**
 * Page Builder Image Upload API
 * 
 * Handles image uploads to R2 storage.
 * Images are initially stored in 'temp/' prefix and moved to 'uploads/' on page save.
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getAuthFromSession } from '~/services/auth.server';

// ============================================================================
// ACTION - Upload Image to R2
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context as any).cloudflare.env;
  
  const user = await getAuthFromSession(request, env);
  if (!user?.storeId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'webp';
    const filename = `${user.storeId}-${timestamp}-${randomStr}.${extension}`;
    
    // Upload to R2 temp folder
    const r2 = env.R2 as R2Bucket;
    const key = `temp/${filename}`;
    
    await r2.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: file.name,
        storeId: String(user.storeId),
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return public URL
    const r2PublicUrl = env.R2_PUBLIC_URL || 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev';
    const publicUrl = `${r2PublicUrl}/${key}`;

    return json({ 
      success: true, 
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
