import { useState, useEffect } from 'react';
import { X, Search, Layout, Sparkles, Box, Check } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface BlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: any;
}

export default function BlockLibraryModal({ isOpen, onClose, editor }: BlockLibraryModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && editor) {
      const allBlocks = editor.BlockManager.getAll().models;
      setBlocks(allBlocks);
    }
  }, [isOpen, editor]);

  const handleInsert = (block: any) => {
    if (!editor) return;
    
    // Add block to the center of the canvas or at the end
    const content = block.get('content');
    editor.addComponents(content);
    
    // Scroll to new components
    const lastComp = editor.getComponents().last();
    if (lastComp) {
        editor.select(lastComp);
        lastComp.scrollIntoView();
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const categories = [t('all'), ...Array.from(new Set(blocks.map(b => b.getCategoryLabel() || t('uncategorized'))))];
  
  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = block.getLabel().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === t('all') || block.getCategoryLabel() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight">{t('blockLibrary')}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('blockLibraryDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder={t('searchBlocks')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"
              />
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar / Categories */}
          <div className="w-48 border-r border-gray-100 p-4 overflow-y-auto hidden md:block bg-gray-50/30">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">{t('categories')}</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeCategory === cat 
                      ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 shadow-indigo-100/10 transition-all scale-105 z-10' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
            {filteredBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Box size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">{t('noBlocksFound')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlocks.map(block => (
                  <div 
                    key={block.getId()}
                    className="group border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 flex flex-col bg-gray-50/30"
                  >
                    {/* Visual Preview */}
                    <div className="h-40 bg-white flex items-center justify-center p-6 relative overflow-hidden border-b border-gray-50">
                       <div 
                         className="text-gray-300 scale-150 transition-transform duration-500 group-hover:scale-[1.8] group-hover:text-indigo-600/20"
                         dangerouslySetInnerHTML={{ __html: block.getMedia() || '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>' }}
                       />
                       
                       {/* Overlay Action */}
                       <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                          <button 
                            onClick={() => handleInsert(block)}
                            className="bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-700 active:scale-95"
                          >
                            {t('insertBlock')}
                          </button>
                       </div>

                       {/* New/Premium Badge */}
                       {block.getCategoryLabel() === 'Premium Designs' && (
                         <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[9px] font-black tracking-widest uppercase shadow-lg">
                           <Sparkles size={8} />
                           {t('premiumBadge')}
                         </div>
                       )}
                    </div>

                    {/* Footer / Meta */}
                    <div className="p-4 bg-white flex items-center justify-between">
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors capitalize">{block.getLabel()}</h4>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{block.getCategoryLabel()}</p>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                          <Check size={14} strokeWidth={3} />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between px-8">
           <div className="text-[10px] text-gray-400 font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {filteredBlocks.length} {t('blocksAvailable')}
           </div>
           <p className="text-[10px] text-gray-400 font-bold">{t('blockLibraryTip')}</p>
        </div>
       </div>
    </div>
  );
}
