import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getStoreId } from '~/services/auth.server';
import { Save } from 'lucide-react';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB, { schema });

  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId)
  });

  return json({ agent });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
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
  const isSaving = navigation.state === 'submitting';

  const settings = agent?.agentSettings ? JSON.parse(agent.agentSettings) : {};

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Agent Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Customize how your AI assistant behaves and interacts with customers.</p>
        </div>
        
        <Form method="post" className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <label className="font-medium text-gray-900">Agent Status</label>
                    <p className="text-sm text-gray-500">Enable or disable the AI assistant on your store</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input 
                    type="text" 
                    name="name" 
                    defaultValue={agent?.name || 'Sales Assistant'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Tone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Communication Tone</label>
                    <select 
                        name="tone"
                        defaultValue={settings.tone || 'friendly'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="friendly">Friendly & Casual 😊</option>
                        <option value="formal">Professional & Formal</option>
                        <option value="urgent">Direct & Sales-focused</option>
                    </select>
                </div>

                {/* Language */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Language</label>
                    <select 
                        name="language"
                        defaultValue={settings.language || 'bn'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="en">English</option>
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
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {actionData?.success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm text-center">
                    Settings saved successfully!
                </div>
            )}
        </Form>
      </div>
    </div>
  );
}
