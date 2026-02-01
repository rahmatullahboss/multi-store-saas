import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerAddresses, createCustomerAddress, deleteCustomerAddress } from '~/services/customer-account.server';
import { Button } from '~/components/ui/button';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { Badge } from '~/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/Dialog";
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { useState } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

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
    
    // addressId is number in DB but string in FormData. parse it.
    await deleteCustomerAddress(parseInt(addressId.toString()), customerId, db);
    return json({ success: true });
  }

  if (intent === 'create') {
    const name = formData.get('name') as string; // Full name from form
    const phone = formData.get('phone') as string;
    const address1 = formData.get('addressLine1') as string; // Form uses 'addressLine1', DB uses 'address1'
    const city = formData.get('city') as string;
    const isDefault = formData.get('isDefault') === 'on';

    if (!name || !phone || !address1 || !city) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    await createCustomerAddress(customerId, {
      firstName,
      lastName,
      phone,
      address1,
      city,
      country: 'Bangladesh', // Default for now
      type: 'shipping',
      isDefault
    }, db);

    return json({ success: true });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function AccountAddresses() {
  const { addresses } = useLoaderData<typeof loader>();
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Addresses</h2>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses.
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>
                Add a new shipping address to your account.
              </DialogDescription>
            </DialogHeader>
            <fetcher.Form 
              method="post" 
              className="space-y-4 pt-4"
              onSubmit={() => setIsOpen(false)}
            >
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Receiver Name" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="addressLine1">Address</Label>
                <Input id="addressLine1" name="addressLine1" required placeholder="House, Street, Area" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">City / District</Label>
                <Input id="city" name="city" required placeholder="Dhaka" />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit">Save Address</Button>
              </div>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 relative">
            <div className="absolute right-4 top-4">
              <fetcher.Form method="post" onSubmit={(e) => {
                if (!confirm('Are you sure you want to delete this address?')) {
                  e.preventDefault();
                }
              }}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="addressId" value={address.id} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </fetcher.Form>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {/* Use firstName and lastName if name is not available directly, though I should check what getCustomerAddresses returns. 
                    It returns rows from customerAddresses table which has firstName, lastName.
                 */}
                <span className="font-semibold">{address.firstName} {address.lastName}</span>
                {address.isDefault && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground pl-6">{address.phone}</p>
              <div className="text-sm pl-6 mt-2">
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}{address.zip ? `, ${address.zip}` : ''}</p>
                <p>{address.country}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
