/**
 * Student Document Upload API
 *
 * For study abroad students to upload their documents (PDF, images)
 * - Images: compressed on client before upload
 * - PDFs: uploaded directly (already compressed)
 *
 * POST: Upload document file and return R2 public URL
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getCustomerId } from '~/services/customer-auth.server';
import { createDb } from '~/lib/db.server';
import { customers } from '@db/schema';
import { eq } from 'drizzle-orm';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
  }

  // Get authenticated customer
  const customerId = await getCustomerId(request, context.cloudflare.env);
  if (!customerId) {
    return json({ error: 'Unauthorized - Please login first' }, { status: 401 });
  }

  // Verify customer exists
  const db = createDb(context.cloudflare.env.DB);
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);

  if (!customer) {
    return json({ error: 'Customer not found' }, { status: 404 });
  }

  const r2 = context.cloudflare.env.R2;
  const r2PublicUrl = context.cloudflare.env.R2_PUBLIC_URL;

  if (!r2 || !r2PublicUrl) {
    console.error('R2 not configured');
    return json({ error: 'Storage not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('documentType') as string) || 'other';

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - allow both images and PDFs
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedPdfTypes = ['application/pdf'];
    const allowedTypes = [...allowedImageTypes, ...allowedPdfTypes];

    if (!allowedTypes.includes(file.type)) {
      return json(
        {
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for documents)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return json({ error: 'File too large. Maximum 10MB' }, { status: 400 });
    }

    // Generate unique key for student documents
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedDocType = documentType.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    let extension: string;
    if (file.type === 'application/pdf') {
      extension = 'pdf';
    } else if (file.type === 'image/png') {
      extension = 'png';
    } else if (file.type === 'image/webp') {
      extension = 'webp';
    } else {
      extension = 'jpg';
    }

    // Key format: stores/{storeId}/students/{customerId}/{documentType}/{timestamp}-{random}.{ext}
    const key = `stores/${customer.storeId}/students/${customerId}/${sanitizedDocType}/${timestamp}-${random}.${extension}`;

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Determine content type
    const contentType =
      file.type === 'application/pdf'
        ? 'application/pdf'
        : file.type === 'image/webp'
          ? 'image/webp'
          : file.type === 'image/png'
            ? 'image/png'
            : 'image/jpeg';

    // Upload to R2
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: contentType,
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
      documentType: documentType,
    });
  } catch (error) {
    console.error('Student document upload error:', error);
    return json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
}
