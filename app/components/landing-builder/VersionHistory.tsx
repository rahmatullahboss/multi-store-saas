/**
 * Version History Component
 * 
 * Shows list of published versions with restore functionality.
 */

import { useFetcher } from '@remix-run/react';
import { History, RotateCcw, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Version {
  id: number;
  versionLabel: string | null;
  publishedAt: string | Date | null;
  createdAt: string | Date | null;
}

interface VersionHistoryProps {
  versions: Version[];
  currentConfigHash?: string;
  language?: 'bn' | 'en';
}

export function VersionHistory({ versions, language = 'en' }: VersionHistoryProps) {
  const fetcher = useFetcher();
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = (versionId: number) => {
    if (!confirm(language === 'bn' 
      ? 'এই ভার্সন রিস্টোর করতে চান? বর্তমান ড্রাফট মুছে যাবে।' 
      : 'Restore this version? Current draft will be overwritten.')) {
      return;
    }
    setRestoringId(versionId);
    fetcher.submit(
      { intent: 'restore-version', versionId: versionId.toString() },
      { method: 'post' }
    );
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (versions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>{language === 'bn' ? 'কোনো ভার্সন হিস্ট্রি নেই' : 'No version history yet'}</p>
        <p className="text-xs text-gray-400 mt-1">
          {language === 'bn' 
            ? 'পাবলিশ করলে ভার্সন সেভ হবে' 
            : 'Versions are saved when you publish'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">
        {language === 'bn' 
          ? `${versions.length} টি ভার্সন পাওয়া গেছে` 
          : `${versions.length} version${versions.length > 1 ? 's' : ''} found`}
      </p>
      
      {versions.slice(0, 10).map((version, index) => (
        <div 
          key={version.id}
          className={`p-3 rounded-lg border transition ${
            index === 0 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {index === 0 && (
                  <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                    {language === 'bn' ? 'বর্তমান' : 'Current'}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-900 truncate">
                  {version.versionLabel || `v${versions.length - index}`}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatDate(version.publishedAt || version.createdAt)}
              </div>
            </div>
            
            {index > 0 && (
              <button
                type="button"
                onClick={() => handleRestore(version.id)}
                disabled={restoringId === version.id}
                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                title={language === 'bn' ? 'রিস্টোর করুন' : 'Restore'}
              >
                {restoringId === version.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
      
      {versions.length > 10 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          {language === 'bn' 
            ? `আরো ${versions.length - 10} টি ভার্সন আছে` 
            : `${versions.length - 10} more versions`}
        </p>
      )}
    </div>
  );
}
