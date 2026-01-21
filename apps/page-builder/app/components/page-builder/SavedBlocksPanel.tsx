/**
 * Saved Blocks Panel
 * 
 * Displays saved reusable blocks that users can drag into the canvas.
 * Supports search, category filtering, and block management.
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Loader2, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Editor } from 'grapesjs';

interface SavedBlock {
  id: string;
  name: string;
  category: string;
  description: string | null;
  content: string;
  thumbnail: string | null;
  usageCount: number;
  createdAt: number;
}

interface SavedBlocksPanelProps {
  editor: Editor;
}

const CATEGORIES = [
  { id: 'all', label: 'সব' },
  { id: 'custom', label: 'Custom' },
  { id: 'hero', label: 'Hero' },
  { id: 'features', label: 'Features' },
  { id: 'cta', label: 'CTA' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'footer', label: 'Footer' },
];

export default function SavedBlocksPanel({ editor }: SavedBlocksPanelProps) {
  const [blocks, setBlocks] = useState<SavedBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load saved blocks
  const loadBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/saved-blocks?${params}`);
      const data = await response.json() as { blocks?: SavedBlock[]; error?: string };

      if (response.ok) {
        setBlocks(data.blocks || []);
      } else {
        console.error('Failed to load blocks:', data.error);
      }
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Load on mount and when filters change
  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // Listen for refresh event (after saving new block)
  useEffect(() => {
    const handleRefresh = () => {
      loadBlocks();
    };
    window.addEventListener('refresh-saved-blocks', handleRefresh);
    return () => window.removeEventListener('refresh-saved-blocks', handleRefresh);
  }, [loadBlocks]);

  // Insert block into canvas
  const handleInsertBlock = async (block: SavedBlock) => {
    try {
      const content = JSON.parse(block.content);
      
      // Add to canvas
      const wrapper = editor.getWrapper();
      if (wrapper) {
        editor.addComponents(content);
        toast.success(`"${block.name}" যোগ হয়েছে`);

        // Update usage count
        await fetch(`/api/saved-blocks?id=${block.id}`, {
          method: 'PATCH',
        });

        // Update local state
        setBlocks(prev => prev.map(b => 
          b.id === block.id ? { ...b, usageCount: b.usageCount + 1 } : b
        ));
      }
    } catch (error) {
      console.error('Failed to insert block:', error);
      toast.error('Block যোগ করতে ব্যর্থ');
    }
  };

  // Delete block
  const handleDeleteBlock = async (blockId: string, blockName: string) => {
    if (!confirm(`"${blockName}" ডিলিট করতে চান?`)) {
      return;
    }

    setDeletingId(blockId);
    try {
      const response = await fetch(`/api/saved-blocks?id=${blockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlocks(prev => prev.filter(b => b.id !== blockId));
        toast.success('Block ডিলিট হয়েছে');
      } else {
        toast.error('Block ডিলিট করতে ব্যর্থ');
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
      toast.error('Block ডিলিট করতে ব্যর্থ');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Block খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100 bg-gray-50/50">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Blocks Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mb-2" />
            <span className="text-xs">লোড হচ্ছে...</span>
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center">
            <Package size={32} className="mb-2 opacity-50" />
            <p className="text-xs font-medium">কোনো সেভ করা Block নেই</p>
            <p className="text-[10px] mt-1 text-gray-400">
              যেকোনো element এ Right-click করে "Save as Block" চাপুন
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {blocks.map(block => (
              <div
                key={block.id}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
              >
                {/* Block Preview / Thumbnail */}
                <div 
                  onClick={() => handleInsertBlock(block)}
                  className="h-20 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center cursor-pointer hover:from-primary/5 hover:to-primary/10 transition-colors"
                >
                  {block.thumbnail ? (
                    <img 
                      src={block.thumbnail} 
                      alt={block.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Package size={24} className="text-gray-300 mx-auto mb-1" />
                      <span className="text-[10px] text-gray-400 font-medium">{block.category}</span>
                    </div>
                  )}
                </div>

                {/* Block Info */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 truncate">
                        {block.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {block.usageCount} বার ব্যবহৃত
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id, block.name);
                      }}
                      disabled={deletingId === block.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === block.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  {/* Insert Button */}
                  <button
                    onClick={() => handleInsertBlock(block)}
                    className="w-full mt-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-lg hover:bg-primary hover:text-white transition flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    যোগ করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
