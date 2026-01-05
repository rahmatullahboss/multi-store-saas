/**
 * Domain Settings Page
 * 
 * Route: /app/settings/domain
 * 
 * Features:
 * - View current subdomain
 * - Request custom domain
 * - View domain request status
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { Globe, Check, Clock, X, AlertTriangle, ExternalLink } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Domain Settings' }];
};

interface ActionData {
  success?: boolean;
  error?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) {
    throw new Response('Store not found', { status: 404 });
  }
  
  return json({
    subdomain: store[0].subdomain,
    customDomain: store[0].customDomain,
    customDomainRequest: store[0].customDomainRequest,
    customDomainStatus: store[0].customDomainStatus,
    planType: store[0].planType,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json<ActionData>({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  
  if (actionType === 'request') {
    const domainRequest = formData.get('domain') as string;
    
    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRequest || !domainRegex.test(domainRequest)) {
      return json<ActionData>({ error: 'Invalid domain format. Example: shop.example.com' }, { status: 400 });
    }
    
    // Check if domain is already taken
    const existingStore = await db.select().from(stores)
      .where(eq(stores.customDomain, domainRequest))
      .limit(1);
    
    if (existingStore[0]) {
      return json<ActionData>({ error: 'This domain is already in use by another store.' }, { status: 400 });
    }
    
    // Check pending requests
    const pendingRequest = await db.select().from(stores)
      .where(eq(stores.customDomainRequest, domainRequest))
      .limit(1);
    
    if (pendingRequest[0]) {
      return json<ActionData>({ error: 'This domain is already requested by another store.' }, { status: 400 });
    }
    
    // Submit request
    await db.update(stores).set({
      customDomainRequest: domainRequest.toLowerCase(),
      customDomainStatus: 'pending',
      customDomainRequestedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    
    return json<ActionData>({ success: true });
  }
  
  if (actionType === 'cancel') {
    await db.update(stores).set({
      customDomainRequest: null,
      customDomainStatus: 'none',
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    
    return json<ActionData>({ success: true });
  }
  
  return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
}

export default function DomainSettings() {
  const { subdomain, customDomain, customDomainRequest, customDomainStatus, planType } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const isPremium = planType === 'premium' || planType === 'custom';
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Domain Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store's domain and URL</p>
      </div>
      
      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">Your request has been submitted! We'll review it within 24 hours.</p>
        </div>
      )}
      
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}
      
      {/* Current Domains */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Your Store URLs</h2>
        
        {/* Subdomain (Always Active) */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-mono font-medium text-gray-900">
                {subdomain}.digitalcare.site
              </div>
              <p className="text-sm text-gray-500">Free subdomain (always active)</p>
            </div>
          </div>
          <a
            href={`https://${subdomain}.digitalcare.site`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
          >
            Visit <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        {/* Custom Domain (If Set) */}
        {customDomain && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-mono font-medium text-emerald-900">
                  {customDomain}
                </div>
                <p className="text-sm text-emerald-700">Custom domain (active)</p>
              </div>
            </div>
            <a
              href={`https://${customDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
            >
              Visit <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
      
      {/* Pending Request */}
      {customDomainStatus === 'pending' && customDomainRequest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Domain Request Pending</h3>
              <p className="text-yellow-800 mt-1">
                Your request for <span className="font-mono font-semibold">{customDomainRequest}</span> is being reviewed.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                We'll notify you once it's approved. This usually takes 24 hours.
              </p>
              <Form method="post" className="mt-4">
                <input type="hidden" name="actionType" value="cancel" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline disabled:opacity-50"
                >
                  Cancel request
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
      
      {/* Rejected Status */}
      {customDomainStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <X className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Domain Request Rejected</h3>
              <p className="text-red-800 mt-1">
                Your previous domain request was not approved. You can submit a new request below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Request Custom Domain Form */}
      {!customDomain && customDomainStatus !== 'pending' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Request Custom Domain</h2>
          <p className="text-gray-600 text-sm mb-6">
            Connect your own domain to your store. After approval, you'll need to update your DNS settings.
          </p>
          
          {!isPremium && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Premium Feature</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Custom domains are available on Premium plans. <a href="/app/upgrade" className="underline">Upgrade now</a> to unlock this feature.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="request" />
            
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Your Domain
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                placeholder="shop.yourdomain.com"
                disabled={!isPremium}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the domain you want to use for your store. You must own this domain.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !isPremium}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </Form>
          
          {/* DNS Instructions Preview */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">After approval, add this DNS record:</h3>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-500">Name</span>
                <span className="text-gray-500">Value</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 font-semibold">
                <span>CNAME</span>
                <span>@</span>
                <span className="text-emerald-600">multi-store-saas.pages.dev</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Already has custom domain - Show DNS Instructions */}
      {customDomain && customDomainStatus !== 'pending' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Domain Approved!</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Your domain <span className="font-mono font-semibold text-emerald-600">{customDomain}</span> has been approved. 
            Follow these steps to complete the setup:
          </p>
          
          {/* Step by Step DNS Instructions */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">Go to your domain provider's DNS settings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Login to where you registered your domain (e.g., Namecheap, GoDaddy, Cloudflare, Google Domains)
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">Add a CNAME record</h3>
                <div className="mt-3 bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-500 text-left">
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Name/Host</th>
                        <th className="pb-2">Value/Target</th>
                        <th className="pb-2">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold">
                      <tr>
                        <td className="py-1">CNAME</td>
                        <td className="py-1 text-blue-600">@ (or www)</td>
                        <td className="py-1 text-emerald-600">multi-store-saas.pages.dev</td>
                        <td className="py-1">Auto</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Some providers don't allow CNAME on root (@). In that case, use "www" and set up a redirect from your root domain.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">Wait for DNS propagation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  DNS changes can take 5 minutes to 48 hours to propagate worldwide. Usually it's done within 10-30 minutes.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">SSL Certificate (Automatic)</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Once DNS is set up, SSL certificate will be automatically issued. Your site will be accessible via HTTPS.
                </p>
              </div>
            </div>
          </div>
          
          {/* Test Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Test your domain:</span>
              <a
                href={`https://${customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Open {customDomain} <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Troubleshooting */}
          <details className="mt-6">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Having trouble? Click for troubleshooting tips
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
              <p>• Make sure there are no conflicting A or AAAA records for the same domain</p>
              <p>• If using Cloudflare, set the CNAME to "DNS Only" (gray cloud) initially</p>
              <p>• Check if your domain registrar has any domain locks enabled</p>
              <p>• Use <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">dnschecker.org</a> to verify DNS propagation</p>
              <p>• Contact support at <a href="mailto:support@digitalcare.site" className="text-emerald-600 underline">support@digitalcare.site</a></p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
