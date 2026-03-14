/**
 * AI Enhance Button Component
 * 
 * A reusable button that adds AI-powered text enhancement to any input field.
 * User enters keywords/topic, AI generates improved text.
 */

import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Sparkles, X, Loader2, Send, Wand2 } from 'lucide-react';

interface AIEnhanceButtonProps {
  /** Type of field for context-aware generation */
  fieldType: 'headline' | 'subheadline' | 'description' | 'urgency' | 'guarantee' | 'cta' | 'testimonial' | 'seo';
  /** Current text in the field (for improvement) */
  currentText?: string;
  /** Callback when AI generates new text */
  onTextGenerated: (text: string) => void;
  /** Optional custom placeholder */
  placeholder?: string;
  /** Button size */
  size?: 'sm' | 'md';
}

// Field-specific prompts and placeholders
const FIELD_CONFIG: Record<string, { label: string; placeholder: string; examples: string[] }> = {
  headline: {
    label: 'Headline',
    placeholder: 'বিষয় লিখুন (e.g., leather bag premium quality)',
    examples: ['আরো attention-grabbing করো', 'urgency যোগ করো', 'সংক্ষিপ্ত করো'],
  },
  subheadline: {
    label: 'Subheadline',
    placeholder: 'বিষয় লিখুন (e.g., free delivery fast shipping)',
    examples: ['benefits highlight করো', 'short and sweet', 'বাংলায় লিখো'],
  },
  description: {
    label: 'Description',
    placeholder: 'প্রোডাক্ট সম্পর্কে keywords (e.g., organic skincare)',
    examples: ['আরো persuasive করো', 'features list করো', 'short paragraph'],
  },
  urgency: {
    label: 'Urgency Text',
    placeholder: 'অফার সম্পর্কে (e.g., limited stock 50% off)',
    examples: ['FOMO তৈরি করো', '🔥 দিয়ে শুরু করো', 'countdown style'],
  },
  guarantee: {
    label: 'Guarantee',
    placeholder: 'গ্যারান্টি সম্পর্কে (e.g., money back 7 days)',
    examples: ['trust build করো', 'আরো bold করো', 'risk-free emphasize'],
  },
  cta: {
    label: 'CTA Button',
    placeholder: 'বাটন টেক্সট সম্পর্কে (e.g., order now fast)',
    examples: ['action-oriented', 'urgency add করো', 'emoji যোগ করো'],
  },
  testimonial: {
    label: 'Testimonial',
    placeholder: 'রিভিউ সম্পর্কে (e.g., skincare glowing results)',
    examples: ['realistic বানাও', 'specific benefits', 'emotional করো'],
  },
  seo: {
    label: 'SEO Keywords',
    placeholder: 'বিজনেস সম্পর্কে (e.g., dhaka leather shop)',
    examples: ['related keywords', 'long-tail যোগ করো', 'buyer intent'],
  },
};

export function AIEnhanceButton({
  fieldType,
  currentText = '',
  onTextGenerated,
  placeholder,
  size = 'md',
}: AIEnhanceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success: boolean; data?: string; error?: string }>();
  
  const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';
  const config = FIELD_CONFIG[fieldType] || FIELD_CONFIG.headline;

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle successful response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.data) {
      onTextGenerated(fetcher.data.data);
      setIsOpen(false);
      setPrompt('');
    }
  }, [fetcher.data, onTextGenerated]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    fetcher.submit(
      JSON.stringify({
        action: 'ENHANCE_TEXT',
        fieldType,
        currentText,
        keywords: prompt,
      }),
      {
        method: 'POST',
        action: '/api/ai/action',
        encType: 'application/json',
      }
    );
  };

  const buttonSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${buttonSize} flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md`}
        title="AI দিয়ে তৈরি করুন"
        aria-label="AI দিয়ে তৈরি করুন"
        aria-expanded={isOpen}
      >
        <Sparkles className={iconSize} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="font-medium text-sm">AI {config.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close AI panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholder || config.placeholder}
                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={isLoading ? 'Generating AI text...' : 'Generate AI text'}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Error */}
            {fetcher.data?.error && (
              <p className="mt-2 text-xs text-red-600">{fetcher.data.error}</p>
            )}
          </form>

          {/* Example Prompts */}
          <div className="px-3 pb-3">
            <p className="text-xs text-gray-400 mb-1.5">Examples:</p>
            <div className="flex flex-wrap gap-1">
              {config.examples.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(example)}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                <p className="text-sm text-purple-600 font-medium">AI লিখছে...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
