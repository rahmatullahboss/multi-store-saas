/**
 * Unsaved Changes Warning Hook
 * 
 * Provides navigation blocking when there are unsaved changes in a form.
 * Also handles cleanup of orphaned resources (like uploaded images) on abandon.
 * 
 * Features:
 * - Browser beforeunload warning on tab close
 * - Remix useBlocker for in-app navigation
 * - Beautiful modal UI for confirmation
 * - Cleanup callback for abandoned resources
 */

import { useEffect, useCallback, useState } from 'react';
import { useBlocker } from '@remix-run/react';
import { AlertTriangle } from 'lucide-react';

interface UseUnsavedChangesOptions {
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Message to show in browser beforeunload dialog */
  message?: string;
  /** Callback to run when user confirms leaving (for cleanup) */
  onAbandon?: () => void;
}

interface UseUnsavedChangesReturn {
  /** The blocker state from Remix */
  blocker: ReturnType<typeof useBlocker>;
  /** Component to render the confirmation modal */
  ConfirmationModal: React.FC;
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  message = 'আপনার অসংরক্ষিত পরিবর্তন হারিয়ে যাবে। আপনি কি নিশ্চিত?',
  onAbandon,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  // Track if cleanup was already done
  const [cleanupDone, setCleanupDone] = useState(false);

  // Block in-app navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle browser beforeunload (tab close, refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers ignore this message but still show a dialog
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Handle cleanup when user leaves without saving
  useEffect(() => {
    const handleUnload = () => {
      if (hasUnsavedChanges && onAbandon && !cleanupDone) {
        // Note: This runs on actual page unload
        // For in-app navigation, we handle it in the modal
        onAbandon();
        setCleanupDone(true);
      }
    };

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [hasUnsavedChanges, onAbandon, cleanupDone]);

  // Handle proceed with cleanup
  const handleProceed = useCallback(() => {
    if (onAbandon && !cleanupDone) {
      onAbandon();
      setCleanupDone(true);
    }
    blocker.proceed?.();
  }, [blocker, onAbandon, cleanupDone]);

  // Modal component
  const ConfirmationModal: React.FC = () => {
    if (blocker.state !== 'blocked') return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            অসংরক্ষিত পরিবর্তন রয়েছে!
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            আপনার করা পরিবর্তনগুলো এখনও সংরক্ষণ করা হয়নি।
            এই পেজ ছেড়ে গেলে সব তথ্য মুছে যাবে।
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => blocker.reset?.()}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              থাকুন
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              বের হোন
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    blocker,
    ConfirmationModal,
  };
}

/**
 * Helper function to delete an image from R2
 * Used for cleanup when abandoning a form with uploaded images
 */
export async function deleteOrphanedImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  
  try {
    const formData = new FormData();
    formData.append('imageUrl', imageUrl);
    
    // Use fetch with keepalive for reliability during navigation
    fetch('/api/delete-image', {
      method: 'POST',
      body: formData,
      keepalive: true, // Allows request to complete after page unload
    }).catch(() => {}); // Ignore errors on cleanup
  } catch {
    // Silent fail - cleanup is best effort
  }
}
