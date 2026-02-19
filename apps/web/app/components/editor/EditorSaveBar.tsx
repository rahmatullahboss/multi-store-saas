/**
 * EditorSaveBar - Floating Save Bar for Visual Editor
 * 
 * Appears when there are unsaved changes in the landing page editor.
 * Provides Reset and Save & Publish actions with optimistic UI.
 */

import { RotateCcw, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface EditorSaveBarProps {
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  isSuccess?: boolean;
}

export function EditorSaveBar({ onReset, onSave, isSaving, isSuccess }: EditorSaveBarProps) {
  const { lang } = useTranslation();

  return (
    <div className="fixed bottom-0 inset-x-0 z-50">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {lang === 'bn' ? 'সেভ হয়েছে! 🎉' : 'Live Updated! 🎉'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="font-medium">
                  {lang === 'bn' ? 'অসংরক্ষিত পরিবর্তন আছে' : 'Unsaved changes'}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Reset button */}
            <button
              type="button"
              onClick={onReset}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              {lang === 'bn' ? 'রিসেট' : 'Reset'}
            </button>

            {/* Save button */}
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || isSuccess}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {lang === 'bn' ? 'সেভ ও পাবলিশ' : 'Save & Publish'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
