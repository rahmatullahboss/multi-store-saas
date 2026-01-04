/**
 * Cloudinary Image Upload API (Signed Upload)
 * 
 * Uses API_KEY and API_SECRET for secure signed uploads
 * No unsigned preset required!
 * 
 * POST: Upload image file and return Cloudinary URL
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

/**
 * Generate Cloudinary signature using Web Crypto API
 * This is required for signed uploads
 */
async function generateSignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  // Sort parameters alphabetically and create string to sign
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const stringToSign = sortedParams + apiSecret;
  
  // Generate SHA-1 hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const cloudName = context.cloudflare.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = context.cloudflare.env.CLOUDINARY_API_KEY;
  const apiSecret = context.cloudflare.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return json({ 
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return json({ error: 'File too large. Maximum 10MB' }, { status: 400 });
    }

    // Generate timestamp and signature for signed upload
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const signature = await generateSignature(paramsToSign, apiSecret);

    // Upload to Cloudinary using signed upload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message?: string } };
      console.error('Cloudinary upload error:', errorData);
      return json({ 
        error: errorData?.error?.message || 'Upload failed' 
      }, { status: 500 });
    }

    const result = await response.json() as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    };

    return json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Block GET requests
export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}
