/**
 * Customer Profile Completion Page
 *
 * Route: /account/complete-profile
 *
 * Shown after Google OAuth if the customer doesn't have a phone number.
 * Required for Bangladesh market where phone is essential for delivery.
 */

import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/cloudflare';
import { useLoaderData, Form, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { customers } from '@db/schema';
import { getCustomerId, requireCustomer } from '~/services/customer-auth.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/Input';
import { Phone, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

const bdPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  // If not logged in, redirect to login
  if (!customerId) {
    return redirect('/account/login');
  }

  const db = drizzle(env.DB);

  // Get customer details
  const customerResult = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      storeId: customers.storeId,
    })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (customerResult.length === 0) {
    return redirect('/account/login');
  }

  const customer = customerResult[0];

  // If customer already has phone, redirect to account
  if (customer.phone && customer.phone.trim().length > 0) {
    return redirect('/account');
  }

  return json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      storeId: customer.storeId,
    },
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;

  // Require customer to be logged in
  let customerId: number;
  try {
    customerId = await requireCustomer(request, env);
  } catch {
    return json({ error: 'Please log in first' }, { status: 401 });
  }

  const formData = await request.formData();
  const phone = formData.get('phone') as string;
  const name = formData.get('name') as string;

  // Validate phone number
  if (!phone || !bdPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    return json({ error: 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)' }, { status: 400 });
  }

  // Normalize phone number
  let normalizedPhone = phone.replace(/[\s-]/g, '');
  if (normalizedPhone.startsWith('+880')) {
    normalizedPhone = '0' + normalizedPhone.slice(4);
  } else if (normalizedPhone.startsWith('880')) {
    normalizedPhone = '0' + normalizedPhone.slice(3);
  }

  // Validate name
  if (!name || name.trim().length < 2) {
    return json({ error: 'সঠিক নাম দিন (কমপক্ষে ২ অক্ষর)' }, { status: 400 });
  }

  // Validate normalized phone length (BD numbers should be 11 digits: 01XXXXXXXXX)
  if (!/^0\d{10}$/.test(normalizedPhone)) {
    return json({ error: 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)' }, { status: 400 });
  }

  const db = drizzle(env.DB);

  // Get customer's store ID first
  const customerResult = await db
    .select({ storeId: customers.storeId })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (customerResult.length === 0) {
    return json({ error: 'Customer not found' }, { status: 404 });
  }

  const storeId = customerResult[0].storeId;

  // Check if phone is already used by another customer in this store
  const existingCustomer = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.phone, normalizedPhone), eq(customers.storeId, storeId)))
    .limit(1);

  if (existingCustomer.length > 0 && existingCustomer[0].id !== customerId) {
    return json({ error: 'এই নম্বরটি অন্য অ্যাকাউন্টে ব্যবহার করা হয়েছে' }, { status: 400 });
  }

  // Update customer profile
  try {
    await db
      .update(customers)
      .set({
        name: name.trim(),
        phone: normalizedPhone,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));

    return redirect('/account');
  } catch (error) {
    console.error('Failed to update customer profile:', error);
    return json({ error: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' }, { status: 500 });
  }
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function CompleteProfilePage() {
  const { customer } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">প্রোফাইল সম্পূর্ণ করুন</h1>
          <p className="text-gray-600">
            অর্ডার করতে এবং আপনার অর্ডার ট্র্যাক করতে আমাদের আপনার ফোন নম্বর প্রয়োজন
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-6 border border-gray-100">
          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          )}

          <Form method="post" className="space-y-5">
            {/* Email Display (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
              <div className="relative">
                <input
                  type="email"
                  value={customer.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                আপনার নাম <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={customer.name || ''}
                  placeholder="আপনার পূর্ণ নাম"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">উদাহরণ: 01712345678</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  প্রসেসিং...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  প্রোফাইল সম্পূর্ণ করুন
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </Form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-500">
          আপনার তথ্য আমাদের কাছে নিরাপদ। আমরা কখনোই আপনার তথ্য তৃতীয় পক্ষের সাথে শেয়ার করব না।
        </p>
      </div>
    </div>
  );
}
