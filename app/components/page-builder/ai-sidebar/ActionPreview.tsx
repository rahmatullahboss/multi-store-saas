/**
 * Action Preview Component
 * 
 * Shows a preview of AI changes before applying,
 * with Apply and Cancel buttons.
 */

import { memo } from 'react';
import { Check, X, Eye } from 'lucide-react';
import type { AIResponse } from '~/lib/grapesjs/types';

interface ActionPreviewProps {
  response: AIResponse;
  onApply: () => void;
  onReject: () => void;
  isApplying?: boolean;
}

function ActionPreviewComponent({ response, onApply, onReject, isApplying }: ActionPreviewProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-blue-700">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">Preview</span>
      </div>

      {/* Explanation */}
      <p className="text-sm text-blue-800">{response.explanation}</p>

      {/* Changes summary */}
      <div className="space-y-1">
        {response.actions.map((action, idx) => (
          <div 
            key={idx}
            className="text-xs bg-white rounded px-2 py-1 text-blue-700 border border-blue-100"
          >
            <span className="font-medium">{action.action}</span>
            {action.changes.styles && (
              <span className="text-blue-500">
                {' → '}Styles: {Object.keys(action.changes.styles).join(', ')}
              </span>
            )}
            {action.changes.content && (
              <span className="text-blue-500">
                {' → '}Content change
              </span>
            )}
            {action.changes.addClass && (
              <span className="text-blue-500">
                {' → '}Add classes: {action.changes.addClass.join(', ')}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onApply}
          disabled={isApplying}
          className={`
            flex-1 flex items-center justify-center gap-1.5 
            px-3 py-2 rounded-lg text-sm font-medium
            transition-colors
            ${isApplying 
              ? 'bg-emerald-300 text-white cursor-wait'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98]'
            }
          `}
        >
          <Check className="w-4 h-4" />
          {isApplying ? 'Applying...' : 'Apply করো'}
        </button>
        <button
          onClick={onReject}
          disabled={isApplying}
          className="
            flex items-center justify-center gap-1.5 
            px-3 py-2 rounded-lg text-sm font-medium
            bg-gray-100 text-gray-600 hover:bg-gray-200
            transition-colors active:scale-[0.98]
          "
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

export const ActionPreview = memo(ActionPreviewComponent);
