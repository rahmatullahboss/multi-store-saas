import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Form, useActionData, useNavigation } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerProfile, updateCustomerProfile } from '~/services/customer-account.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { Loader2, User, Mail, Phone, Save } from 'lucide-react';
import { z } from 'zod';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });
  
  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  const profile = await getCustomerProfile(customerId, storeId, db);

  if (!profile) {
    throw new Response('Profile not found', { status: 404 });
  }

  return json({ profile });
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) return json({ error: 'Store not found' }, { status: 404 });
  
  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) return json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const payload = Object.fromEntries(formData);

  const result = profileSchema.safeParse(payload);

  if (!result.success) {
    return json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const updateResult = await updateCustomerProfile(customerId, storeId, result.data, drizzle(env.DB, { schema }));

  if (!updateResult.success) {
    return json({ error: updateResult.error }, { status: 400 });
  }

  return json({ success: true });
}

export default function AccountProfile() {
  const { profile: user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      toast.success("Profile updated successfully");
    } else if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('myProfile') || 'Personal Profile'}</h1>
        <p className="text-slate-500 mt-2 text-lg">
          {t('profileSubtitle') || 'Manage your personal information and account security.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Profile Header Background */}
        <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
             <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center text-slate-300 relative group">
                <User className="w-16 h-16" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                </div>
             </div>
             <div className="text-center md:text-left flex-1 pb-2">
               <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
               <p className="text-slate-500">{user.email}</p>
             </div>
             <div className="pb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {user.loyaltyTier || 'Member'} Status
                </span>
             </div>
          </div>

          <Form method="post" className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  {t('fullName') || 'Full Name'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ''}
                    className="pl-10 h-11 border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50"
                  />
                </div>
                {actionData && 'error' in actionData && (
                  <p className="text-sm text-red-500">{actionData.error}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  {t('phoneNumber') || 'Phone Number'}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={user.phone || ''}
                    className="pl-10 h-11 border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  {t('emailAddress') || 'Email Address'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ''}
                    className="pl-10 h-11 border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white min-w-[120px] shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveChanges') || 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
