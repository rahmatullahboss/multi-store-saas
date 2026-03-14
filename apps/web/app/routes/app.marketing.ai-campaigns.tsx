/**
 * AI Marketing Campaigns - Smart Customer Segmentation
 * 
 * This page allows merchants to:
 * 1. View customer segments (VIP, Churn Risk, Window Shoppers, New)
 * 2. Generate AI marketing messages for each segment
 * 3. Send campaigns via Email (SMS coming soon)
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useFetcher, Link } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import { customers, stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  Users, 
  Crown, 
  AlertTriangle, 
  ShoppingCart, 
  UserPlus, 
  Sparkles, 
  RefreshCw,
  Send,
  Mail,
  MessageSquare,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRevalidator } from 'react-router';

// Segment definitions
const SEGMENTS = [
  { 
    id: 'vip', 
    label: 'VIP Customers', 
    labelBn: 'VIP গ্রাহক',
    icon: Crown, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: '3+ orders or 10k+ spent',
    descriptionBn: '৩+ অর্ডার অথবা ১০হাজার+ খরচ'
  },
  { 
    id: 'churn_risk', 
    label: 'Churn Risk', 
    labelBn: 'হারানোর ঝুঁকি',
    icon: AlertTriangle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'No purchase in 60+ days',
    descriptionBn: '৬০+ দিন কোনো অর্ডার নেই'
  },
  { 
    id: 'window_shopper', 
    label: 'Window Shoppers', 
    labelBn: 'কার্ট ছেড়ে গেছে',
    icon: ShoppingCart, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Added to cart but never bought',
    descriptionBn: 'কার্টে এড করেছে কিন্তু কেনেনি'
  },
  { 
    id: 'new', 
    label: 'New Leads', 
    labelBn: 'নতুন লিড',
    icon: UserPlus, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Never purchased yet',
    descriptionBn: 'কখনো কেনাকাটা করেনি'
  },
  { 
    id: 'regular', 
    label: 'Regular Customers', 
    labelBn: 'নিয়মিত গ্রাহক',
    icon: Users, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Active customers',
    descriptionBn: 'সক্রিয় গ্রাহক'
  },
];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });
  
  const db = drizzle(context.cloudflare.env.DB);
  
  // Get segment counts
  const segmentCounts = await db.select({
    segment: customers.segment,
    count: sql<number>`COUNT(*)`.as('count'),
  })
    .from(customers)
    .where(eq(customers.storeId, storeId))
    .groupBy(customers.segment);
  
  // Get store default language
  const [store] = await db.select({
    defaultLanguage: stores.defaultLanguage,
  })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const countsMap = segmentCounts.reduce((acc, { segment, count }) => {
    acc[segment || 'new'] = count;
    return acc;
  }, {} as Record<string, number>);
  
  const totalCustomers = Object.values(countsMap).reduce((a, b) => a + b, 0);
  
  return json({
    segmentCounts: countsMap,
    totalCustomers,
    defaultLanguage: store?.defaultLanguage || 'bn',
  });
}

export default function AIMarketingCampaigns() {
  const { segmentCounts, totalCustomers, defaultLanguage } = useLoaderData<typeof loader>();
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  
  const recalculateFetcher = useFetcher<{ success: boolean; segments?: Record<string, number> }>();
  const generateFetcher = useFetcher();
  const revalidator = useRevalidator();
  
  const isBengali = defaultLanguage === 'bn';
  
  // Reload data when recalculation completes
  useEffect(() => {
    if (recalculateFetcher.data?.success) {
      revalidator.revalidate();
    }
  }, [recalculateFetcher.data]);
  
  const handleRecalculate = () => {
    recalculateFetcher.submit(
      {},
      { method: 'POST', action: '/api/recalculate-segments' }
    );
  };
  
  const handleGenerateMessage = async (segment: string, channel: 'email' | 'sms') => {
    setIsGenerating(true);
    setSelectedSegment(segment);
    
    try {
      const response = await fetch('/api/generate-marketing-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment,
          channel,
          language: isBengali ? 'bn' : 'en',
          discountCode: discountCode || undefined,
          discountPercent: discountPercent || 10,
        }),
      });
      
      const data = await response.json() as { success: boolean; message?: string };
      if (data.success && data.message) {
        setGeneratedMessage(data.message);
      } else {
        setGeneratedMessage('Failed to generate message. Please try again.');
      }
    } catch (error) {
      setGeneratedMessage('Error generating message.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              {isBengali ? 'AI মার্কেটিং ক্যাম্পেইন' : 'AI Marketing Campaigns'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isBengali 
                ? 'স্মার্ট সেগমেন্টেশন দিয়ে কাস্টমারদের টার্গেট করুন'
                : 'Target customers with smart segmentation'}
            </p>
          </div>
          
          <button
            onClick={handleRecalculate}
            disabled={recalculateFetcher.state === 'submitting'}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculateFetcher.state === 'submitting' ? 'animate-spin' : ''}`} />
            {isBengali ? 'সেগমেন্ট আপডেট করুন' : 'Recalculate Segments'}
          </button>
        </div>
        
        {/* Total Customers */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {isBengali ? 'মোট গ্রাহক' : 'Total Customers'}
              </p>
              <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <Users className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        
        {/* Segment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {SEGMENTS.map((segment) => {
            const Icon = segment.icon;
            const count = segmentCounts[segment.id] || 0;
            
            return (
              <div
                key={segment.id}
                className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
                  selectedSegment === segment.id 
                    ? 'border-purple-500' 
                    : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => setSelectedSegment(segment.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${segment.bgColor}`}>
                    <Icon className={`w-6 h-6 ${segment.color}`} />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{count}</span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {isBengali ? segment.labelBn : segment.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {isBengali ? segment.descriptionBn : segment.description}
                </p>
                
                {count > 0 && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateMessage(segment.id, 'email');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateMessage(segment.id, 'sms');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      SMS
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Discount Code Input */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {isBengali ? 'ডিসকাউন্ট কোড (ঐচ্ছিক)' : 'Discount Code (Optional)'}
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={isBengali ? 'কোড লিখুন যেমন SAVE10' : 'Enter code e.g. SAVE10'}
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
            <input
              type="number"
              placeholder="%"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 10)}
              min={1}
              max={100}
              className="w-20 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-center"
            />
          </div>
        </div>
        
        {/* Generated Message Preview */}
        {(generatedMessage || isGenerating) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              {isBengali ? 'AI জেনারেটেড মেসেজ' : 'AI Generated Message'}
            </h2>
            
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">
                  {isBengali ? 'মেসেজ তৈরি হচ্ছে...' : 'Generating message...'}
                </span>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
                  {generatedMessage}
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleGenerateMessage(selectedSegment!, 'email')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {isBengali ? 'রিজেনারেট' : 'Regenerate'}
                  </button>
                  <Link
                    to={`/app/campaigns/new?template=${encodeURIComponent(generatedMessage)}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                    {isBengali ? 'ক্যাম্পেইন তৈরি করুন' : 'Create Campaign'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
