/**
 * Shipping Zones Management
 * 
 * Route: /app/settings/shipping
 * 
 * Manage delivery zones with rates and free shipping thresholds.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { shippingZones, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  Loader2,
  MapPin 
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Shipping Zones - Settings' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const zones = await db
    .select()
    .from(shippingZones)
    .where(eq(shippingZones.storeId, storeId));

  const store = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return json({
    zones,
    currency: store[0]?.currency || 'BDT',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'create' || intent === 'update') {
    const id = formData.get('id') ? parseInt(formData.get('id') as string) : null;
    const name = formData.get('name') as string;
    const rate = parseFloat(formData.get('rate') as string) || 0;
    const freeAbove = formData.get('freeAbove') ? parseFloat(formData.get('freeAbove') as string) : null;
    const estimatedDays = formData.get('estimatedDays') as string;
    const regions = formData.get('regions') as string;

    if (!name) {
      return json({ error: 'Zone name is required' }, { status: 400 });
    }

    if (id) {
      // Update
      await db
        .update(shippingZones)
        .set({
          name,
          rate,
          freeAbove,
          estimatedDays: estimatedDays || null,
          regions: regions || null,
        })
        .where(eq(shippingZones.id, id));
    } else {
      // Create
      await db.insert(shippingZones).values({
        storeId,
        name,
        rate,
        freeAbove,
        estimatedDays: estimatedDays || null,
        regions: regions || null,
      });
    }

    return json({ success: true });
  }

  if (intent === 'delete') {
    const id = parseInt(formData.get('id') as string);
    await db.delete(shippingZones).where(eq(shippingZones.id, id));
    return json({ success: true });
  }

  return json({ error: 'Unknown intent' }, { status: 400 });
}

export default function ShippingZonesPage() {
  const { zones, currency } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<typeof zones[0] | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (zone: typeof zones[0]) => {
    setEditingZone(zone);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingZone(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/app/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
            <p className="text-gray-600">Set up delivery areas and rates</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Zone
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingZone ? 'Edit Zone' : 'New Shipping Zone'}
          </h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value={editingZone ? 'update' : 'create'} />
            {editingZone && <input type="hidden" name="id" value={editingZone.id} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingZone?.name || ''}
                  placeholder="e.g., Dhaka City"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Rate ({currency})
                </label>
                <input
                  type="number"
                  name="rate"
                  defaultValue={editingZone?.rate || ''}
                  placeholder="60"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Above ({currency})
                </label>
                <input
                  type="number"
                  name="freeAbove"
                  defaultValue={editingZone?.freeAbove || ''}
                  placeholder="1000 (optional)"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  name="estimatedDays"
                  defaultValue={editingZone?.estimatedDays || ''}
                  placeholder="2-3 days"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regions/Districts (comma separated)
              </label>
              <input
                type="text"
                name="regions"
                defaultValue={editingZone?.regions || ''}
                placeholder="Dhaka, Gazipur, Narayanganj"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Zones List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {zones.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {zones.map((zone) => (
              <div key={zone.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {zone.rate === 0 ? 'Free' : formatPrice(zone.rate)}
                      </span>
                      {zone.freeAbove && (
                        <span>Free above {formatPrice(zone.freeAbove)}</span>
                      )}
                      {zone.estimatedDays && (
                        <span>{zone.estimatedDays}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={zone.id} />
                    <button
                      type="submit"
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                      onClick={(e) => {
                        if (!confirm('Delete this zone?')) e.preventDefault();
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No shipping zones yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-emerald-600 hover:underline"
            >
              Add your first zone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
