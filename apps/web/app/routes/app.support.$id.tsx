/**
 * Support Ticket Detail View
 * Shows ticket details and admin responses
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Form, useNavigation } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { supportTickets, stores } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { 
  Ticket, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Send,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router';
import { z } from 'zod';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const ticketId = Number(params.id);
  if (isNaN(ticketId)) {
    throw new Response('Invalid ticket ID', { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get ticket
  const [ticket] = await db
    .select()
    .from(supportTickets)
    .where(and(
      eq(supportTickets.id, ticketId),
      eq(supportTickets.storeId, storeId)
    ))
    .limit(1);

  if (!ticket) {
    throw new Response('Ticket not found', { status: 404 });
  }

  return json({ ticket });
}

const UpdateSchema = z.object({
  additionalInfo: z.string().min(10, 'Please provide more details').max(2000),
});

export async function action({ request, context, params }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const ticketId = Number(params.id);
  if (isNaN(ticketId)) {
    return json({ error: 'Invalid ticket ID' }, { status: 400 });
  }

  const formData = await request.formData();
  const additionalInfo = formData.get('additionalInfo')?.toString() || '';

  if (additionalInfo.length < 10) {
    return json({ error: 'Please provide at least 10 characters' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get current ticket
  const [ticket] = await db
    .select()
    .from(supportTickets)
    .where(and(
      eq(supportTickets.id, ticketId),
      eq(supportTickets.storeId, storeId)
    ))
    .limit(1);

  if (!ticket) {
    return json({ error: 'Ticket not found' }, { status: 404 });
  }

  // Append to description
  const newDescription = ticket.description + '\n\n--- Additional Info ---\n' + new Date().toLocaleString() + '\n' + additionalInfo;

  try {
    await db
      .update(supportTickets)
      .set({
        description: newDescription,
        updatedAt: new Date(),
        // Reset to open if it was waiting
        status: ticket.status === 'waiting' ? 'open' : ticket.status,
      })
      .where(eq(supportTickets.id, ticketId));

    return json({ success: true });
  } catch (error) {
    console.error('Ticket update error:', error);
    return json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Loader2 },
  waiting: { label: 'Waiting', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600 border-red-200' },
};

const categoryLabels = {
  billing: 'Billing & Payments',
  technical: 'Technical Issue',
  account: 'Account & Access',
  feature: 'Feature Request',
  other: 'Other',
};

export default function TicketDetailPage() {
  const { ticket } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/app/support"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Ticket className="w-6 h-6 text-indigo-600" />
              {ticket.subject}
            </h1>
            <p className="text-gray-500 mt-1">
              Ticket #{ticket.id} • Created {new Date(ticket.createdAt || '').toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${status.color}`}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
            <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full border ${priority.color}`}>
              {priority.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
              Category: {categoryLabels[ticket.category as keyof typeof categoryLabels] || ticket.category}
            </div>
          </div>

          {/* Admin Response */}
          {ticket.adminResponse && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-green-900">Admin Response</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {ticket.adminResponse}
              </div>
              {ticket.resolvedAt && (
                <div className="mt-4 pt-4 border-t border-green-200 text-sm text-green-700">
                  Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Add More Info Form */}
          {ticket.status !== 'closed' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Add More Information
              </h2>
              <Form method="post">
                <textarea
                  name="additionalInfo"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  placeholder="Add any additional information or respond to the admin..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none mb-4"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Update
                    </>
                  )}
                </button>
              </Form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ticket Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Ticket ID</dt>
                <dd className="font-medium text-gray-900">#{ticket.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Category</dt>
                <dd className="font-medium text-gray-900">
                  {categoryLabels[ticket.category as keyof typeof categoryLabels] || ticket.category}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Priority</dt>
                <dd className="font-medium text-gray-900">{priority.label}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900">{status.label}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="font-medium text-gray-900">
                  {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
            <p className="text-sm text-blue-800 mb-3">
              For urgent issues, you can also email us directly.
            </p>
            <a
              href="mailto:support@ozzyl.com"
              className="text-sm text-blue-700 underline hover:text-blue-900"
            >
              support@ozzyl.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
