/**
 * AI Setup Progress Component
 * Shows animated step-by-step AI generation progress
 */

import { useEffect, useState } from 'react';
import { Store, Sparkles, Package, Palette, CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface AISetupProgressProps {
  isGenerating: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onComplete?: () => void;
}

const STEPS = [
  { icon: Store, label: '🏪 Creating your store...', labelBn: '🏪 আপনার স্টোর তৈরি হচ্ছে...' },
  { icon: Sparkles, label: '🤖 AI is naming your store...', labelBn: '🤖 AI আপনার স্টোরের নাম দিচ্ছে...' },
  { icon: Package, label: '📦 Adding demo product...', labelBn: '📦 ডেমো প্রোডাক্ট যোগ হচ্ছে...' },
  { icon: Palette, label: '🎨 Designing landing page...', labelBn: '🎨 ল্যান্ডিং পেজ ডিজাইন হচ্ছে...' },
  { icon: CheckCircle2, label: '✅ Almost done!', labelBn: '✅ প্রায় শেষ!' },
];

export function AISetupProgress({ isGenerating, hasError, errorMessage, onComplete }: AISetupProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isGenerating || hasError) return;

    // Progress through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 2000); // 2 seconds per step

    return () => clearInterval(interval);
  }, [isGenerating, hasError, onComplete]);

  // Reset state when error occurs
  useEffect(() => {
    if (hasError) {
      setIsComplete(false);
    }
  }, [hasError]);

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
              ❌ সমস্যা হয়েছে!
            </p>
            <p className="text-gray-600 mb-4">
              Something went wrong
            </p>
            {errorMessage && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg max-w-sm">
                {errorMessage}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {STEPS[currentStep]?.label}
            </p>
            <p className="text-gray-500">
              {STEPS[currentStep]?.labelBn}
            </p>
          </>
        )}
      </div>

      {/* Step Progress Dots */}
      {!hasError && (
        <div className="flex items-center gap-2">
          {STEPS.map((_, index) => (
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
          <h2 className="text-2xl font-bold text-emerald-600 mb-2">
            🎉 Your store is ready!
          </h2>
          <p className="text-gray-600">
            আপনার স্টোর তৈরি হয়ে গেছে!
          </p>
        </div>
      )}
    </div>
  );
}

