/**
 * InlineAddSectionModal
 * 
 * A modal that appears inline in the canvas preview when the user clicks "+" button.
 * Shows options to:
 * 1. Enter custom HTML directly
 * 2. Generate with AI (checks credits first)
 */

import { useState } from 'react';
import { X, Sparkles, Code, Loader2, AlertCircle, CreditCard } from 'lucide-react';

interface InlineAddSectionModalProps {
  position: string;
  onClose: () => void;
  onSubmit: (data: { html: string; css?: string; position: string }) => void;
  onGenerateAI: (prompt: string, position: string) => void;
  aiCredits: number;
  isGenerating?: boolean;
  generatedHtml?: string;
  generatedCss?: string;
}

export function InlineAddSectionModal({
  position,
  onClose,
  onSubmit,
  onGenerateAI,
  aiCredits,
  isGenerating = false,
  generatedHtml,
  generatedCss,
}: InlineAddSectionModalProps) {
  const [mode, setMode] = useState<'choose' | 'manual' | 'ai'>('choose');
  const [manualHtml, setManualHtml] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  
  const AI_COST = 8; // Credits needed for AI generation
  const hasEnoughCredits = aiCredits >= AI_COST;

  // If AI generated content is available, show it in manual mode
  const displayedHtml = generatedHtml || manualHtml;
  const displayedCss = generatedCss || '';

  const handleSubmit = () => {
    if (!displayedHtml.trim()) return;
    onSubmit({
      html: displayedHtml,
      css: displayedCss,
      position,
    });
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim() || !hasEnoughCredits) return;
    onGenerateAI(aiPrompt, position);
  };

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div>
            <h3 className="font-bold text-gray-900">কাস্টম সেকশন যোগ করুন</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              পজিশন: <span className="font-medium text-violet-600">{position}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {mode === 'choose' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Manual Entry */}
              <button
                onClick={() => setMode('manual')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition group text-left"
              >
                <Code className="w-8 h-8 text-gray-400 group-hover:text-violet-500 mb-3" />
                <h4 className="font-semibold text-gray-900">কাস্টম HTML</h4>
                <p className="text-xs text-gray-500 mt-1">নিজের HTML/CSS কোড পেস্ট করুন</p>
              </button>

              {/* AI Generate */}
              <button
                onClick={() => setMode('ai')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition group text-left relative"
              >
                <Sparkles className="w-8 h-8 text-gray-400 group-hover:text-violet-500 mb-3" />
                <h4 className="font-semibold text-gray-900">AI দিয়ে তৈরি</h4>
                <p className="text-xs text-gray-500 mt-1">বর্ণনা দিন, AI কোড লিখে দেবে</p>
                
                {/* Credit Badge */}
                <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
                  hasEnoughCredits ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {AI_COST} ক্রেডিট
                </div>
              </button>
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-4">
              <textarea
                value={displayedHtml}
                onChange={(e) => setManualHtml(e.target.value)}
                placeholder={'<style>\n  .my-section { padding: 2rem; }\n</style>\n\n<div class="my-section">\n  আপনার কন্টেন্ট এখানে...\n</div>'}
                rows={12}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choose')}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  ← পিছনে
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!displayedHtml.trim()}
                  className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          )}

          {mode === 'ai' && (
            <div className="space-y-4">
              {/* Credit Warning */}
              {!hasEnoughCredits && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">পর্যাপ্ত ক্রেডিট নেই</p>
                    <p className="text-xs text-red-600 mt-1">
                      AI ফিচার ব্যবহার করতে আপনার {AI_COST} ক্রেডিট দরকার। বর্তমানে আছে: {aiCredits}
                    </p>
                    <a
                      href="/app/credits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      ক্রেডিট কিনুন
                    </a>
                  </div>
                </div>
              )}

              {/* AI Credit Info */}
              {hasEnoughCredits && (
                <div className="flex items-center justify-between px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="text-sm text-violet-700">AI জেনারেশন</span>
                  </div>
                  <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                    খরচ: {AI_COST} ক্রেডিট
                  </span>
                </div>
              )}

              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  কী ধরনের সেকশন চান সেটা বর্ণনা করুন
                </label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="যেমন: ডেলিভারি প্রসেস টাইমলাইন, প্রোডাক্ট প্রাইসিং কার্ড..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  disabled={!hasEnoughCredits}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAIGenerate(); }}
                />
              </div>

              {/* Generated Preview */}
              {generatedHtml && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    জেনারেট হওয়া কোড (এডিট করতে পারবেন)
                  </label>
                  <textarea
                    value={displayedHtml}
                    onChange={(e) => setManualHtml(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choose')}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  ← পিছনে
                </button>
                
                {!generatedHtml ? (
                  <button
                    onClick={handleAIGenerate}
                    disabled={!aiPrompt.trim() || !hasEnoughCredits || isGenerating}
                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        জেনারেট করুন
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
                  >
                    ✓ সেকশন যোগ করুন
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
