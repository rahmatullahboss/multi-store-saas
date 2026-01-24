/**
 * Push Notifications Dashboard
 * 
 * Route: /app/push
 * 
 * Allows merchants to send push notifications to their store subscribers.
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { pushSubscriptions, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { ArrowLeft, Bell, Loader2, Send, Users } from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => [{ title: 'Push Notifications' }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get subscriber count
  const subs = await db
    .select({ count: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.storeId, storeId));

  const subscriberCount = subs.length;

  // Get store name
  const store = await db.select({ name: stores.name }).from(stores).where(eq(stores.id, storeId)).limit(1);

  return json({
    subscriberCount,
    storeName: store[0]?.name || 'Store',
  });
}

export default function PushNotificationsPage() {
  const { subscriberCount, storeName } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isSubmitting = navigation.state === 'submitting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    if (!title.trim() || !body.trim()) {
      setError('Title and message are required.');
      return;
    }

    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url: url || '/' }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (data.success) {
        setSuccess(true);
        setTitle('');
        setBody('');
        setUrl('');
      } else {
        setError(data.error || 'Failed to send notification.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Push Notifications
          </h1>
          <p className="text-gray-600">Send notifications to customers who subscribed to {storeName}.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <Users className="w-6 h-6 text-emerald-600" />
        <div>
          <p className="text-lg font-bold text-emerald-900">{subscriberCount}</p>
          <p className="text-sm text-emerald-700">Active subscribers</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          ✅ Notification sent successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New arrivals!"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Check out our latest products and deals."
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Link (optional)
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/products"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Where users go when they tap the notification.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || subscriberCount === 0}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>

      {subscriberCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
          <p className="font-medium mb-1">No subscribers yet</p>
          <p>Customers can subscribe to push notifications on your storefront. Once they do, you can send them updates here.</p>
        </div>
      )}
    </div>
  );
}
