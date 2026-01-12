/**
 * CSV Import Page for Products
 * 
 * Route: /app/inventory/import
 * 
 * Features:
 * - Upload CSV file
 * - Preview import data
 * - Map columns to fields
 * - Bulk create/update products
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, useActionData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  Upload, 
  ArrowLeft, 
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Import Products - Ozzyl SaaS' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  return json({ storeId });
}

// ============================================================================
// ACTION - Process CSV import
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'import') {
    const csvData = formData.get('csvData') as string;
    
    if (!csvData) {
      return json({ error: 'No CSV data provided' }, { status: 400 });
    }

    try {
      // ========================================================================
      // CHECK PRODUCT LIMIT BEFORE IMPORT
      // ========================================================================
      const { checkUsageLimit } = await import('~/utils/plans.server');
      const limitCheck = await checkUsageLimit(context.cloudflare.env.DB, storeId, 'product');
      
      if (!limitCheck.allowed) {
        return json({ 
          error: limitCheck.error?.message || 'Product limit reached. Please upgrade your plan to add more products.' 
        }, { status: 403 });
      }

      // Parse CSV
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      
      const results = { created: 0, updated: 0, errors: [] as string[], skippedDueToLimit: 0 };

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          results.errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });

        // Required: title and price
        if (!row.title || !row.price) {
          results.errors.push(`Row ${i + 1}: Missing required fields (title, price)`);
          continue;
        }

        const price = parseFloat(row.price);
        if (isNaN(price)) {
          results.errors.push(`Row ${i + 1}: Invalid price`);
          continue;
        }

        // Check if product exists by SKU
        let existingProduct = null;
        if (row.sku) {
          const existing = await db
            .select()
            .from(products)
            .where(eq(products.sku, row.sku))
            .limit(1);
          existingProduct = existing[0];
        }

        const productData = {
          title: row.title,
          price,
          sku: row.sku || null,
          inventory: row.inventory ? parseInt(row.inventory) : 0,
          category: row.category || null,
          description: row.description || null,
          imageUrl: row.image_url || row.imageurl || null,
          updatedAt: new Date(),
        };

        if (existingProduct && existingProduct.storeId === storeId) {
          // Update existing
          await db.update(products)
            .set(productData)
            .where(eq(products.id, existingProduct.id));
          results.updated++;
        } else {
          // Create new
          await db.insert(products).values({
            ...productData,
            storeId,
            isPublished: true,
            createdAt: new Date(),
          });
          results.created++;
        }
      }

      return json({ 
        success: true, 
        message: `Import complete: ${results.created} created, ${results.updated} updated`,
        results 
      });
    } catch (error) {
      console.error('Import error:', error);
      return json({ error: 'Failed to process CSV' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ImportPage() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();
  
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      
      // Parse preview
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1, 6).map(line => parseCSVLine(line));
        setPreview({ headers, rows });
      }
    };
    reader.readAsText(file);
  };

  const sampleCSV = `title,price,sku,inventory,category,description
"Blue T-Shirt",599,TS-001,50,Clothing,"Comfortable cotton t-shirt"
"Red Sneakers",2499,SN-002,25,Footwear,"Premium running shoes"
"Leather Wallet",899,WL-003,100,Accessories,"Genuine leather wallet"`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/inventory"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('importProducts')}</h1>
          <p className="text-gray-600">{t('bulkImportDesc')}</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {actionData && 'success' in actionData && actionData.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-emerald-800 font-medium">{actionData.message}</p>
            {actionData.results?.errors?.length > 0 && (
              <p className="text-emerald-700 text-sm mt-1">
                {actionData.results.errors.length} row(s) had errors
              </p>
            )}
          </div>
        </div>
      )}

      {actionData && 'error' in actionData && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('csvFormatRequirements')}</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>{t('csvFormatInstructions')}</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>title</strong> (required) - Product name</li>
            <li><strong>price</strong> (required) - Product price</li>
            <li><strong>sku</strong> - Stock keeping unit (used for matching existing products)</li>
            <li><strong>inventory</strong> - Stock quantity</li>
            <li><strong>category</strong> - Product category</li>
            <li><strong>description</strong> - Product description</li>
            <li><strong>image_url</strong> - URL to product image</li>
          </ul>
        </div>

        {/* Sample Download */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">{t('downloadTemplate')}</span>
            </div>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(sampleCSV)}`}
              download="product_import_template.csv"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" />
              {t('download')}
            </a>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <Form method="post" className="bg-white rounded-xl border border-gray-200 p-6">
        <input type="hidden" name="intent" value="import" />
        <input type="hidden" name="csvData" value={csvContent} />

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('chooseCsvFile')}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              {fileName ? (
                <p className="text-gray-900 font-medium">{fileName}</p>
              ) : (
                <>
                  <p className="text-gray-600">{t('clickToUpload')}</p>
                  <p className="text-gray-500 text-sm mt-1">{t('csvFilesOnly')}</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('previewFirst5Rows')}</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-gray-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-gray-900 truncate max-w-[200px]">
                          {cell || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('totalRows')}: {csvContent.trim().split('\n').length - 1}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            to="/app/inventory"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={!csvContent || isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('importing')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {t('importProducts')}
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}
