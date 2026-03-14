/**
 * Create New Support Ticket
 * Form for merchants to submit support requests
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { Form, useLoaderData, useActionData, useNavigation } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { supportTickets, stores } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { Ticket, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { z } from 'zod';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get store info
  const [store] = await db
    .select({ name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return json({ storeName: store?.name || 'Your Store' });
}

const TicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  category: z.enum(['billing', 'technical', 'account', 'feature', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)').max(5000),
});

type ActionData = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const formData = await request.formData();
  const data = {
    subject: formData.get('subject')?.toString() || '',
    category: formData.get('category')?.toString() || 'other',
    priority: formData.get('priority')?.toString() || 'medium',
    description: formData.get('description')?.toString() || '',
  };

  // Validate
  const result = TicketSchema.safeParse(data);
  
  if (!result.success) {
    return json({ 
      error: result.error.errors[0].message,
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>
    }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  try {
    await db.insert(supportTickets).values({
      storeId,
      userId,
      subject: result.data.subject,
      description: result.data.description,
      category: result.data.category,
      priority: result.data.priority,
      status: 'open',
    });

    return redirect('/app/support');
  } catch (error) {
    console.error('Ticket creation error:', error);
    return json({ error: 'Failed to create ticket. Please try again.' }, { status: 500 });
  }
}

const categories = [
  { value: 'billing', label: 'Billing & Payments', description: 'Issues with payments, invoices, or billing' },
  { value: 'technical', label: 'Technical Issue', description: 'Bugs, errors, or technical problems' },
  { value: 'account', label: 'Account & Access', description: 'Login issues, permissions, or account settings' },
  { value: 'feature', label: 'Feature Request', description: 'Suggest a new feature or improvement' },
  { value: 'other', label: 'Other', description: 'Anything else not covered above' },
];

const priorities = [
  { value: 'low', label: 'Low', description: 'Non-urgent, can wait', color: 'gray' },
  { value: 'medium', label: 'Medium', description: 'Normal priority', color: 'blue' },
  { value: 'high', label: 'High', description: 'Needs attention soon', color: 'orange' },
  { value: 'urgent', label: 'Urgent', description: 'Critical issue, needs immediate help', color: 'red' },
];

export default function NewSupportTicket() {
  const { storeName } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/app/support"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-indigo-600" />
          Create New Ticket
        </h1>
        <p className="text-gray-500 mt-1">
          Describe your issue and we'll get back to you as soon as possible
        </p>
      </div>

      {/* Error Message */}
      {actionData?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{actionData.error}</span>
        </div>
      )}

      {/* Form */}
      <Form method="post" className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              minLength={5}
              maxLength={200}
              placeholder="Brief description of your issue"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {actionData?.fieldErrors?.subject && (
              <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.subject[0]}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <label key={cat.value} className="relative">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    defaultChecked={cat.value === 'technical'}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition">
                    <div className="font-medium text-gray-900">{cat.label}</div>
                    <div className="text-sm text-gray-500">{cat.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorities.map((pri) => (
                <label key={pri.value} className="relative">
                  <input
                    type="radio"
                    name="priority"
                    value={pri.value}
                    defaultChecked={pri.value === 'medium'}
                    className="sr-only peer"
                  />
                  <div className={`p-3 border-2 border-gray-200 rounded-lg cursor-pointer text-center peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition
                    ${pri.color === 'red' ? 'peer-checked:border-red-500 peer-checked:bg-red-50' : ''}
                    ${pri.color === 'orange' ? 'peer-checked:border-orange-500 peer-checked:bg-orange-50' : ''}
                    ${pri.color === 'blue' ? 'peer-checked:border-blue-500 peer-checked:bg-blue-50' : ''}
                    ${pri.color === 'gray' ? 'peer-checked:border-gray-500 peer-checked:bg-gray-50' : ''}
                  `}>
                    <div className="font-medium text-gray-900">{pri.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{pri.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              maxLength={5000}
              rows={8}
              placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you've already tried."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            {actionData?.fieldErrors?.description && (
              <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.description[0]}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Please provide as much detail as possible to help us resolve your issue faster.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/app/support"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </Form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Need immediate help?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Check our <a href="/help" className="underline hover:text-blue-900">Help Center</a> for common questions</li>
          <li>• For urgent issues, email us directly at support@ozzyl.com</li>
          <li>• Average response time: 24-48 hours</li>
        </ul>
      </div>
    </div>
  );
}
