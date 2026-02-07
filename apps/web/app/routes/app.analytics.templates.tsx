import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql } from 'drizzle-orm';
import { stores, templateAnalytics } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import {
  TrendingUp,
  ShoppingCart,
  Eye,
  DollarSign,
  ArrowLeft,
  Layout,
  Percent,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { LANDING_TEMPLATES } from '~/components/landing-builder';
import { ClientChart } from '~/components/charts/ClientCharts';

export const meta: MetaFunction = () => {
  return [{ title: 'Template Analytics - Ozzyl' }];
};

// ============================================================================
// LOADER - Fetch template performance metrics
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store currency
  const storeData = await db
    .select({ currency: stores.currency, name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const currency = storeData[0]?.currency || 'BDT';

  // Fetch all template analytics for this store
  const analytics = await db
    .select()
    .from(templateAnalytics)
    .where(eq(templateAnalytics.storeId, storeId))
    .orderBy(desc(templateAnalytics.ordersGenerated));

  // Merge with registry metadata
  const report = analytics.map(item => {
    const registryInfo = LANDING_TEMPLATES.find(t => t.id === item.templateId);
    const views = item.pageViews || 0;
    const orders = item.ordersGenerated || 0;
    const convRate = views > 0 ? (orders / views) * 100 : 0;

    return {
      ...item,
      name: registryInfo?.name || item.templateId,
      thumbnail: registryInfo?.preview || '',
      category: registryInfo?.category || 'General',
      conversionRate: parseFloat(convRate.toFixed(2)),
      revenue: item.revenueGenerated || 0,
      views,
      orders
    };
  });

  // Calculate totals
  const totals = report.reduce((acc, curr) => ({
    views: acc.views + curr.views,
    orders: acc.orders + curr.orders,
    revenue: acc.revenue + curr.revenue
  }), { views: 0, orders: 0, revenue: 0 });

  const avgConvRate = totals.views > 0 ? (totals.orders / totals.views) * 100 : 0;

  return json({
    report,
    totals: {
      ...totals,
      avgConvRate: parseFloat(avgConvRate.toFixed(2))
    },
    currency,
    storeName: storeData[0]?.name || 'Store'
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TemplateAnalyticsPage() {
  const { report, totals, currency } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();

  const formatPrice = (amount: number) => {
    const symbols: Record<string, string> = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return `${symbols[currency] || currency} ${amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-BD')}`;
  };

  const chartData = report
    .filter(r => r.views > 0)
    .map(r => ({
      name: r.name,
      convRate: r.conversionRate,
      orders: r.orders,
      views: r.views
    }))
    .sort((a, b) => b.convRate - a.convRate);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/analytics"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {lang === 'bn' ? 'অ্যানালিটিক্স ব্যাকে যান' : 'Back to Analytics'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-6 h-6 text-indigo-600" />
            {lang === 'bn' ? 'টেমপ্লেট পারফরম্যান্স রিপোর্ট' : 'Template Performance Report'}
          </h1>
          <p className="text-gray-600">
            {lang === 'bn' ? 'দেখুন কোন ল্যান্ডিং পেজ টেমপ্লেটটি সবথেকে ভালো কাজ করছে' : 'See which landing page template converts best'}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title={lang === 'bn' ? 'মোট ভিউ' : 'Total Views'}
          value={totals.views.toLocaleString()}
          icon={<Eye className="w-5 h-5" />}
          color="blue"
        />
        <SummaryCard
          title={lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
          value={totals.orders.toLocaleString()}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="indigo"
        />
        <SummaryCard
          title={lang === 'bn' ? 'গড় কনভার্সন' : 'Avg Conversion'}
          value={`${totals.avgConvRate}%`}
          icon={<Percent className="w-5 h-5" />}
          color="emerald"
        />
        <SummaryCard
          title={lang === 'bn' ? 'মোট রেভিনিউ' : 'Total Revenue'}
          value={formatPrice(totals.revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            {lang === 'bn' ? 'কনভার্সন রেট তুলনা' : 'Conversion Rate Comparison (%)'}
          </h2>
          <div className="h-[350px] w-full">
            {chartData.length > 0 ? (
              <ClientChart height={350} fallback={<div className="h-[350px] bg-gray-50 rounded animate-pulse" />}>
                {({ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell }) => (
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 350 }}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val: number) => `${val}%`} />
                      <Tooltip
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="convRate" name="Conv. Rate" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ClientChart>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                {lang === 'bn' ? 'পর্যাপ্ত ডাটা নেই' : 'No data available yet'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {lang === 'bn' ? 'টেমপ্লেট ব্রেকডাউন' : 'Detailed breakdown by template'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">{lang === 'bn' ? 'টেমপ্লেট' : 'Template'}</th>
                <th className="px-6 py-4">{lang === 'bn' ? 'ভিউ' : 'Views'}</th>
                <th className="px-6 py-4">{lang === 'bn' ? 'অর্ডার' : 'Orders'}</th>
                <th className="px-6 py-4">{lang === 'bn' ? 'কনভার্সন' : 'Conv. Rate'}</th>
                <th className="px-6 py-4">{lang === 'bn' ? 'রেভিনিউ' : 'Revenue'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.length > 0 ? (
                report.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              <Layout className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-[150px]">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                      {item.orders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.conversionRate > 5 ? 'bg-emerald-500' :
                                item.conversionRate > 2 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                            style={{ width: `${Math.min(item.conversionRate * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.conversionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                      {formatPrice(item.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    {lang === 'bn' ? 'কোন ডেটা পাওয়া যায়নি' : 'No analytics data found for templates'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UI COMPONENTS
// ============================================================================
function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
