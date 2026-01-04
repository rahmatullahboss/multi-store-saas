/**
 * Cloudinary Image Upload API
 * 
 * Handles image uploads to Cloudinary using unsigned upload
 * 
 * POST: Upload image file and return Cloudinary URL
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const cloudName = context.cloudflare.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
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

    // Upload to Cloudinary using unsigned upload
    // You need to create an unsigned upload preset in Cloudinary Dashboard
    const uploadPreset = 'ml_default'; // Default preset or create custom one
    
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
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
