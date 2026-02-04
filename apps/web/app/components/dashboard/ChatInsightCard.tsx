import { TrendingUp, ShoppingBag, ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export interface InsightData {
  totalSales: string;
  orderCount: number;
  trend: number; // percentage
  suggestions: string[];
}

interface ChatInsightCardProps {
  data: InsightData;
}

export default function ChatInsightCard({ data }: ChatInsightCardProps) {
  const { t } = useTranslation();
  const isPositive = data.trend >= 0;
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

  return (
    <div className="w-full max-w-sm bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md my-2">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
             <TrendingUp size={16} className="text-emerald-600" />
           </div>
           <span className="font-bold text-gray-800 text-sm">{t('insight_title') || 'Business Insight'}</span>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(data.trend)}%
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-5">
        <div className="mb-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{t('total_sales_today') || 'Total Sales Today'}</p>
            <h3 className="text-2xl font-black text-gray-900">{data.totalSales}</h3>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-gray-100 mb-4">
             <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100">
                    <ShoppingBag size={16} className="text-blue-500" />
                 </div>
                 <div>
                     <p className="text-gray-500 text-xs">{t('new_orders') || 'New Orders'}</p>
                     <p className="text-gray-900 font-bold text-sm">{data.orderCount} {t('orders') || 'Orders'}</p>
                 </div>
             </div>
             <button className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-2 py-1 rounded transition shadow-sm font-medium">
                 {t('view') || 'View'}
             </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={12} className="text-yellow-600" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('suggestions') || 'Suggestions'}</span>
                </div>
                {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 hover:border-emerald-200 transition cursor-default">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{suggestion}</span>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
