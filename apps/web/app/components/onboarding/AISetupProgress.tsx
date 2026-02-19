/**
 * Setup Progress Component
 * Shows animated step-by-step store setup progress
 * Note: AI features temporarily disabled for MVP
 */

import { useEffect, useState } from 'react';
import { Store, Sparkles, Palette, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import type { TranslationKey } from '~/utils/i18n/index';

interface AISetupProgressProps {
  isGenerating: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onComplete?: () => void;
}

// Simplified step keys for quick onboarding
const STEP_KEYS: { icon: typeof Store; key: TranslationKey }[] = [
  { icon: Store, key: 'creatingYourStore' },
  { icon: Palette, key: 'designingLandingPage' },
  { icon: CheckCircle2, key: 'almostDone' },
];

export function AISetupProgress({ isGenerating, hasError, errorMessage, onComplete }: AISetupProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isGenerating || hasError) return;

    // Progress through steps faster (1.5 seconds per step)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEP_KEYS.length - 1) {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isGenerating, hasError, onComplete]);

  // Reset state when error occurs
  useEffect(() => {
    if (hasError) {
      setIsComplete(false);
    }
  }, [hasError]);

  // Get current step label with emoji
  const getStepLabel = (index: number): string => {
    const emojis = ['🏪', '🎨', '✅'];
    return `${emojis[index]} ${t(STEP_KEYS[index].key)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Central Animation */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className={`w-32 h-32 rounded-full border-4 ${
          hasError 
            ? 'border-red-400' 
            : isComplete 
              ? 'border-emerald-500' 
              : 'border-emerald-200'
        } flex items-center justify-center`}>
          {/* Inner spinning loader, check, or error */}
          {hasError ? (
            <XCircle className="w-16 h-16 text-red-500" />
          ) : isComplete ? (
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          ) : (
            <div className="relative">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              <Sparkles className="w-8 h-8 text-emerald-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Floating particles */}
        {isGenerating && !isComplete && !hasError && (
          <>
            <div className="absolute -top-4 -left-4 w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute -top-2 -right-6 w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            <div className="absolute -bottom-4 -left-6 w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
            <div className="absolute -bottom-2 -right-4 w-3 h-3 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '0.9s' }} />
          </>
        )}
      </div>

      {/* Current Step Label or Error */}
      <div className="text-center mb-8">
        {hasError ? (
          <>
            <p className="text-xl font-semibold text-red-600 mb-2">
              ❌ {t('somethingWentWrong')}
            </p>
            {errorMessage && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg max-w-sm">
                {errorMessage}
              </p>
            )}
          </>
        ) : (
          <p className="text-xl font-semibold text-gray-900">
            {getStepLabel(currentStep)}
          </p>
        )}
      </div>

      {/* Step Progress Dots */}
      {!hasError && (
        <div className="flex items-center gap-2">
          {STEP_KEYS.map((_, index) => (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index < currentStep 
                  ? 'bg-emerald-500' 
                  : index === currentStep 
                    ? 'bg-emerald-500 ring-4 ring-emerald-200' 
                    : 'bg-gray-200'
                }
              `}
            />
          ))}
        </div>
      )}

      {/* Success Message */}
      {isComplete && !hasError && (
        <div className="mt-8 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">
            🎉 {t('storeReady')}
          </h2>
          
          {/* Go to Dashboard Button */}
          <a
            href="/app/orders"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-lg font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🚀 {t('goToDashboard')}
          </a>
        </div>
      )}
    </div>
  );
}

