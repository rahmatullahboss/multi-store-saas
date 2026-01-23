/**
 * Onboarding Steps Indicator
 * Shows progress through the 4-step wizard
 */

import { Check } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface OnboardingStepsProps {
  currentStep: number;
  totalSteps?: number;
}

export function OnboardingSteps({ currentStep, totalSteps = 4 }: OnboardingStepsProps) {
  const { t } = useTranslation();
  
  // Dynamic step labels based on totalSteps
  const STEP_LABELS = totalSteps === 4 
    ? [t('stepAccount'), t('stepBusiness'), t('stepPlan'), t('stepDone')]
    : [t('stepAccount'), t('stepBusiness'), t('stepPlan'), t('stepSetup'), t('stepDone')];


  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        
        return (
          <div key={stepNum} className="flex items-center">
            {/* Step Circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${isCompleted 
                  ? 'bg-emerald-600 text-white' 
                  : isCurrent 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
            </div>
            
            {/* Label (below circle on mobile, beside on desktop) */}
            <span 
              className={`
                hidden sm:block ml-2 text-sm font-medium
                ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
              `}
            >
              {STEP_LABELS[index]}
            </span>
            
            {/* Connector Line */}
            {stepNum < totalSteps && (
              <div 
                className={`
                  w-8 h-1 mx-2 rounded
                  ${isCompleted ? 'bg-emerald-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
