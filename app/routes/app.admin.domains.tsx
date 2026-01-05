/**
 * Admin Domain Requests Page
 * 
 * Platform admin page to view and approve/reject custom domain requests
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { Globe, Check, X, Clock, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Domain Requests - Admin' }];
};

interface DomainRequest {
  id: number;
  name: string;
  subdomain: string;
  customDomain: string | null;
  customDomainRequest: string | null;
  customDomainStatus: string | null;
  customDomainRequestedAt: Date | null;
  ownerEmail: string | null;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const db = drizzle(context.cloudflare.env.DB);
  
  // Check if user is admin
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || user[0].role !== 'admin') {
    throw new Response('Unauthorized', { status: 403 });
  }
  
  // Get all stores with pending domain requests
  const pendingRequests = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
      customDomainRequest: stores.customDomainRequest,
      customDomainStatus: stores.customDomainStatus,
      customDomainRequestedAt: stores.customDomainRequestedAt,
    })
    .from(stores)
    .where(isNotNull(stores.customDomainRequest));
  
  // Get store owner emails
  const requests: DomainRequest[] = [];
  for (const store of pendingRequests) {
    const owner = await db.select({ email: users.email }).from(users).where(eq(users.storeId, store.id)).limit(1);
    requests.push({
      ...store,
      ownerEmail: owner[0]?.email || null,
    });
  }
  
  return json({ requests });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const db = drizzle(context.cloudflare.env.DB);
  
  // Check if user is admin
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || user[0].role !== 'admin') {
    throw new Response('Unauthorized', { status: 403 });
  }
  
  const formData = await request.formData();
  const storeId = Number(formData.get('storeId'));
  const action = formData.get('action') as 'approve' | 'reject';
  
  if (!storeId || !action) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }
  
  // Get the store
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) {
    return json({ error: 'Store not found' }, { status: 404 });
  }
  
  if (action === 'approve') {
    // Approve - set customDomain to the requested domain
    await db.update(stores).set({
      customDomain: store[0].customDomainRequest,
      customDomainStatus: 'approved',
      customDomainRequest: null, // Clear the request
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: `Domain approved! Now add "${store[0].customDomainRequest}" to Cloudflare Pages.` });
  } else {
    // Reject - clear the request
    await db.update(stores).set({
      customDomainStatus: 'rejected',
      customDomainRequest: null,
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: 'Domain request rejected.' });
  }
}

export default function AdminDomainRequests() {
  const { requests } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2000);
  };
  
  const pendingRequests = requests.filter(r => r.customDomainStatus === 'pending');
  const processedRequests = requests.filter(r => r.customDomainStatus !== 'pending');
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Domain Requests</h1>
        <p className="text-gray-600 mt-1">Manage custom domain requests from merchants</p>
      </div>
      
      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No pending domain requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{req.name}</h3>
                    <p className="text-sm text-gray-600">
                      Current: <span className="font-mono">{req.subdomain}.digitalcare.site</span>
                    </p>
                    {req.ownerEmail && (
                      <p className="text-sm text-gray-500">Owner: {req.ownerEmail}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-600">Requested:</span>
                      <span className="font-mono font-semibold text-emerald-600">{req.customDomainRequest}</span>
                      <button
                        onClick={() => copyToClipboard(req.customDomainRequest || '')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy domain"
                      >
                        {copiedDomain === req.customDomainRequest ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {req.customDomainRequestedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Requested: {new Date(req.customDomainRequestedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Form method="post">
                      <input type="hidden" name="storeId" value={req.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="storeId" value={req.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Cloudflare Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-3">After Approving a Domain:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Go to <strong>Cloudflare Dashboard</strong> → <strong>Pages</strong> → <strong>multi-store-saas</strong></li>
          <li>Click <strong>Custom Domains</strong> → <strong>Add Custom Domain</strong></li>
          <li>Enter the approved domain and follow Cloudflare's instructions</li>
          <li>Tell the merchant to add this CNAME record:
            <div className="mt-2 bg-white p-3 rounded-lg font-mono text-xs">
              <div><strong>Type:</strong> CNAME</div>
              <div><strong>Name:</strong> @ (or www)</div>
              <div><strong>Target:</strong> multi-store-saas.pages.dev</div>
            </div>
          </li>
        </ol>
      </div>
      
      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {processedRequests.slice(0, 10).map((req) => (
              <div key={req.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium">{req.name}</span>
                  <span className="text-gray-500 ml-2">({req.subdomain})</span>
                  {req.customDomain && (
                    <span className="ml-2 text-emerald-600 font-mono text-sm">{req.customDomain}</span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  req.customDomainStatus === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {req.customDomainStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
