/**
 * Plan Selector Component
 * Shows plan comparison cards for onboarding
 */

import { Check, Crown, Zap, Sparkles } from 'lucide-react';
import type { PlanType } from '~/utils/plans.server';
import { useTranslation } from '~/contexts/LanguageContext';

interface PlanOption {
  id: PlanType;
  name: string;
  namebn: string;
  price: number;
  period: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    namebn: 'ফ্রি',
    price: 0,
    period: 'forever',
    icon: <Zap className="w-6 h-6" />,
    features: [
      '5 Products',
      '50 Orders/month',
      'Store + Landing Page',
      'Subdomain only',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    namebn: 'স্টার্টার',
    price: 999,
    period: 'month',
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
    features: [
      '50 Products',
      '500 Orders/month',
      'Unlimited AI',
      'Custom Domain',
      'Priority Support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    namebn: 'প্রিমিয়াম',
    price: 2499,
    period: 'month',
    icon: <Crown className="w-6 h-6" />,
    features: [
      '500 Products',
      '5000 Orders/month',
      'Unlimited AI',
      'Custom Domain',
      'Priority Support',
      'Analytics Dashboard',
      'Lower Platform Fee',
    ],
  },
];

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {PLANS.map((plan) => {
        const isSelected = selectedPlan === plan.id;
        
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            className={`
              relative p-5 md:p-6 lg:p-8 rounded-2xl border-2 text-left transition-all
              ${isSelected 
                ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${plan.popular ? 'md:-mt-2 md:mb-2' : ''}
            `}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold rounded-full">
                  {t('mostPopular')}
                </span>
              </div>
            )}
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {plan.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.namebn}</p>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-4">
              {plan.price === 0 ? (
                <div className="text-3xl font-bold text-gray-900">{t('planFree')}</div>
              ) : (
                <div>
                  <span className="text-3xl font-bold text-gray-900">৳{plan.price}</span>
                  <span className="text-gray-500 text-sm">/{plan.period}</span>
                </div>
              )}
            </div>
            
            {/* Features */}
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {feature}
                </li>
              ))}
            </ul>
            
            {/* Selection Indicator */}
            <div className={`
              mt-4 py-2 rounded-lg text-center text-sm font-semibold transition-all
              ${isSelected 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {isSelected ? `✓ ${t('selected')}` : t('selectPlan')}
            </div>
          </button>
        );
      })}
    </div>
  );
}
