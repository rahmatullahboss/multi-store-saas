import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import { requireTenant } from "~/lib/tenant-guard.server";
import { Facebook, Smartphone, ArrowLeft } from "lucide-react";
import { useTranslation } from "~/contexts/LanguageContext";
import { useEffect, useRef } from "react";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB, { schema });

  // Fetch Agent Settings
  let agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId),
  });

  // NOTE: Loader performs an INSERT only if no agent row exists yet.
  // This is intentional one-time auto-provisioning for stores that were created
  // before the agents table was introduced. The existence check prevents
  // repeated writes on subsequent requests, making this safe in a GET handler.
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
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB, { schema });
  const formData = await request.formData();
  
  const whatsappPhoneId = formData.get("whatsappPhoneId") as string;
  const messengerPageId = formData.get("messengerPageId") as string;
  const enableWhatsapp = formData.get("enableWhatsapp") === "on";
  const enableMessenger = formData.get("enableMessenger") === "on";

  const enabledChannels = [
    'web',
    ...(enableWhatsapp ? ['whatsapp'] : []),
    ...(enableMessenger ? ['messenger'] : []),
  ];

  const existingAgent = await db.select({ id: schema.agents.id })
    .from(schema.agents)
    .where(eq(schema.agents.storeId, storeId))
    .limit(1);

  if (existingAgent.length > 0) {
    await db.update(schema.agents)
      .set({
        whatsappPhoneId,
        messengerPageId,
        enabledChannels: JSON.stringify(enabledChannels),
        updatedAt: new Date(),
      })
      .where(eq(schema.agents.storeId, storeId));
  } else {
    await db.insert(schema.agents).values({
      storeId,
      name: 'Assistant',
      whatsappPhoneId: whatsappPhoneId || '',
      messengerPageId: messengerPageId || '',
      enabledChannels: JSON.stringify(enabledChannels),
    });
  }

  return json({ success: true });
}

export default function MessagingSettings() {
  const { agent } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const { t } = useTranslation();
  const isSaving = navigation.state === "submitting";
  const mobileFormRef = useRef<HTMLFormElement>(null);
  const desktopFormRef = useRef<HTMLFormElement>(null);

  const enabledChannels = agent?.enabledChannels ? JSON.parse(agent.enabledChannels) : ['web'];

  // Reset both forms after successful save
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      mobileFormRef.current?.reset();
      desktopFormRef.current?.reset();
    }
  }, [actionData]);

  // Shared form content to avoid duplication
  const WhatsAppSection = ({ idPrefix = "" }: { idPrefix?: string }) => (
    <>
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox"
          name="enableWhatsapp" 
          defaultChecked={enabledChannels.includes('whatsapp')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">{t('settings:messaging.enableWhatsapp')}</span>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">{t('settings:messaging.whatsappPhoneId')}</label>
        <input 
          type="text"
          name="whatsappPhoneId" 
          defaultValue={agent?.whatsappPhoneId || ""} 
          placeholder={t('settings:messaging.whatsappPhoneIdPlaceholder')}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          {t('settings:messaging.whatsappPhoneIdHelp')}
        </p>
      </div>
    </>
  );

  const MessengerSection = ({ idPrefix = "" }: { idPrefix?: string }) => (
    <>
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox"
          name="enableMessenger" 
          defaultChecked={enabledChannels.includes('messenger')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">{t('settings:messaging.enableMessenger')}</span>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">{t('settings:messaging.facebookPageId')}</label>
        <input 
          type="text"
          name="messengerPageId" 
          defaultValue={agent?.messengerPageId || ""} 
          placeholder={t('settings:messaging.facebookPageIdPlaceholder')}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          {t('settings:messaging.facebookPageIdHelp')}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-[60px] px-4">
            <Link to="/app/settings" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{t('settings:messaging.title')}</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-col gap-5 p-4 pb-32">
          {/* WhatsApp Section */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{t('settings:messaging.whatsappBusinessTitle')}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">{t('settings:messaging.whatsappApiTitle')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t('settings:messaging.whatsappDescription')}
                </p>
              </div>
              {/* Single form wraps BOTH sections so all fields are submitted together */}
              <Form method="post" id="messaging-form-mobile" ref={mobileFormRef} className="p-4 space-y-4">
                <WhatsAppSection />
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{t('settings:messaging.messengerTitle')}</span>
                  </div>
                  <MessengerSection />
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
          {actionData && 'success' in actionData && actionData.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-2">
              {t('settingsSaved')}
            </div>
          )}
          {actionData && 'error' in actionData && !!actionData.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-2">
              {String(actionData.error)}
            </div>
          )}
          <button
            type="submit"
            form="messaging-form-mobile"
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition disabled:opacity-50"
          >
            {isSaving ? t('settings:messaging.saving') : t('settings:messaging.save')}
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Link 
              to="/app/settings" 
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('settings:messaging.pageTitle')}</h1>
              <p className="text-gray-500 mt-1">
                {t('settings:messaging.pageSubtitle')}
              </p>
            </div>
          </div>

          <Form method="post" ref={desktopFormRef} className="space-y-6">
            
            {/* WhatsApp Integration */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="h-6 w-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('settings:messaging.whatsappApiTitle')}</h2>
                </div>
                <p className="text-sm text-gray-500">
                  {t('settings:messaging.connectWhatsappDesc')}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <WhatsAppSection />
              </div>
            </div>

            {/* Facebook Messenger Integration */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('settings:messaging.messengerTitle')}</h2>
                </div>
                <p className="text-sm text-gray-500">
                  {t('settings:messaging.messengerDescription')}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <MessengerSection />
              </div>
            </div>

            <div className="flex justify-end flex-col items-end gap-2">
              {actionData && 'success' in actionData && actionData.success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {t('settingsSaved')}
                </div>
              )}
              {actionData && 'error' in actionData && !!actionData.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {String(actionData.error)}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2"
              >
                {isSaving ? t('settings:messaging.saving') : t('settings:messaging.save')}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
