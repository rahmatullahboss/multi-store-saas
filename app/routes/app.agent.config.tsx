import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getStoreId } from '~/services/auth.server';
import { Save } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response("Unauthorized", { status: 401 });
  const db = drizzle(context.cloudflare.env.DB, { schema });

  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId)
  });

  return json({ agent });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) return json({ error: 'Unauthorized' }, { status: 401 });

  const db = drizzle(context.cloudflare.env.DB, { schema });
  const formData = await request.formData();
  
  const name = formData.get('name') as string;
  const tone = formData.get('tone') as string;
  const language = formData.get('language') as string;
  const isActive = formData.get('isActive') === 'on';

  // Construct settings JSON
  const agentSettings = JSON.stringify({
    tone,
    language
  });

  try {
    const existingAgent = await db.query.agents.findFirst({
      where: eq(schema.agents.storeId, storeId)
    });

    if (existingAgent) {
        await db.update(schema.agents)
            .set({ name, agentSettings, isActive, updatedAt: new Date() })
            .where(eq(schema.agents.id, existingAgent.id));
    } else {
        await db.insert(schema.agents).values({
            storeId,
            name,
            type: 'ecommerce',
            agentSettings,
            isActive
        });
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }
};

export default function AgentConfig() {
  const { agent } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isSaving = navigation.state === 'submitting';

  const settings = agent?.agentSettings ? JSON.parse(agent.agentSettings) : {};

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">{t('agentConfiguration')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('agentConfigDesc')}</p>
        </div>
        
        <Form method="post" className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <label className="font-medium text-gray-900">{t('agentStatus')}</label>
                    <p className="text-sm text-gray-500">{t('agentStatusDesc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        name="isActive" 
                        className="sr-only peer" 
                        defaultChecked={agent?.isActive ?? true}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>

            {/* Basic Info */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('agentName')}</label>
                <input 
                    type="text" 
                    name="name" 
                    defaultValue={agent?.name || t('defaultAgentName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Tone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('communicationTone')}</label>
                    <select 
                        name="tone"
                        defaultValue={settings.tone || 'friendly'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="friendly">{t('friendlyCasual')}</option>
                        <option value="formal">{t('professionalFormal')}</option>
                        <option value="urgent">{t('directSales')}</option>
                    </select>
                </div>

                {/* Language */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('primaryLanguage')}</label>
                    <select 
                        name="language"
                        defaultValue={settings.language || 'bn'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="bn">{t('bengali')}</option>
                        <option value="en">{t('english')}</option>
                        {/* <option value="banglish">Banglish</option> */}
                    </select>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? t('saving') : t('saveConfiguration')}
                </button>
            </div>

            {actionData && 'success' in actionData && actionData.success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm text-center">
                    {t('settingsSaved')}
                </div>
            )}
        </Form>
      </div>
    </div>
  );
}
