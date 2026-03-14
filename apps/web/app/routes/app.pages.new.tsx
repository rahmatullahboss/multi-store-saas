/**
 * Create Custom Page
 * 
 * Route: /app/pages/new
 * 
 * Allows merchants to create new custom storefront pages.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { Form, useActionData, useNavigation } from 'react-router';
import { requireTenant } from '~/lib/tenant-guard.server';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });
  return json({ storeId });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const formData = await request.formData();
  const title = formData.get('title')?.toString().trim() || '';
  const content = formData.get('content')?.toString().trim() || '';

  if (!title) {
    return json({ error: 'Page title is required' }, { status: 400 });
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // For now, we'll store pages in store config or a dedicated table
  // This is a simplified MVP - in production you'd store in a pages table
  
  return redirect(`/app/pages?created=${slug}`);
}

export default function NewCustomPageRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/pages" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Custom Page</h1>
          <p className="text-gray-600">Add a new page to your storefront (e.g., About, Contact, FAQ).</p>
        </div>
      </div>

      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Page Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="About Us"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">This will be shown as the page heading.</p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Page Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              placeholder="Write your page content here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Basic content for the page. You can customize layout using the theme editor later.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/app/pages"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Page
              </>
            )}
          </button>
        </div>
      </Form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Quick Tip</h3>
        <p className="text-sm text-blue-700">
          Custom pages will be accessible at <code className="bg-blue-100 px-1 rounded">/pages/your-page-slug</code>. 
          You can link to them from your navigation menu.
        </p>
      </div>
    </div>
  );
}
