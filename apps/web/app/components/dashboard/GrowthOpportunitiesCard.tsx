import { Link } from "react-router";
import { TrendingUp, Users, ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslation } from "~/contexts/LanguageContext";

interface GrowthProps {
  forecast: { date: string; predictedRevenue: number }[];
  clv: { clv: number; avgOrderValue: number; purchaseFrequency: number };
  currency: string;
}

export function GrowthOpportunitiesCard({ forecast, clv, currency }: GrowthProps) {
  const { t } = useTranslation();
  // 1. Analyze Forecast Trend
  const next7DaysRevenue = forecast.slice(0, 7).reduce((sum, day) => sum + day.predictedRevenue, 0);
  // const isGrowing = next7DaysRevenue > 0; // Simplified logic - reserved for future use

  // 2. Analyze CLV Opportunities
  // If Purchase Frequency is low (< 1.2), suggest retention campaigns
  const needsRetention = clv.purchaseFrequency < 1.2;
  
  // If AOV is low (< 500), suggest Upsells
  const needsUpsell = clv.avgOrderValue < 500;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          {t('growthOpportunities')}
        </h3>
        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full border border-indigo-100">
          {t('aiInsights')}
        </span>
      </div>

      <div className="space-y-4">
        {/* Forecast Insight */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-medium text-gray-700">{t('revenueForecast')}</span>
            <span className="text-sm font-bold text-gray-900">
              {currency} {next7DaysRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {t('revenueForecastDesc')}
          </p>
        </div>

        {/* Actionable Suggestions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('recommendedActions')}</h4>
          
          {needsRetention && (
            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
              <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{t('launchRetentionCampaign')}</p>
                <p className="text-xs text-gray-500">{t('launchRetentionCampaignDesc')}</p>
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
                <p className="text-sm font-medium text-gray-800">{t('enableOrderBumps')}</p>
                <p className="text-xs text-gray-500">{t('enableOrderBumpsDesc')}</p>
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
                <p className="text-sm font-medium text-gray-800">{t('scaleAdSpend')}</p>
                <p className="text-xs text-gray-500">{t('scaleAdSpendDesc')}</p>
              </div>
               <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>
      
       <div className="mt-4 pt-3 border-t border-gray-100">
         <Link to="/app/analytics" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center justify-center gap-1">
            {t('viewFullAnalyticsReport')} <ArrowRight className="w-3 h-3" />
         </Link>
       </div>
    </div>
  );
}
