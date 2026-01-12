/**
 * Super Admin - Tutorials & Documentation
 * 
 * Route: /admin/tutorials
 * 
 * Comprehensive guide for all Super Admin features.
 * Designed for employees to learn and operate the system independently.
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  BookOpen, 
  Store, 
  CreditCard, 
  Globe, 
  Bot, 
  HardDrive, 
  Ticket, 
  Radio,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  Eye,
  Ban,
  UserRound,
  Trash2,
  RotateCcw,
  Settings,
  Mail,
  Bell
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Tutorials - Super Admin' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  return json({});
}

// ============================================================================
// TUTORIAL SECTIONS DATA
// ============================================================================
const tutorialSections = [
  {
    id: 'dashboard',
    icon: BarChart3,
    title: 'Dashboard Overview',
    description: 'প্ল্যাটফর্মের সামগ্রিক পরিস্থিতি দেখুন',
    content: [
      {
        heading: 'Dashboard কী দেখায়?',
        steps: [
          'Total Stores: প্ল্যাটফর্মে মোট কতটি স্টোর আছে',
          'Active vs Suspended: কতটি চালু এবং কতটি বন্ধ',
          'Monthly Revenue: এই মাসে সব স্টোর মিলিয়ে কত টাকার অর্ডার হয়েছে',
          'Total Orders: সব স্টোরের মিলিত অর্ডার সংখ্যা',
          'Plan Distribution: Free, Starter, Premium প্ল্যানের ভাগ',
        ],
      },
      {
        heading: 'কিভাবে টেস্ট করবেন?',
        steps: [
          '"/admin" এ গিয়ে সব কার্ড দেখুন',
          'একটি নতুন স্টোর তৈরি করুন → Dashboard এ Total Stores বাড়বে',
          'একটি অর্ডার করুন → Orders ও Revenue বাড়বে',
        ],
      },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'বিস্তারিত বিশ্লেষণ দেখুন',
    content: [
      {
        heading: 'Analytics পেইজে কী আছে?',
        steps: [
          'Platform-wide GMV: সব স্টোরের মোট সেল',
          'Per-store breakdown: প্রতিটি স্টোরের Revenue, Orders, Products',
          'Top 10 Stores: সবচেয়ে বেশি বিক্রি করা স্টোরগুলো',
          'Stores Approaching Limits: যেসব স্টোর limit এ পৌঁছাচ্ছে',
          'Visitor Counts: প্রতিটি স্টোরে কত ভিজিটর আসছে',
        ],
      },
      {
        heading: 'কিভাবে ব্যবহার করবেন?',
        steps: [
          '"/admin/analytics" এ যান',
          'Filter by Plan: Free/Starter/Premium স্টোর আলাদা করে দেখুন',
          'Sort by: Revenue, Orders, Visitors, Products দিয়ে সর্ট করুন',
          'Limit Alert দেখুন: 80%+ usage থাকা স্টোরগুলো দেখুন → তাদের upgrade করাতে contact করুন',
        ],
      },
    ],
  },
  {
    id: 'stores',
    icon: Store,
    title: 'Store Management',
    description: 'সব স্টোর পরিচালনা করুন',
    content: [
      {
        heading: 'Store List কী দেখায়?',
        steps: [
          'Store Name ও Subdomain',
          'Owner এর নাম ও Email',
          'Plan Type: Free/Starter/Premium',
          'Usage: Orders ও Products এর limit usage',
          'Status: Active বা Suspended',
        ],
      },
      {
        heading: 'Store Suspend করা',
        steps: [
          '"/admin/stores" এ যান',
          'যে স্টোর suspend করতে চান তার পাশে 🚫 (Ban) বাটনে ক্লিক করুন',
          'স্টোর Suspended হয়ে যাবে → Customer সেই স্টোরে কিনতে পারবে না',
          'আবার চালু করতে ✅ (CheckCircle) বাটনে ক্লিক করুন',
        ],
      },
      {
        heading: 'Impersonate (Login as User)',
        steps: [
          'কোনো স্টোরের সমস্যা debug করতে "Impersonate" বাটনে ক্লিক করুন',
          'আপনি সেই Store Owner হিসেবে login হয়ে যাবেন',
          '⚠️ সতর্কতা: এটি শুধুমাত্র সমস্যা সমাধানের জন্য ব্যবহার করুন',
          'Action log এ রেকর্ড হয়ে যাবে',
        ],
      },
      {
        heading: 'Store Delete করা',
        steps: [
          '🗑️ (Trash) বাটনে ক্লিক করুন → Soft Delete হবে',
          '"Show Deleted" বাটনে ক্লিক করে deleted stores দেখুন',
          'Restore করতে ↩️ (RotateCcw) বাটনে ক্লিক করুন',
        ],
      },
      {
        heading: 'কিভাবে টেস্ট করবেন?',
        steps: [
          'একটি test store তৈরি করুন',
          'Suspend → store এ গিয়ে দেখুন "Store Suspended" মেসেজ দেখাচ্ছে কিনা',
          'Unsuspend → আবার কাজ করছে কিনা দেখুন',
          'Delete → Deleted list এ দেখাচ্ছে কিনা',
          'Restore → আবার active list এ এসেছে কিনা',
        ],
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Subscriptions',
    description: 'পেমেন্ট ও সাবস্ক্রিপশন ম্যানেজ করুন',
    content: [
      {
        heading: 'Billing Dashboard',
        steps: [
          'MRR (Monthly Recurring Revenue): প্রতি মাসে কত আয় হচ্ছে',
          'Active Subscribers: কত জন পেইড সাবস্ক্রাইবার আছে',
          'Pending Approvals: বিকাশ/নগদ পেমেন্ট অপেক্ষায় আছে',
          'Expired Subscriptions: মেয়াদ শেষ হয়ে গেছে',
        ],
      },
      {
        heading: 'Manual Payment Approve করা',
        steps: [
          '"/admin/billing" এ যান',
          '"Pending" ট্যাবে ক্লিক করুন',
          'Transaction ID ও Amount দেখে verify করুন',
          '"Approve" বাটনে ক্লিক করুন',
          'Subscription Start ও End Date সেট করুন',
          'Store এর plan upgrade হয়ে যাবে',
        ],
      },
      {
        heading: 'কিভাবে টেস্ট করবেন?',
        steps: [
          'একটি test store থেকে Manual Payment request করুন',
          'Admin panel এ Pending এ দেখাচ্ছে কিনা দেখুন',
          'Approve করুন → Store এর plan change হয়েছে কিনা দেখুন',
        ],
      },
    ],
  },
  {
    id: 'domains',
    icon: Globe,
    title: 'Domain Health',
    description: 'Custom Domain এবং SSL ম্যানেজ করুন',
    content: [
      {
        heading: 'Domain Request Approve করা',
        steps: [
          '"/admin/domains" এ যান',
          '"Pending" ট্যাবে domain requests দেখুন',
          'Domain টি verify করুন (সঠিক format কিনা)',
          '"Approve" ক্লিক করুন',
          'Cloudflare API দিয়ে custom hostname তৈরি হবে',
        ],
      },
      {
        heading: 'SSL Status চেক করা',
        steps: [
          'Domain list এ SSL Status column দেখুন',
          'Pending: SSL তৈরি হচ্ছে (24-48 ঘন্টা লাগতে পারে)',
          'Active: SSL কাজ করছে ✅',
          'Failed: সমস্যা আছে ❌ → DNS রেকর্ড চেক করুন',
        ],
      },
      {
        heading: 'DNS Verification',
        steps: [
          'Customer কে বলুন তাদের domain এ CNAME রেকর্ড যোগ করতে',
          'CNAME: @ → [subdomain].ozzyl.com',
          'অথবা: www → [subdomain].ozzyl.com',
          'DNS propagate হতে 1-24 ঘন্টা লাগে',
        ],
      },
    ],
  },
  {
    id: 'ai-requests',
    icon: Bot,
    title: 'AI Agent Requests',
    description: 'AI Chatbot activation requests handle করুন',
    content: [
      {
        heading: 'AI Request Approve করা',
        steps: [
          '"/admin/ai-requests" এ যান',
          'Pending requests দেখুন',
          'Store টি Premium plan এ আছে কিনা চেক করুন',
          '"Approve" বা "Reject" করুন',
          'Approve করলে store এ AI chatbot চালু হয়ে যাবে',
        ],
      },
      {
        heading: 'কিভাবে টেস্ট করবেন?',
        steps: [
          'Premium store থেকে AI activation request করুন',
          'Admin panel এ দেখাচ্ছে কিনা দেখুন',
          'Approve করুন → Store এ AI chat icon দেখাচ্ছে কিনা দেখুন',
        ],
      },
    ],
  },
  {
    id: 'storage',
    icon: HardDrive,
    title: 'Storage Management',
    description: 'R2 Storage usage ও cleanup',
    content: [
      {
        heading: 'Storage কী দেখায়?',
        steps: [
          'Total Storage Used: কত GB ব্যবহার হয়েছে',
          'Per-store breakdown: কোন স্টোর কত storage ব্যবহার করছে',
          'Orphan Files: কোনো স্টোরের সাথে সম্পর্কিত না এমন ফাইল',
        ],
      },
      {
        heading: 'Cleanup করা',
        steps: [
          'Orphan files delete করতে "Cleanup" বাটন ব্যবহার করুন',
          '⚠️ সাবধান: Delete করার আগে নিশ্চিত হোন ফাইলগুলো দরকার নেই',
        ],
      },
    ],
  },
  {
    id: 'marketing',
    icon: Ticket,
    title: 'Marketing - Coupons',
    description: 'SaaS subscription এ discount coupon তৈরি করুন',
    content: [
      {
        heading: 'Coupon তৈরি করা',
        steps: [
          '"/admin/marketing" এ যান',
          '"New Coupon" বাটনে ক্লিক করুন',
          'Coupon Code: যেমন START50, LAUNCH20',
          'Discount Type: Percentage (%) বা Fixed (৳)',
          'Discount Amount: কত % বা কত টাকা',
          'Max Uses: কত বার ব্যবহার করা যাবে (খালি = unlimited)',
          'Expiry Date: কবে পর্যন্ত valid',
        ],
      },
      {
        heading: 'কিভাবে টেস্ট করবেন?',
        steps: [
          'TEST50 নামে একটি 50% coupon তৈরি করুন',
          'একটি store থেকে upgrade করার সময় coupon code দিন',
          'Price কমেছে কিনা দেখুন',
          'Admin panel এ Used Count বেড়েছে কিনা দেখুন',
        ],
      },
      {
        heading: 'Coupon Manage করা',
        steps: [
          'Toggle: Coupon চালু/বন্ধ করুন',
          'Delete: Coupon মুছে ফেলুন',
          'Status দেখুন: Active/Expired/Exhausted',
        ],
      },
    ],
  },
  {
    id: 'broadcasts',
    icon: Radio,
    title: 'Broadcasts',
    description: 'সব store owners কে notification পাঠান',
    content: [
      {
        heading: 'Broadcast পাঠানো',
        steps: [
          '"/admin/broadcasts" এ যান',
          '"New Broadcast" ক্লিক করুন',
          'Title: ঘোষণার শিরোনাম',
          'Message: বিস্তারিত মেসেজ',
          'Type: info/warning/critical',
          '"Send" ক্লিক করুন',
        ],
      },
      {
        heading: 'কখন ব্যবহার করবেন?',
        steps: [
          'New Feature announcement',
          'Maintenance notice',
          'Important security updates',
          'Pricing changes',
        ],
      },
    ],
  },
  {
    id: 'ai-setup',
    icon: Bot,
    title: 'AI Agent Setup (Technical)',
    description: 'কিভাবে AI Agent System সেটআপ করবেন',
    content: [
      {
        heading: '1. Meta App তৈরি করুন',
        steps: [
          'developers.facebook.com এ যান -> "My Apps" -> "Create App"',
          'Select "Other" -> "Business" app type',
          'App create হলে "WhatsApp" product add করুন',
        ],
      },
      {
        heading: '2. Webhook Setup',
        steps: [
          'WhatsApp settings থেকে "Configuration" এ যান',
          'Callback URL: [YOUR_DOMAIN]/api/agent/webhook',
          'Verify Token: একটি গোপন শব্দ দিন (Cloudflare এ META_VERIFY_TOKEN হিসেবে সেট করতে হবে)',
          '"Verify and Save" এ ক্লিক করুন',
          'Webhook fields: "messages" subscribe করুন',
        ],
      },
      {
        heading: '3. Environment Variables (Cloudflare)',
        steps: [
          'Cloudflare Dashboard -> Pages -> Settings -> Environment variables এ যান',
          'OPENROUTER_API_KEY: আপনার OpenRouter Key (AI এর জন্য)',
          'META_VERIFY_TOKEN: Webhook verify token (যা ধাপ ২ এ দিয়েছেন)',
          'META_ACCESS_TOKEN: System User Access Token (মেসেজ পাঠানোর জন্য)',
          'Save করুন এবং Redeploy করুন',
        ],
      },
      {
        heading: '4. Testing',
        steps: [
          'Meta App Dashboard থেকে "WhatsApp" -> "API Setup" এ যান',
          'আপনার নম্বর add করুন এবং test message পাঠান',
          'সব ঠিক থাকলে AI reply দিবে',
        ],
      },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminTutorials() {
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          Tutorials & Documentation
        </h1>
        <p className="text-slate-400 mt-1">
          Super Admin Panel এর সকল ফিচার কিভাবে ব্যবহার করবেন - step by step guide
        </p>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-400">গুরুত্বপূর্ণ তথ্য</h4>
            <ul className="text-sm text-blue-300/80 mt-1 space-y-1">
              <li>• Super Admin actions সব logged হয় - সাবধানে ব্যবহার করুন</li>
              <li>• Impersonate শুধুমাত্র সমস্যা সমাধানের জন্য ব্যবহার করুন</li>
              <li>• Production এ কিছু delete করার আগে দুইবার ভাবুন</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tutorial Sections */}
      <div className="space-y-3">
        {tutorialSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          
          return (
            <div 
              key={section.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-white">{section.title}</h3>
                    <p className="text-sm text-slate-500">{section.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-6">
                  {section.content.map((block, idx) => (
                    <div key={idx} className="pl-13">
                      <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {block.heading}
                      </h4>
                      <ul className="space-y-2">
                        {block.steps.map((step, stepIdx) => (
                          <li 
                            key={stepIdx}
                            className="text-sm text-slate-300 pl-6 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-slate-600 before:rounded-full"
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="font-medium text-white mb-2">সাহায্য দরকার?</h3>
        <p className="text-sm text-slate-400">
          কোনো সমস্যা হলে বা কিছু বুঝতে না পারলে Super Admin (rahmatullahzisan@gmail.com) কে contact করুন।
        </p>
      </div>
    </div>
  );
}
