/**
 * AI Upgrade Modal
 * 
 * Premium-looking modal shown to free users when they try to use AI features.
 * Features:
 * - Glassmorphism design
 * - Feature comparison
 * - Direct CTA to upgrade
 */

import { Link } from '@remix-run/react';
import { X, Sparkles, Zap, Crown, Check } from 'lucide-react';

interface AIUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingToday?: number;
}

export function AIUpgradeModal({ isOpen, onClose, remainingToday = 0 }: AIUpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-6 text-white">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Unlock AI Magic</h2>
                <p className="text-white/80 text-sm">Get unlimited AI-powered features</p>
              </div>
            </div>

            {remainingToday > 0 && (
              <div className="mt-3 px-3 py-1.5 bg-white/20 rounded-lg inline-block text-sm">
                ⏰ {remainingToday} free requests remaining today
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI Store Setup</p>
                  <p className="text-sm text-gray-500">Generate store name, SEO & products</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-pink-100 rounded-lg">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Magic Editor</p>
                  <p className="text-sm text-gray-500">Edit any section with natural language</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Crown className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Unlimited Requests</p>
                  <p className="text-sm text-gray-500">No daily limits on AI features</p>
                </div>
              </div>
            </div>

            {/* Plan Comparison */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-sm">Free Plan</span>
                <span className="text-gray-400 text-sm">5 AI/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-600 font-semibold">Starter Plan</span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <Check className="w-4 h-4" /> Unlimited AI
                </span>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/app/upgrade"
              className="block w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
            >
              🚀 Upgrade to Starter - ৳999/mo
            </Link>

            <button 
              onClick={onClose}
              className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
