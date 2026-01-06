/**
 * AIEditPanel - Floating AI Chat Interface
 * 
 * Features:
 * - Backdrop blur modal
 * - Natural language prompt input
 * - Optimistic UI updates
 * - Example prompts
 * - Loading skeleton
 */

import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { X, Send, Sparkles, Loader2, Wand2, Check } from 'lucide-react';

interface AIEditPanelProps {
  sectionId: string;
  sectionLabel: string;
  currentData: unknown;
  anchorRect: DOMRect;
  onClose: () => void;
  onUpdate: (newData: unknown) => void;
}

// Section-specific example prompts
const SECTION_PROMPTS: Record<string, string[]> = {
  hero: [
    'Make the headline more urgent',
    'Add emojis to grab attention',
    'Make it shorter and punchier',
  ],
  features: [
    'Add 2 more benefits',
    'Focus on pain points',
    'Make descriptions shorter',
  ],
  testimonials: [
    'Add 2 more reviews from Dhaka',
    'Make them more enthusiastic',
    'Add specific product results',
  ],
  cta: [
    'Add urgency to the button',
    'Make it more action-oriented',
    'Include a guarantee',
  ],
  trust: [
    'Strengthen the guarantee',
    'Add social proof numbers',
    'Include a refund policy',
  ],
  default: [
    'Make it more persuasive',
    'Add urgency',
    'Improve the copy',
  ],
};

export function AIEditPanel({
  sectionId,
  sectionLabel,
  currentData,
  anchorRect,
  onClose,
  onUpdate,
}: AIEditPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const fetcher = useFetcher<{ success: boolean; data?: unknown; error?: string }>();
  const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle successful response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.data) {
      setIsApplied(true);
      // Small delay to show success state
      setTimeout(() => {
        onUpdate(fetcher.data!.data);
      }, 500);
    }
  }, [fetcher.data, onUpdate]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    fetcher.submit(
      JSON.stringify({
        action: 'EDIT_SECTION',
        sectionName: sectionId,
        currentData,
        editPrompt: prompt,
      }),
      {
        method: 'POST',
        action: '/api/ai.action',
        encType: 'application/json',
      }
    );
  };

  // Calculate panel position
  const panelStyle = {
    top: Math.max(80, anchorRect.top + window.scrollY - 20),
    right: Math.max(20, window.innerWidth - anchorRect.right - 10),
  };

  const examples = SECTION_PROMPTS[sectionId] || SECTION_PROMPTS.default;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed z-50 w-96 max-w-[calc(100vw-40px)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
        style={panelStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-pink-500">
          <div className="flex items-center gap-2.5 text-white">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Magic Edit</h3>
              <p className="text-xs text-white/80">{sectionLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="relative">
                <Sparkles className="w-10 h-10 text-purple-600" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-purple-600 font-semibold">Applying magic...</p>
                <p className="text-gray-400 text-sm mt-1">AI is transforming your content</p>
              </div>
              {/* Skeleton Preview */}
              <div className="w-full space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          )}

          {/* Success State */}
          {isApplied && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-green-600 font-semibold">Changes Applied!</p>
                <p className="text-gray-400 text-sm mt-1">Your section has been updated</p>
              </div>
            </div>
          )}

          {/* Form */}
          {!isLoading && !isApplied && (
            <>
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What should I change? (e.g., Make the headline more urgent)"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </button>
              </form>

              {/* Example Prompts */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 font-medium">Try these:</p>
                <div className="flex flex-wrap gap-1.5">
                  {examples.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {fetcher.data?.error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {fetcher.data.error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
