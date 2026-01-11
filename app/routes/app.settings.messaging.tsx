import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useFormAction, Form, useNavigation } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import { getStoreId } from "~/services/auth.server";
import { CheckCircle, MessageSquare, Facebook, Smartphone } from "lucide-react";
import { useEffect } from "react";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as any;
  const storeId = await getStoreId(request, env);
  
  if (!storeId) return redirect("/auth/login");

  const db = drizzle(env.DB, { schema });

  // Fetch Agent Settings
  let agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId),
  });

  // If no agent exists, create one (auto-provisioning for existing stores)
  if (!agent) {
    const store = await db.query.stores.findFirst({
        where: eq(schema.stores.id, storeId),
    });
    
    if (store) {
        const result = await db.insert(schema.agents).values({
            storeId,
            name: store.name + " Assistant",
            isActive: true,
            enabledChannels: JSON.stringify(['web']),
        }).returning();
        agent = result[0];
    }
  }

  return json({ agent });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env as any;
  const storeId = await getStoreId(request, env);
  
  if (!storeId) return redirect("/auth/login");

  const db = drizzle(env.DB, { schema });
  const formData = await request.formData();
  
  const whatsappPhoneId = formData.get("whatsappPhoneId") as string;
  const messengerPageId = formData.get("messengerPageId") as string;
  const enableWhatsapp = formData.get("enableWhatsapp") === "on";
  const enableMessenger = formData.get("enableMessenger") === "on";

  // Update Agent
  await db.update(schema.agents)
    .set({
      whatsappPhoneId,
      messengerPageId,
      enabledChannels: JSON.stringify([
        'web', 
        ...(enableWhatsapp ? ['whatsapp'] : []),
        ...(enableMessenger ? ['messenger'] : [])
      ]),
      updatedAt: new Date(),
    })
    .where(eq(schema.agents.storeId, storeId));

  return json({ success: true });
}

export default function MessagingSettings() {
  const { agent } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  const enabledChannels = agent?.enabledChannels ? JSON.parse(agent.enabledChannels) : ['web'];

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Messaging Settings</h1>
        <p className="text-gray-500 mt-2">
          Connect your store with WhatsApp and Facebook Messenger to automate customer support.
        </p>
      </div>

      <Form method="post" className="space-y-6">
        
        {/* WhatsApp Integration */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">WhatsApp Business API</h2>
            </div>
            <p className="text-sm text-gray-500">
              Connect your WhatsApp Business account to send order updates and reply to customers automatically.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="enableWhatsapp" 
                name="enableWhatsapp" 
                defaultChecked={enabledChannels.includes('whatsapp')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="enableWhatsapp" className="text-sm font-medium text-gray-700">Enable WhatsApp Integration</label>
            </div>

            <div className="grid gap-2">
              <label htmlFor="whatsappPhoneId" className="text-sm font-medium text-gray-700">WhatsApp Phone Number ID</label>
              <input 
                type="text"
                id="whatsappPhoneId" 
                name="whatsappPhoneId" 
                defaultValue={agent?.whatsappPhoneId || ""} 
                placeholder="Ex: 1045267..."
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Found in your Meta Developer Dashboard under WhatsApp {">"} API Setup.
              </p>
            </div>
          </div>
        </div>

        {/* Facebook Messenger Integration */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Facebook className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Facebook Messenger</h2>
            </div>
            <p className="text-sm text-gray-500">
              Connect your Facebook Page to handle inquiries directly from Messenger.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="enableMessenger" 
                name="enableMessenger" 
                defaultChecked={enabledChannels.includes('messenger')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="enableMessenger" className="text-sm font-medium text-gray-700">Enable Messenger Integration</label>
            </div>

            <div className="grid gap-2">
              <label htmlFor="messengerPageId" className="text-sm font-medium text-gray-700">Facebook Page ID</label>
              <input 
                type="text"
                id="messengerPageId" 
                name="messengerPageId" 
                defaultValue={agent?.messengerPageId || ""} 
                placeholder="Ex: 102348..."
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Found in your Facebook Page's "About" section.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </Form>
    </div>
  );
}
