/**
 * Create New Email Automation Page
 * 
 * Admin UI to create email automation workflows with steps.
 * Route: /app/automations/new
 */

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { emailAutomations, emailAutomationSteps } from '@db/schema';
import { eq } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, Mail, ShoppingCart, UserPlus, Package, Wand2 } from 'lucide-react';

// Trigger types (shared between server and client)
type EmailTrigger = 'order_placed' | 'cart_abandoned' | 'signup' | 'order_delivered';

// Default email templates (client-side for template button)
const EMAIL_TEMPLATES: Record<EmailTrigger, { subject: string; content: string }> = {
  order_placed: {
    subject: '🎉 আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!',
    content: `<h2>ধন্যবাদ {{customer_name}}!</h2>
<p>আপনার অর্ডার #{{order_number}} সফলভাবে গ্রহণ করা হয়েছে।</p>
<p>মোট: {{total}}</p>
<p>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>`,
  },
  cart_abandoned: {
    subject: '🛒 আপনার কার্টে পণ্য অপেক্ষা করছে!',
    content: `<h2>হ্যালো {{customer_name}}!</h2>
<p>আপনি কিছু দারুণ পণ্য বাছাই করেছিলেন কিন্তু অর্ডার সম্পন্ন করেননি।</p>
<p>এখনই ফিরে এসে অর্ডার দিন!</p>`,
  },
  signup: {
    subject: '🙏 স্বাগতম! আমাদের সাথে যুক্ত হওয়ার জন্য ধন্যবাদ',
    content: `<h2>স্বাগতম {{customer_name}}!</h2>
<p>আমাদের সাথে যুক্ত হওয়ার জন্য আপনাকে ধন্যবাদ।</p>
<p>আমাদের স্টোরে দারুণ সব পণ্য দেখুন!</p>`,
  },
  order_delivered: {
    subject: '📦 আপনার অর্ডার ডেলিভারি হয়েছে!',
    content: `<h2>শুভ সংবাদ {{customer_name}}!</h2>
<p>আপনার অর্ডার #{{order_number}} সফলভাবে ডেলিভারি হয়েছে।</p>
<p>আশা করি পণ্যটি আপনার পছন্দ হয়েছে!</p>`,
  },
};

const TRIGGERS: { value: EmailTrigger; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'order_placed', label: 'অর্ডার সম্পন্ন', icon: <ShoppingCart size={20} />, description: 'যখন কাস্টমার অর্ডার প্লেস করে' },
  { value: 'cart_abandoned', label: 'কার্ট পরিত্যক্ত', icon: <Clock size={20} />, description: 'যখন কার্টে পণ্য রেখে চলে যায়' },
  { value: 'signup', label: 'সাইনআপ', icon: <UserPlus size={20} />, description: 'যখন নতুন ইউজার রেজিস্টার করে' },
  { value: 'order_delivered', label: 'ডেলিভারি সম্পন্ন', icon: <Package size={20} />, description: 'যখন অর্ডার ডেলিভারি হয়' },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'orders',
  });
  return json({ storeId });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'orders',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();

  const name = formData.get('name') as string;
  const trigger = formData.get('trigger') as EmailTrigger;

  // Step arrays
  const delays = formData.getAll('delay') as string[];
  const subjects = formData.getAll('subject') as string[];
  const contents = formData.getAll('content') as string[];

  if (!name || !trigger || subjects.length === 0) {
    return json({ success: false, error: 'নাম, ট্রিগার এবং কমপক্ষে ১টি স্টেপ প্রয়োজন' }, { status: 400 });
  }

  // Create automation
  const result = await db.insert(emailAutomations).values({
    storeId,
    name,
    trigger,
    isActive: true,
  }).returning({ id: emailAutomations.id });

  const automationId = result[0].id;

  // Create steps
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].trim()) {
      await db.insert(emailAutomationSteps).values({
        automationId,
        delayMinutes: Number(delays[i]) || 0,
        subject: subjects[i],
        content: contents[i] || '',
        stepOrder: i,
      });
    }
  }

  return redirect('/app/automations');
}

export default function NewAutomationPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [selectedTrigger, setSelectedTrigger] = useState<EmailTrigger>('order_placed');
  const [steps, setSteps] = useState([{ delay: 0, subject: '', content: '' }]);

  const addStep = () => {
    setSteps([...steps, { delay: 60, subject: '', content: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: string, value: string | number) => {
    setSteps(steps.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    ));
  };

  const applyTemplate = (index: number) => {
    const template = EMAIL_TEMPLATES[selectedTrigger];
    updateStep(index, 'subject', template.subject);
    updateStep(index, 'content', template.content);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/app/automations"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          ফিরে যান
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          📧 নতুন ইমেইল অটোমেশন
        </h1>
        <p className="text-gray-600 mt-1">
          অটোমেটিক ইমেইল সিকোয়েন্স সেটআপ করুন
        </p>
      </div>

      <Form method="post" className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">অটোমেশন তথ্য</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              অটোমেশন নাম *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="যেমন: অর্ডার কনফার্মেশন সিরিজ"
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ট্রিগার সিলেক্ট করুন *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRIGGERS.map(t => (
                <label
                  key={t.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                    selectedTrigger === t.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="trigger"
                    value={t.value}
                    checked={selectedTrigger === t.value}
                    onChange={() => setSelectedTrigger(t.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      {t.icon}
                      {t.label}
                    </div>
                    <p className="text-sm text-gray-500">{t.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Email Steps */}
        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">ইমেইল স্টেপ</h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Plus size={16} /> স্টেপ যোগ করুন
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 text-sm font-bold rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      স্টেপ {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyTemplate(index)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                    >
                      <Wand2 size={12} /> টেমপ্লেট
                    </button>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      <Clock size={14} className="inline mr-1" /> বিলম্ব
                    </label>
                    <select
                      name="delay"
                      value={step.delay}
                      onChange={(e) => updateStep(index, 'delay', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 text-sm"
                    >
                      <option value={0}>তাৎক্ষণিক</option>
                      <option value={30}>৩০ মিনিট পর</option>
                      <option value={60}>১ ঘন্টা পর</option>
                      <option value={180}>৩ ঘন্টা পর</option>
                      <option value={360}>৬ ঘন্টা পর</option>
                      <option value={720}>১২ ঘন্টা পর</option>
                      <option value={1440}>১ দিন পর</option>
                      <option value={4320}>৩ দিন পর</option>
                      <option value={10080}>৭ দিন পর</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm text-gray-600 mb-1">
                      <Mail size={14} className="inline mr-1" /> সাবজেক্ট
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={step.subject}
                      onChange={(e) => updateStep(index, 'subject', e.target.value)}
                      required
                      placeholder="ইমেইল সাবজেক্ট লাইন"
                      className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    কন্টেন্ট (HTML)
                  </label>
                  <textarea
                    name="content"
                    value={step.content}
                    onChange={(e) => updateStep(index, 'content', e.target.value)}
                    rows={5}
                    placeholder="ইমেইল বডি HTML..."
                    className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ভ্যারিয়েবল: {"{{customer_name}}, {{order_number}}, {{total}}"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition"
          >
            {isSubmitting ? 'তৈরি হচ্ছে...' : 'অটোমেশন তৈরি করুন'}
          </button>
          <Link
            to="/app/automations"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </Form>
    </div>
  );
}
