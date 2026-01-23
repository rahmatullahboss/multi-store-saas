/**
 * Email Automations List Page
 * 
 * Admin UI to view and manage email automation workflows.
 * Route: /app/automations
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { emailAutomations, emailAutomationSteps } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { Plus, Mail, Trash2, Edit2, Play, Pause, Clock, ShoppingCart, UserPlus, Package, TrendingUp } from 'lucide-react';

const TRIGGER_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  order_placed: { label: 'অর্ডার সম্পন্ন', icon: <ShoppingCart size={16} />, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  cart_abandoned: { label: 'কার্ট পরিত্যক্ত', icon: <Clock size={16} />, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  signup: { label: 'সাইনআপ', icon: <UserPlus size={16} />, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  order_delivered: { label: 'ডেলিভারি সম্পন্ন', icon: <Package size={16} />, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch all automations with step count
  const automations = await db
    .select()
    .from(emailAutomations)
    .where(eq(emailAutomations.storeId, storeId))
    .orderBy(desc(emailAutomations.createdAt));

  // Get step counts
  const automationsWithSteps = await Promise.all(
    automations.map(async (automation) => {
      const steps = await db
        .select()
        .from(emailAutomationSteps)
        .where(eq(emailAutomationSteps.automationId, automation.id));
      
      return {
        ...automation,
        stepCount: steps.length,
        steps: steps,
      };
    })
  );

  return json({ automations: automationsWithSteps });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');
  const id = Number(formData.get('id'));

  if (intent === 'toggle') {
    const isActive = formData.get('isActive') === 'true';
    await db.update(emailAutomations)
      .set({ isActive: !isActive })
      .where(and(eq(emailAutomations.id, id), eq(emailAutomations.storeId, storeId)));
    return json({ success: true });
  }

  if (intent === 'delete') {
    await db.delete(emailAutomations)
      .where(and(eq(emailAutomations.id, id), eq(emailAutomations.storeId, storeId)));
    return json({ success: true });
  }

  return json({ success: false });
}

export default function AutomationsPage() {
  const { automations } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📧 ইমেইল অটোমেশন
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            অটোমেটিক ইমেইল সিকোয়েন্স সেটআপ করুন
          </p>
        </div>
        <Link
          to="/app/automations/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          <Plus size={20} />
          নতুন অটোমেশন
        </Link>
      </div>

      {/* Stats */}
      {automations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট অটোমেশন</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{automations.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">সক্রিয়</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {automations.filter(a => a.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট ইমেইল পাঠানো</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {automations.reduce((sum, a) => sum + (a.totalSent || 0), 0)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট ওপেন</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {automations.reduce((sum, a) => sum + (a.totalOpened || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {/* Automations List */}
      {automations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            এখনো কোন অটোমেশন নেই
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            অটোমেটিক ইমেইল সেটআপ করে কাস্টমার এনগেজমেন্ট বাড়ান!
          </p>
          <Link
            to="/app/automations/new"
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <Plus size={18} />
            প্রথম অটোমেশন তৈরি করুন
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map(automation => {
            const triggerInfo = TRIGGER_LABELS[automation.trigger] || { 
              label: automation.trigger, 
              icon: <Mail size={16} />, 
              color: 'text-gray-600 bg-gray-100' 
            };
            
            return (
              <div
                key={automation.id}
                className={`p-5 bg-white dark:bg-gray-800 rounded-xl border transition ${
                  automation.isActive
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${triggerInfo.color}`}>
                        {triggerInfo.icon}
                        {triggerInfo.label}
                      </span>
                      {!automation.isActive && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          নিষ্ক্রিয়
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {automation.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{automation.stepCount} স্টেপ</span>
                      <span>•</span>
                      <span>{automation.totalSent || 0} ইমেইল পাঠানো</span>
                      {automation.totalOpened && automation.totalSent && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {((automation.totalOpened / automation.totalSent) * 100).toFixed(0)}% ওপেন রেট
                          </span>
                        </>
                      )}
                    </div>

                    {/* Steps Preview */}
                    {automation.steps && automation.steps.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {automation.steps.slice(0, 3).map((step, idx) => (
                          <span
                            key={step.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                          >
                            <Clock size={12} />
                            {step.delayMinutes === 0 ? 'তাৎক্ষণিক' : `${step.delayMinutes} মিনিট পর`}
                          </span>
                        ))}
                        {automation.steps.length > 3 && (
                          <span className="text-xs text-gray-400">+{automation.steps.length - 3} আরো</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Form method="post">
                      <input type="hidden" name="intent" value="toggle" />
                      <input type="hidden" name="id" value={automation.id} />
                      <input type="hidden" name="isActive" value={String(automation.isActive)} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                          automation.isActive
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {automation.isActive ? <Pause size={14} /> : <Play size={14} />}
                        {automation.isActive ? 'বন্ধ' : 'চালু'}
                      </button>
                    </Form>

                    <Link
                      to={`/app/automations/${automation.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-sm"
                    >
                      <Edit2 size={14} /> এডিট
                    </Link>

                    <Form method="post" onSubmit={(e) => {
                      if (!confirm('এই অটোমেশন ডিলিট করতে চান?')) e.preventDefault();
                    }}>
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={automation.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 ইমেইল অটোমেশন কিভাবে কাজ করে?</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• <strong>অর্ডার সম্পন্ন:</strong> অর্ডার প্লেস হলে অটোমেটিক ইমেইল</li>
          <li>• <strong>কার্ট পরিত্যক্ত:</strong> কার্টে পণ্য রেখে গেলে রিমাইন্ডার</li>
          <li>• <strong>সাইনআপ:</strong> নতুন ইউজার জয়েন করলে ওয়েলকাম ইমেইল</li>
          <li>• <strong>ডেলিভারি:</strong> অর্ডার ডেলিভারি হলে ফিডব্যাক রিকোয়েস্ট</li>
        </ul>
      </div>
    </div>
  );
}
