/**
 * Create New Customer
 * 
 * Route: /app/customers/new
 * 
 * Features:
 * - Form to create a new customer
 * - Validation with Zod
 * - Redirects to customer detail on success
 */

import { json, redirect, type ActionFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useActionData, useNavigation, Form, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { customers, customerAddresses } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { z } from 'zod';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2
} from 'lucide-react';
import { PageHeader } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
import { Button } from '~/components/ui/button';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Add Customer - Merchant Dashboard' }];
};

// ============================================================================
// SCHEMA
// ============================================================================
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address1: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  // Validate
  const result = createCustomerSchema.safeParse(rawData);
  if (!result.success) {
    return json({ 
      errors: result.error.flatten().fieldErrors,
      values: rawData 
    }, { status: 400 });
  }

  const data = result.data;
  const db = drizzle(context.cloudflare.env.DB);

  // Create customer
  const newCustomer = await db.insert(customers).values({
    storeId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    notes: data.notes || null,
    status: 'active',
    segment: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();

  // Create address if provided
  if (data.address1 || data.city) {
    await db.insert(customerAddresses).values({
      customerId: newCustomer.id,
      address1: data.address1 || null,
      city: data.city || null,
      province: data.province || null,
      zip: data.zip || null,
      country: data.country || 'Bangladesh',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return redirect(`/app/customers/${newCustomer.id}`);
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function NewCustomerPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          to="/app/customers" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
        <PageHeader
          title="Add Customer"
          description="Create a new customer profile"
        />
      </div>

      <GlassCard className="p-6">
        <Form method="post" className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={actionData?.values?.name as string || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Customer name"
                  required
                />
                {actionData?.errors?.name && (
                  <p className="text-red-500 text-xs mt-1">{actionData.errors.name[0]}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-3 h-3 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={actionData?.values?.phone as string || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+880 1XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-3 h-3 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={actionData?.values?.email as string || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="customer@example.com"
              />
              {actionData?.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{actionData.errors.email[0]}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Address (Optional)
            </h3>
            
            <div>
              <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address1"
                id="address1"
                defaultValue={actionData?.values?.address1 as string || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="House #, Road #, Area"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  defaultValue={actionData?.values?.city as string || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Dhaka"
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="province"
                  id="province"
                  defaultValue={actionData?.values?.province as string || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Dhaka"
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="zip"
                  id="zip"
                  defaultValue={actionData?.values?.zip as string || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="1205"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  defaultValue={actionData?.values?.country as string || 'Bangladesh'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900">Notes</h3>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              defaultValue={actionData?.values?.notes as string || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Internal notes about this customer..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link to="/app/customers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Customer
                </>
              )}
            </Button>
          </div>
        </Form>
      </GlassCard>
    </div>
  );
}
