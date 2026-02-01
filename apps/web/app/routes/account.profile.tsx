import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Form, useActionData, useNavigation } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerProfile, updateCustomerProfile } from '~/services/customer-account.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

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
  const { profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      toast.success("Profile updated successfully");
    } else if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
        <p className="text-muted-foreground">
          Update your personal information.
        </p>
      </div>

      <Form method="post" className="space-y-6" ref={formRef}>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={profile.name || ''} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            defaultValue={profile.email || ''} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            name="phone" 
            type="tel" 
            defaultValue={profile.phone || ''} 
            placeholder="+880..."
          />
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
}
