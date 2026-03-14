/**
 * Student Document Upload & Delete API
 *
 * For study abroad students to upload their documents (PDF, images)
 * - Images: compressed on client before upload
 * - PDFs: uploaded directly (already compressed)
 *
 * POST: Upload document file and return R2 public URL
 * DELETE: Delete a document by ID
 */

import type { ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { getCustomerId, getCustomerStoreId } from '~/services/customer-auth.server';
import { createDb } from '~/lib/db.server';
import { customers, studentDocuments } from '@db/schema';
import { eq, and } from 'drizzle-orm';

export async function action({ request, context }: ActionFunctionArgs) {
  // Handle DELETE request for document deletion
  if (request.method === 'DELETE') {
    return handleDelete(request, context);
  }

  // Only allow POST for uploads
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST, DELETE' } });
  }

  // Get authenticated customer
  const customerId = await getCustomerId(request, context.cloudflare.env);
  const sessionStoreId = await getCustomerStoreId(request, context.cloudflare.env);
  if (!customerId || !sessionStoreId) {
    return json({ error: 'Unauthorized - Please login first' }, { status: 401 });
  }

  // Verify customer exists
  const db = createDb(context.cloudflare.env.DB);
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, sessionStoreId)))
    .limit(1);

  if (!customer) {
    return json({ error: 'Customer not found' }, { status: 404 });
  }

  const r2 = context.cloudflare.env.R2;
  const r2PublicUrl = context.cloudflare.env.R2_PUBLIC_URL;

  if (!r2 || !r2PublicUrl) {
    console.error('R2 not configured');
    return json({ error: 'Storage not configured' }, { status: 500 });
  }

  let uploadedKey: string | null = null;
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
    uploadedKey = key;

    // Build public URL
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
    const publicUrl = `${baseUrl}/${key}`;

    let metadataPersisted = true;
    try {
      await db.insert(studentDocuments).values({
        storeId: customer.storeId,
        customerId,
        fileUrl: publicUrl,
        fileKey: key,
        fileName: file.name, // Use original filename
        fileType: contentType,
        fileSize: file.size,
        documentType: sanitizedDocType || 'other',
        status: 'uploaded',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/no such table:\s*student_documents/i.test(message)) {
        console.warn('[api.student-document] student_documents table not found; skipping metadata persist.');
        metadataPersisted = false;
      } else {
        throw error;
      }
    }

    if (!metadataPersisted) {
      if (uploadedKey) {
        try {
          await r2.delete(uploadedKey);
        } catch (r2Error) {
          console.error('R2 rollback error:', r2Error);
        }
      }
      return json(
        { error: 'Document storage is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    return json({
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      type: file.type,
      documentType: documentType,
    });
  } catch (error) {
    if (uploadedKey) {
      try {
        await r2.delete(uploadedKey);
      } catch (r2Error) {
        console.error('R2 cleanup error:', r2Error);
      }
    }
    console.error('Student document upload error:', error);
    return json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

/**
 * Handle DELETE request - Delete a document by ID
 */
async function handleDelete(request: Request, context: ActionFunctionArgs['context']) {
  // Get authenticated customer
  const customerId = await getCustomerId(request, context.cloudflare.env);
  const sessionStoreId = await getCustomerStoreId(request, context.cloudflare.env);
  if (!customerId || !sessionStoreId) {
    return json({ error: 'Unauthorized - Please login first' }, { status: 401 });
  }

  const db = createDb(context.cloudflare.env.DB);
  const r2 = context.cloudflare.env.R2;

  try {
    // Parse request body for documentId
    const body = await request.json();
    const documentId =
      typeof body === 'object' && body && 'documentId' in body
        ? (body as { documentId?: number | string }).documentId
        : undefined;

    const parsedDocumentId =
      typeof documentId === 'string' ? Number(documentId) : documentId;

    if (!parsedDocumentId || !Number.isFinite(parsedDocumentId)) {
      return json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Find the document
    const [document] = await db
      .select()
      .from(studentDocuments)
      .where(
        and(
          eq(studentDocuments.id, parsedDocumentId),
          eq(studentDocuments.customerId, customerId),
          eq(studentDocuments.storeId, sessionStoreId)
        )
      )
      .limit(1);

    if (!document) {
      return json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from R2
    if (r2 && document.fileKey) {
      try {
        await r2.delete(document.fileKey);
      } catch (r2Error) {
        console.error('R2 delete error:', r2Error);
        // Continue to delete from DB even if R2 delete fails
      }
    }

    // Delete from database
    await db
      .delete(studentDocuments)
      .where(eq(studentDocuments.id, parsedDocumentId));

    return json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document delete error:', error);
    return json({ error: 'Delete failed. Please try again.' }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST, DELETE' } });
}
