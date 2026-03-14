/**
 * Complete Profile Route
 * 
 * For Google OAuth users who need to complete their merchant profile
 * (add phone, store name, subdomain, category)
 */

import { useState, useRef, useEffect } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useFetcher, useLoaderData, Link } from 'react-router';
import { Store, Phone, Globe, ArrowRight } from 'lucide-react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users, products } from '@db/schema';
import { getUserId, completeGoogleUserProfile, createUserSession } from '~/services/auth.server';
import { useTranslation } from '~/contexts/LanguageContext';
import { completeProfileSchema } from '~/lib/validations/auth';

export const meta: MetaFunction = () => {
  return [{ title: 'প্রোফাইল সম্পূর্ণ করুন - Ozzyl' }];
};

// Business categories
const BUSINESS_CATEGORIES = [
  { id: 'fashion', key: 'categoryFashion', emoji: '👗' },
  { id: 'electronics', key: 'categoryElectronics', emoji: '📱' },
  { id: 'beauty', key: 'categoryBeauty', emoji: '💄' },
  { id: 'food', key: 'categoryFood', emoji: '🍔' },
  { id: 'home', key: 'categoryHome', emoji: '🏠' },
  { id: 'services', key: 'categoryServices', emoji: '🛠️' },
  { id: 'other', key: 'categoryOther', emoji: '📦' },
];

// Loader: Require auth, redirect if user already has store
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const userId = await getUserId(request, env);

  if (!userId) {
    return redirect('/auth/login');
  }

  const db = drizzle(env.DB);
  const user = await db
    .select({ id: users.id, name: users.name, email: users.email, storeId: users.storeId })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) {
    return redirect('/auth/login');
  }

  // If user already has a store, redirect to dashboard
  if (user.storeId) {
    return redirect('/app/orders');
  }

  return json({ user: { name: user.name, email: user.email } });
}

// Action: Create store and complete profile
export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const userId = await getUserId(request, env);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const phone = formData.get('phone') as string;
  const storeName = formData.get('storeName') as string;
  const rawSubdomain = formData.get('subdomain') as string;
  const category = formData.get('category') as string;

  // Clean subdomain
  const subdomain = rawSubdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30);

  // Validate with Zod
  const validation = completeProfileSchema.safeParse({
    phone,
    storeName,
    subdomain,
    category,
  });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return json({
      error: Object.values(errors).flat()[0] || 'Validation failed',
      fieldErrors: errors,
    }, { status: 400 });
  }

  // Complete the profile (creates store, updates user)
  const result = await completeGoogleUserProfile({
    userId,
    phone,
    storeName,
    subdomain,
    db: env.DB,
  });

  if (result.error || !result.storeId) {
    return json({ error: result.error || 'Failed to complete profile' }, { status: 400 });
  }

  // Create a sample product
  const db = drizzle(env.DB);
  try {
    await db.insert(products).values({
      storeId: result.storeId,
      title: 'Sample Product',
      description: 'This is a sample product. Edit or delete it from your dashboard.',
      price: 500,
      inventory: 100,
      isPublished: true,
    });
  } catch (e) {
    console.error('[complete-profile] Failed to create sample product:', e);
  }

  // Create session and redirect
  return createUserSession(userId, result.storeId, '/app/orders?onboarding=success', env);
}

export default function CompleteProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const fetcher = useFetcher<{ error?: string; fieldErrors?: Record<string, string[]> }>();
  
  const [formData, setFormData] = useState({
    phone: '',
    storeName: '',
    subdomain: '',
    category: 'fashion',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subdomainManuallyEdited, setSubdomainManuallyEdited] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate subdomain from store name
      if (field === 'storeName' && !subdomainManuallyEdited) {
        const autoSubdomain = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 20);
        updated.subdomain = autoSubdomain;
      }

      if (field === 'subdomain') {
        setSubdomainManuallyEdited(true);
      }

      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Handle fetcher response
  const lastData = useRef(fetcher.data);
  useEffect(() => {
    if (fetcher.data === lastData.current) return;
    lastData.current = fetcher.data;
    
    if (fetcher.data?.error) {
      if (fetcher.data.fieldErrors) {
        const newErrors: Record<string, string> = {};
        Object.entries(fetcher.data.fieldErrors).forEach(([key, msgs]) => {
          newErrors[key] = msgs[0];
        });
        setErrors(newErrors);
      } else {
        setErrors({ form: fetcher.data.error });
      }
    }
  }, [fetcher.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('phone', formData.phone);
    submitData.append('storeName', formData.storeName);
    submitData.append('subdomain', formData.subdomain);
    submitData.append('category', formData.category);
    
    fetcher.submit(submitData, { method: 'POST' });
  };

  const isSubmitting = fetcher.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <img src="/brand/logo-green.png" alt="Ozzyl" className="h-10 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">প্রোফাইল সম্পূর্ণ করুন</h1>
          <p className="text-gray-500 mt-2">
            স্বাগতম, <span className="font-medium text-emerald-600">{user.name || user.email}</span>! 
            আপনার স্টোর তৈরি করতে নিচের তথ্য দিন।
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                {errors.form}
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                মোবাইল নম্বর *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  updateField('phone', cleaned);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              <p className="text-xs text-gray-500 mt-1">বাংলাদেশী মোবাইল নম্বর (01 দিয়ে শুরু)</p>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Store className="inline w-4 h-4 mr-1" />
                স্টোরের নাম *
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => updateField('storeName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="আপনার স্টোরের নাম"
              />
              {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                স্টোর লিংক *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => {
                    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);
                    updateField('subdomain', cleaned);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="yourstore"
                />
                <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-xl text-gray-500 text-sm">
                  .ozzyl.com
                </span>
              </div>
              {errors.subdomain && <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                আপনি কী বিক্রি করেন?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {BUSINESS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateField('category', cat.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.category === cat.id
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">{cat.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{t(cat.key as any)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  স্টোর তৈরি করুন
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✓ ফ্রি প্ল্যানে শুরু করুন · ✓ পরে আপগ্রেড করতে পারবেন</p>
        </div>
      </div>
    </div>
  );
}
