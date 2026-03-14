/**
 * StoreAIAssistant — AI-powered assistant for the store live editor.
 * Stub component — full implementation coming soon.
 */
export function StoreAIAssistant(props: {
  storeId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onApplySuggestion?: (suggestion: string) => void;
}) {
  if (!props.isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          AI Assistant
        </h3>
        <button
          onClick={props.onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close AI Assistant"
        >
          ✕
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        AI store assistant coming soon. Stay tuned!
      </p>
    </div>
  );
}
