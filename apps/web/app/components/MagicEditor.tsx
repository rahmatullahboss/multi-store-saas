/**
 * Magic Editor Component
 * 
 * Floating AI-powered editor for landing page sections.
 * Allows users to describe changes in natural language.
 */

import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Sparkles, X, Loader2, Send, Wand2 } from 'lucide-react';

interface MagicEditorProps {
  sectionName: string;
  sectionLabel: string;
  currentData: unknown;
  position: { top: number; left: number };
  onClose: () => void;
  onUpdate: (newData: unknown) => void;
}

export function MagicEditor({
  sectionName,
  sectionLabel,
  currentData,
  position,
  onClose,
  onUpdate,
}: MagicEditorProps) {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success: boolean; data?: unknown; error?: string }>();
  
  const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle successful response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.data) {
      onUpdate(fetcher.data.data);
      onClose();
    }
  }, [fetcher.data, onClose, onUpdate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    fetcher.submit(
      {
        action: 'EDIT_SECTION',
        sectionName,
        currentData: JSON.stringify(currentData),
        editPrompt: prompt,
      },
      {
        method: 'POST',
        action: '/api/ai/action',
        encType: 'application/json',
      }
    );
  };

  // Example prompts based on section
  const examplePrompts: Record<string, string[]> = {
    hero: [
      'আরও urgency যোগ করুন',
      'Emoji দিয়ে headline সাজান',
      'Make it shorter and punchier',
    ],
    features: [
      'আরও ৩টা feature যোগ করুন',
      'Healthcare সম্পর্কিত features দিন',
      'Make descriptions shorter',
    ],
    testimonials: [
      'আরও ২টা review যোগ করুন',
      'Dhaka-র customers দিন',
      'Make them more enthusiastic',
    ],
    trust: [
      'Stronger guarantee text',
      'আরও urgency দিন',
      'Add limited stock warning',
    ],
  };

  const examples = examplePrompts[sectionName] || examplePrompts.hero;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Editor Panel */}
      <div
        className="fixed z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{
          top: Math.max(20, Math.min(position.top - 50, window.innerHeight - 350)),
          left: Math.max(20, Math.min(position.left, window.innerWidth - 420)),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            <span className="font-semibold">Magic Edit: {sectionLabel}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="আপনি কি চেঞ্জ চান বলুন..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {fetcher.data?.error && (
            <p className="mt-2 text-sm text-red-600">{fetcher.data.error}</p>
          )}
        </form>

        {/* Example Prompts */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Try these:</p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <p className="text-purple-600 font-medium">AI জেনারেট করছে...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Magic Edit Button - Hover overlay for sections
 */
interface MagicEditButtonProps {
  onClick: () => void;
  className?: string;
}

export function MagicEditButton({ onClick, className = '' }: MagicEditButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      Magic Edit
    </button>
  );
}

/**
 * Section Wrapper - Adds hover state and edit button to sections
 */
interface EditableSectionProps {
  sectionName: string;
  sectionLabel: string;
  currentData: unknown;
  isEditMode: boolean;
  onEditRequest: (
    sectionName: string,
    label: string,
    data: unknown,
    position: { top: number; left: number }
  ) => void;
  children: React.ReactNode;
}

export function EditableSection({
  sectionName,
  sectionLabel,
  currentData,
  isEditMode,
  onEditRequest,
  children,
}: EditableSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleEditClick = () => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    onEditRequest(sectionName, sectionLabel, currentData, {
      top: rect.top + window.scrollY,
      left: rect.right + 20,
    });
  };

  return (
    <div
      ref={sectionRef}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Outline */}
      <div 
        className={`absolute inset-0 border-2 border-dashed rounded-2xl pointer-events-none transition-all duration-200 z-10 ${
          isHovered ? 'border-purple-400 bg-purple-50/10' : 'border-transparent'
        }`}
      />
      
      {/* Edit Button */}
      {isHovered && (
        <div className="absolute top-4 right-4 z-20">
          <MagicEditButton onClick={handleEditClick} />
        </div>
      )}
      
      {/* Section Label */}
      {isHovered && (
        <div className="absolute top-4 left-4 z-20 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md">
          {sectionLabel}
        </div>
      )}

      {children}
    </div>
  );
}
