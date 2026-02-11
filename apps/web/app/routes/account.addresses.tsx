import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import {
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
} from '~/services/customer-account.server';
import { Button } from '~/components/ui/button';
import { Plus, Trash2, MapPin, Home, Building2, Check, ArrowRight } from 'lucide-react';
import { Badge } from '~/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { useState } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';
import { useTranslation } from '~/contexts/LanguageContext';
import { cn } from '~/lib/utils';

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
    zip?: string | null;
    country: string | null;
    isDefault?: boolean | null;
  };
  onDelete: () => void;
}

function AddressCard({ address, onDelete }: AddressCardProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();

  return (
    <div className="relative group rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Default Badge */}
      {address.isDefault && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <Check className="h-3 w-3 mr-1" />
            {t('defaultAddressLabel')}
          </Badge>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg mb-1">
              {address.firstName} {address.lastName}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">{address.phone}</p>

            <div className="space-y-1 text-sm">
              <p className="text-foreground">{address.address1}</p>
              {address.address2 && <p className="text-muted-foreground">{address.address2}</p>}
              <p className="text-muted-foreground">
                {address.city}
                {address.zip ? `, ${address.zip}` : ''}
              </p>
              <p className="text-muted-foreground">{address.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
        <fetcher.Form
          method="post"
          onSubmit={(e) => {
            if (!confirm(t('deleteAddressConfirm'))) {
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
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('deleteAddress')}
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}

export default function AccountAddresses() {
  const { addresses } = useLoaderData<typeof loader>();
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('manageAddresses')}</h1>
          <p className="text-muted-foreground mt-1">{t('manageAddressesDesc')}</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              {t('addNewAddress')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                {t('addNewAddress')}
              </DialogTitle>
              <DialogDescription>{t('manageAddressesDesc')}</DialogDescription>
            </DialogHeader>
            <fetcher.Form
              method="post"
              className="space-y-5 pt-4"
              onSubmit={() => setIsOpen(false)}
            >
              <input type="hidden" name="intent" value="create" />

              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('fullNameLabel')}</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder={t('fullNameLabel')}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">{t('phoneNumberLabel')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="01XXXXXXXXX"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="addressLine1">{t('addressLine1Label')}</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    required
                    placeholder={t('addressLine1Label')}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">{t('cityDistrict')}</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder="Dhaka"
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                    {t('setAsDefault')}
                  </Label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  {t('cancelAddress')}
                </Button>
                <Button type="submit" className="flex-1 rounded-xl">
                  {t('saveAddress')}
                </Button>
              </div>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-dashed">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('noAddresses')}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('noAddressesDesc')}</p>
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addNewAddress')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} onDelete={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
