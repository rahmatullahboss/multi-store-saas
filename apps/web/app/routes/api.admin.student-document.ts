/**
 * Admin API for Student Document Management
 * Allows admins to upload/delete documents on behalf of students
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getStoreId, requireUserId } from '~/services/auth.server';
import { createDb } from '~/lib/db.server';
import { customers, studentDocuments } from '@db/schema';
import { eq, and } from 'drizzle-orm';

export async function action({ request, context }: ActionFunctionArgs) {
  // Require Admin Auth
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createDb(context.cloudflare.env.DB);
  const r2 = context.cloudflare.env.R2;
  const r2PublicUrl = context.cloudflare.env.R2_PUBLIC_URL;

  if (request.method === 'DELETE') {
    // ADMIN DELETE
    try {
      const formData = await request.formData();
      const documentId = formData.get('documentId');
      
      if (!documentId) {
         return json({ error: 'Document ID required' }, { status: 400 });
      }

      const id = parseInt(documentId.toString());

      // Verify doc belongs to store
      const [doc] = await db
        .select()
        .from(studentDocuments)
        .where(and(eq(studentDocuments.id, id), eq(studentDocuments.storeId, storeId)))
        .limit(1);

      if (!doc) {
        return json({ error: 'Document not found' }, { status: 404 });
      }

      // Delete from R2
      if (r2 && doc.fileKey) {
        try {
          await r2.delete(doc.fileKey);
        } catch (e) {
          console.error('R2 Delete Error', e);
        }
      }

      // Delete from DB
      await db.delete(studentDocuments).where(eq(studentDocuments.id, id));

      return json({ success: true });
    } catch (error) {
       console.error('Admin Delete Error', error);
       return json({ error: 'Delete failed' }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    // ADMIN UPLOAD
    try {
      const formData = await request.formData();
      const customerId = parseInt(formData.get('customerId') as string);
      const file = formData.get('file') as File;
      const documentType = (formData.get('documentType') as string) || 'admin-upload';

      if (!customerId || isNaN(customerId)) {
        return json({ error: 'Customer ID required' }, { status: 400 });
      }
      if (!file) {
        return json({ error: 'File required' }, { status: 400 });
      }

      // Verify customer exists in store
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)))
        .limit(1);

      if (!customer) {
        return json({ error: 'Customer not found' }, { status: 404 });
      }

      // Upload Logic (Similar to student-document.ts)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
         return json({ error: 'Invalid file type. Use PDF or Image.' }, { status: 400 });
      }

      const extension = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const key = `stores/${storeId}/students/${customerId}/${documentType}/${timestamp}-${random}.${extension}`;

      await r2.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type }
      });

      const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
      const publicUrl = `${baseUrl}/${key}`;

      await db.insert(studentDocuments).values({
        storeId,
        customerId,
        fileUrl: publicUrl,
        fileKey: key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentType,
        status: 'approved', // Admin uploads are auto-approved
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return json({ success: true, url: publicUrl });

    } catch (error) {
      console.error('Admin Upload Error', error);
      return json({ error: 'Upload failed' }, { status: 500 });
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
