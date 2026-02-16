/**
 * SaveIndicator Component
 *
 * Shows the current save status with relative timestamps.
 * Displays "Saving...", "Saved", or "Saved X ago".
 */

import { useEffect, useState, memo } from 'react';
import { Save, Loader2, Check, Cloud, CloudOff } from 'lucide-react';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges?: boolean;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 5) return 'এইমাত্র';
  if (diffSec < 60) return `${diffSec} সেকেন্ড আগে`;
  if (diffMin < 60) return `${diffMin} মিনিট আগে`;
  if (diffHour < 24) return `${diffHour} ঘন্টা আগে`;
  return date.toLocaleDateString('bn-BD');
}

function SaveIndicatorBase({ isSaving, lastSaved, hasUnsavedChanges = false }: SaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  // Update relative time every 10 seconds
  useEffect(() => {
    if (!lastSaved) return;

    const updateTime = () => {
      setRelativeTime(getRelativeTime(lastSaved));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        <Loader2 size={12} className="animate-spin" />
        <span className="font-medium">সংরক্ষণ হচ্ছে...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
        <CloudOff size={12} />
        <span className="font-medium">অসংরক্ষিত পরিবর্তন</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
        <Cloud size={12} />
        <span className="font-medium">সংরক্ষিত</span>
        <span className="text-green-500">• {relativeTime}</span>
      </div>
    );
  }

  return null;
}

export const SaveIndicator = memo(SaveIndicatorBase);
export default SaveIndicator;
