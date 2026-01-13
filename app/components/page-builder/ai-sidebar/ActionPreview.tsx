/**
 * Action Preview Component
 * 
 * Shows a preview of AI-suggested changes with
 * Apply and Cancel buttons.
 */

import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { AIResponse } from '~/lib/grapesjs/types';

interface ActionPreviewProps {
  response: AIResponse;
  onApply: () => void;
  onReject: () => void;
  isApplying?: boolean;
}

export default function ActionPreview({ 
  response, 
  onApply, 
  onReject, 
  isApplying = false 
}: ActionPreviewProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-indigo-500">✨</span>
          <span className="text-gray-900 font-bold text-sm">Preview Changes</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1"
        >
          {showDetails ? (
            <>Hide <ChevronUp size={12} /></>
          ) : (
            <>Details <ChevronDown size={12} /></>
          )}
        </button>
      </div>

      {/* Explanation */}
      <p className="text-gray-700 text-sm leading-relaxed">{response.explanation}</p>

      {/* Details (expandable) */}
      {showDetails && (
        <div className="bg-white rounded-lg p-3 space-y-2 text-xs font-mono border border-indigo-100">
          {response.actions.map((action, i) => (
            <div key={i} className="text-gray-600">
              <span className="text-indigo-600 font-bold">{action.action}</span>
              <pre className="mt-1 text-gray-500 overflow-x-auto text-[10px] whitespace-pre-wrap">
                {JSON.stringify(action.changes, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onApply}
          disabled={isApplying}
          className="
            flex-1 py-2.5 rounded-lg text-sm font-bold
            bg-indigo-600 text-white
            hover:bg-indigo-700 disabled:bg-indigo-400
            transition-colors flex items-center justify-center gap-2
          "
        >
          {isApplying ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Check size={16} />
              Apply করুন
            </>
          )}
        </button>
        <button
          onClick={onReject}
          disabled={isApplying}
          className="
            flex-1 py-2.5 rounded-lg text-sm font-bold
            bg-white text-gray-700 border border-gray-200
            hover:bg-gray-50 disabled:opacity-50
            transition-colors flex items-center justify-center gap-2
          "
        >
          <X size={16} />
          Cancel
        </button>
      </div>

      {/* Hint */}
      <p className="text-gray-400 text-[10px] text-center">
        Apply করার পর Undo করতে পারবেন
      </p>
    </div>
  );
}
