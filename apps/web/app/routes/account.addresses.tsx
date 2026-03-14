import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useFetcher, useActionData, useNavigation, Form } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import {
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
} from '~/services/customer-account.server';
import { Button } from '~/components/ui/button';
import { Plus, Trash2, MapPin, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/Dialog';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { useState, useEffect } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';
import { useTranslation } from '~/contexts/LanguageContext';
import { toast } from 'sonner';


export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  const addresses = await getCustomerAddresses(customerId, db);

  return json({ addresses });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) return json({ error: 'Store not found' }, { status: 404 });

  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) return json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent');
  const db = drizzle(env.DB, { schema });

  if (intent === 'delete') {
    const addressId = formData.get('addressId');
    if (!addressId) return json({ error: 'Address ID required' }, { status: 400 });

    await deleteCustomerAddress(parseInt(addressId.toString()), customerId, db);
    return json({ success: true });
  }

  if (intent === 'create') {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address1 = formData.get('addressLine1') as string;
    const city = formData.get('city') as string;
    const state = (formData.get('state') as string) || null;
    const zip = (formData.get('zip') as string) || null;
    const isDefault = formData.get('isDefault') === 'on';

    if (!name || !phone || !address1 || !city) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    await createCustomerAddress(
      customerId,
      {
        firstName,
        lastName,
        phone,
        address1,
        city,
        province: state || undefined,
        zip: zip || undefined,
        country: 'Bangladesh',
        type: 'shipping',
        isDefault,
      },
      db
    );

    return json({ success: true });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

interface AddressCardProps {
  address: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    address1: string | null;
    address2?: string | null;
    city: string | null;
    province?: string | null;
    zip?: string | null;
    country: string | null;
    isDefault?: boolean | null;
  };
}


// Helper Card Component
function AddressCard({ address }: AddressCardProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();

  return (
     <div className="relative group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
       {/* Default Badge */}
       {address.isDefault && (
          <div className="absolute top-4 right-4 z-10">
             <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full border border-primary/20 flex items-center shadow-sm backdrop-blur-sm">
                <Check className="h-3 w-3 mr-1" />
                {t('default') || 'Default'}
             </span>
          </div>
       )}

       <div className="p-6 flex-1">
          <div className="flex items-start gap-4">
             <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                <MapPin className="h-5 w-5" />
             </div>

             <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-slate-900 mb-1">
                   {address.firstName} {address.lastName}
                </h4>
                <p className="text-sm text-slate-500 mb-4 font-medium">{address.phone}</p>

                <div className="space-y-1 text-sm text-slate-600 leading-relaxed">
                   <p>{address.address1}</p>
                   {address.address2 && <p>{address.address2}</p>}
                   <p>
                      {address.city}
                      {address.province ? `, ${address.province}` : ''}
                      {address.zip ? ` ${address.zip}` : ''}
                   </p>
                   <p className="font-medium text-slate-700 mt-1">{address.country}</p>
                </div>
             </div>
          </div>
       </div>

       {/* Actions Footer */}
       <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <fetcher.Form
             method="post"
             onSubmit={(e) => {
                if (!confirm(t('deleteAddressConfirm') || 'Are you sure you want to delete this address?')) {
                   e.preventDefault();
                }
             }}
          >
             <input type="hidden" name="intent" value="delete" />
             <input type="hidden" name="addressId" value={address.id} />
             <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-3 -ml-2 transition-colors"
                disabled={fetcher.state !== 'idle'}
             >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete') || 'Delete'}
             </Button>
          </fetcher.Form>
          
          {/* Default Status Indicator (if not default, maybe show 'Set Default' button, but logic for set default is not in action yet) */}
          {!address.isDefault && (
             <span className="text-xs text-slate-400 italic">Secondary Address</span>
          )}
       </div>
    </div>
  );
}

export default function AccountAddresses() {
  const { addresses } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    // Check if the action was successful by inspecting actionData
    // We cast actionData to any here because default type might be undefined or not match perfectly with our json return
    // In a stricter setup we'd define a type for the action return value
    const data = actionData as { success?: boolean; error?: string } | undefined;
    
    if (data?.success) {
      setIsDialogOpen(false);
      toast.success(t('addressSaved') || 'Address saved successfully');
    } else if (data?.error) {
       toast.error(data.error);
    }
  }, [actionData, t]);

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">{t('addressBook') || 'Address Book'}</h1>
           <p className="text-slate-500 mt-2 text-lg">
             {t('addressesSubtitle') || 'Manage your shipping and billing addresses.'}
           </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
           <Plus className="w-4 h-4 mr-2" />
           {t('addNewAddress') || 'Add New Address'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add New Address Card (Visual Helper) */}
        <button 
           onClick={() => setIsDialogOpen(true)}
           className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group min-h-[280px]"
        >
           <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-md transition-all border border-slate-100">
              <Plus className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
           </div>
           <span className="font-bold text-lg">{t('addNewAddress') || 'Add New Address'}</span>
           <span className="text-sm mt-2 opacity-70">Add a new delivery location</span>
        </button>

        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl p-0 overflow-hidden gap-0 border-0 shadow-2xl">
          <div className="p-6 bg-slate-50 border-b border-slate-100">
             <DialogHeader>
               <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                 <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-5 h-5 text-primary" />
                 </div>
                 {t('addNewAddress') || 'Add New Address'}
               </DialogTitle>
               <DialogDescription className="text-slate-500 ml-12">
                 {t('addAddressDescription') || 'Enter your delivery details below.'}
               </DialogDescription>
             </DialogHeader>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <Form method="post" className="space-y-5">
               <input type="hidden" name="intent" value="create" />
               
               <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                     <Label htmlFor="firstName" className="text-slate-700 font-medium">{t('firstName') || 'First Name'}</Label>
                     <Input id="firstName" name="name" required className="bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 h-11" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="phone" className="text-slate-700 font-medium">{t('phone') || 'Phone'}</Label>
                     <Input id="phone" name="phone" required type="tel" className="bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 h-11" placeholder="+123..." />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-slate-700 font-medium">{t('address') || 'Address Line 1'}</Label>
                  <Input id="addressLine1" name="addressLine1" required className="bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 h-11" placeholder="Street address, P.O. box, etc." />
               </div>

               <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                     <Label htmlFor="city" className="text-slate-700 font-medium">{t('city') || 'City'}</Label>
                     <Input id="city" name="city" required className="bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 h-11" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="state" className="text-slate-700 font-medium">{t('state') || 'State/Province'}</Label>
                     <Input id="state" name="state" className="bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 h-11" />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="zip" className="text-slate-700 font-medium">
                     {t('postalCode') || 'Postal Code'}
                     <span className="ml-1 text-xs text-slate-400 font-normal">({t('optional') || 'optional'})</span>
                  </Label>
                  <Input
                     id="zip"
                     name="zip"
                     maxLength={10}
                     inputMode="numeric"
                     className="bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                     placeholder="e.g. 1207"
                  />
                  <p className="text-xs text-slate-400">{t('postalCodeHint') || 'Adding a postal code improves delivery accuracy.'}</p>
               </div>
               
               <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center h-5">
                    <input
                      id="isDefault"
                      name="isDefault"
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isDefault" className="font-medium text-slate-900 cursor-pointer">Set as default address</label>
                    <p className="text-slate-500">Use this address for shipping updates.</p>
                  </div>
               </div>

               <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-200"
                  >
                    {t('cancel') || 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary text-white hover:bg-primary/90 px-8">
                     {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('saving') || 'Saving...'}
                        </>
                     ) : (
                        t('saveAddress') || 'Save Address'
                     )}
                  </Button>
               </div>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
