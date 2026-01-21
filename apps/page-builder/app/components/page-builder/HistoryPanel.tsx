/**
 * History Panel - Page Revisions
 */

import { useEffect, useState } from 'react';
import { X, RotateCcw, Clock, Loader2 } from 'lucide-react';
import type { Editor } from 'grapesjs';
import { toast } from 'sonner';

interface Revision {
  id: string;
  pageId: string;
  content: string;
  revisionType: 'auto' | 'manual' | 'publish';
  description: string | null;
  createdAt: number;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  editor?: Editor | null;
}

export default function HistoryPanel({ isOpen, onClose, pageId, editor }: HistoryPanelProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const formatTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'এইমাত্র';
    if (diffMin < 60) return `${diffMin} মিনিট আগে`;
    if (diffHour < 24) return `${diffHour} ঘণ্টা আগে`;
    return `${diffDay} দিন আগে`;
  };

  useEffect(() => {
    if (isOpen && pageId) {
      loadRevisions();
    }
  }, [isOpen, pageId]);

  const loadRevisions = async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/page-revisions?pageId=${pageId}`);
      const data = await res.json() as { revisions?: Revision[]; error?: string };
      if (res.ok) {
        setRevisions(data.revisions || []);
      } else {
        toast.error(data.error || 'রিভিশন লোড করতে ব্যর্থ');
      }
    } catch (e) {
      console.error(e);
      toast.error('রিভিশন লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (rev: Revision) => {
    if (!pageId || !editor) return;
    if (!confirm('এই রিভিশনে ফিরে যেতে চান?')) return;

    setRestoringId(rev.id);
    try {
      const res = await fetch(`/api/page-revisions?action=restore&id=${rev.id}`, { method: 'POST' });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        toast.error(data.error || 'রিভিশন রিস্টোর ব্যর্থ');
        return;
      }

      // Load content into editor
      const projectData = JSON.parse(rev.content);
      editor.loadProjectData(projectData);
      toast.success('রিভিশন রিস্টোর হয়েছে');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('রিভিশন রিস্টোর ব্যর্থ');
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-600" />
            <h3 className="text-sm font-semibold">Revision History</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-6 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> লোড হচ্ছে...
            </div>
          ) : revisions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              কোনো রিভিশন নেই
            </div>
          ) : (
            <div className="divide-y">
              {revisions.map((rev) => (
                <div key={rev.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold">
                      {rev.revisionType === 'auto' ? 'অটো সেভ' : rev.revisionType === 'manual' ? 'ম্যানুয়াল সেভ' : 'পাবলিশ'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatTimeAgo(rev.createdAt)}
                    </p>
                    {rev.description && (
                      <p className="text-[11px] text-gray-600 mt-1">{rev.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRestore(rev)}
                    disabled={restoringId === rev.id}
                    className="px-2 py-1 text-[11px] font-semibold text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                  >
                    {restoringId === rev.id ? (
                      <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> রিস্টোর</span>
                    ) : (
                      <span className="flex items-center gap-1"><RotateCcw size={12} /> রিস্টোর</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
