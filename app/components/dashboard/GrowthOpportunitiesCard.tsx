import { Link } from "@remix-run/react";
import { TrendingUp, Users, ShoppingBag, ArrowRight } from "lucide-react";

interface GrowthProps {
  forecast: { date: string; predictedRevenue: number }[];
  clv: { clv: number; avgOrderValue: number; purchaseFrequency: number };
  currency: string;
}

export function GrowthOpportunitiesCard({ forecast, clv, currency }: GrowthProps) {
  // 1. Analyze Forecast Trend
  const next7DaysRevenue = forecast.slice(0, 7).reduce((sum, day) => sum + day.predictedRevenue, 0);
  const isGrowing = next7DaysRevenue > 0; // Simplified logic

  // 2. Analyze CLV Opportunities
  // If Purchase Frequency is low (< 1.2), suggest retention campaigns
  const needsRetention = clv.purchaseFrequency < 1.2;
  
  // If AOV is low (< 500), suggest Upsells
  const needsUpsell = clv.avgOrderValue < 500;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Growth Opportunities
        </h3>
        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full border border-indigo-100">
          AI Insights
        </span>
      </div>

      <div className="space-y-4">
        {/* Forecast Insight */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-medium text-gray-700">Revenue Forecast (7 Days)</span>
            <span className="text-sm font-bold text-gray-900">
              {currency} {next7DaysRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Based on recent trends, you are expected to generate this amount next week.
          </p>
        </div>

        {/* Actionable Suggestions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommended Actions</h4>
          
          {needsRetention && (
            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
              <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Launch Retention Campaign</p>
                <p className="text-xs text-gray-500">Purchase frequency is low. Send an SMS to inactive customers.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {needsUpsell && (
            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
              <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Enable Order Bumps</p>
                <p className="text-xs text-gray-500">AOV is lower than optimal. Add checkout cross-sells to boost it.</p>
              </div>
               <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          {!needsRetention && !needsUpsell && (
             <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
              <div className="bg-purple-100 p-1.5 rounded-md text-purple-600 group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Scale Ad Spend</p>
                <p className="text-xs text-gray-500">Metrics look healthy! Consider increasing ad budget to acquire more users.</p>
              </div>
               <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>
      
       <div className="mt-4 pt-3 border-t border-gray-100">
         <Link to="/app/analytics" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center justify-center gap-1">
            View Full Analytics Report <ArrowRight className="w-3 h-3" />
         </Link>
       </div>
    </div>
  );
}
