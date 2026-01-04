/**
 * Unsubscribe Page
 * 
 * Route: /unsubscribe
 * 
 * Public page for email unsubscription
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { emailSubscribers, stores } from '@db/schema';
import { MailX, CheckCircle } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Unsubscribe' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const storeId = Number(url.searchParams.get('store'));

  if (!email || !storeId) {
    return json({ error: 'Invalid unsubscribe link', storeName: null });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store name
  const storeResult = await db
    .select({ name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return json({
    email,
    storeId,
    storeName: storeResult[0]?.name || 'Store',
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const storeId = Number(formData.get('storeId'));

  if (!email || !storeId) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Update subscriber status
  await db
    .update(emailSubscribers)
    .set({
      status: 'unsubscribed',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(emailSubscribers.storeId, storeId),
        eq(emailSubscribers.email, email)
      )
    );

  return json({ success: true });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function UnsubscribePage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (loaderData.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <p className="text-red-600">{loaderData.error}</p>
        </div>
      </div>
    );
  }

  if (actionData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribed</h1>
          <p className="text-gray-600">
            You have been successfully unsubscribed from {loaderData.storeName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailX className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe</h1>
        <p className="text-gray-600 mb-6">
          Are you sure you want to unsubscribe <strong>{loaderData.email}</strong> from {loaderData.storeName}?
        </p>

        <Form method="post">
          <input type="hidden" name="email" value={loaderData.email} />
          <input type="hidden" name="storeId" value={loaderData.storeId} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Yes, Unsubscribe Me'}
          </button>
        </Form>

        <p className="text-gray-400 text-sm mt-6">
          You can always resubscribe later.
        </p>
      </div>
    </div>
  );
}
