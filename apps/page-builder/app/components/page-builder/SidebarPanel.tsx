import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Box, Palette, Settings2, Layers, PaintBucket, LayoutTemplate } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import ThemePanel from './ThemePanel';
import TemplatesPanel from './TemplatesPanel';
import PageSettingsPanel from './PageSettingsPanel';
import StateSelector from './StateSelector';
import StyleControls from './StyleControls';

interface SidebarPanelProps {
  themeConfig?: any;
  onThemeChange?: (config: any) => void;
  pageConfig?: any;
  onPageConfigChange?: (config: any) => void;
  onLoadTemplate?: (templateId: string) => void;
  activeTab: 'widgets' | 'design' | 'structure' | 'settings';
  onTabChange: (tab: 'widgets' | 'design' | 'structure' | 'settings') => void;
  editor?: any;
}

function SidebarPanelBase({
  themeConfig,
  onThemeChange,
  pageConfig,
  onPageConfigChange,
  onLoadTemplate,
  activeTab,
  onTabChange,
  editor
}: SidebarPanelProps) {
  const { t } = useTranslation();
  const [activeDesignSubTab, setActiveDesignSubTab] = useState<'styles' | 'theme' | 'templates'>('styles');

  const traitsContainerRef = useRef<HTMLDivElement>(null);
  const stylesContainerRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);

  // Use refs to store blocks to prevent unnecessary re-renders
  const blocksRef = useRef<any[]>([]);
  const [blocksVersion, setBlocksVersion] = useState(0);
  const [selectors, setSelectors] = useState<any[]>([]);

  // Define refreshSelectors at component level (NOT inside useEffect)
  const refreshSelectors = useCallback(() => {
    if (!editor) return;
    const selected = editor.getSelected();
    if (selected) {
      const newSelectors = selected.getSelectors().models || [];
      setSelectors(prev => {
        // Only update if different
        if (prev.length !== newSelectors.length) return newSelectors;
        const same = prev.every((s: any, i: number) => s === newSelectors[i]);
        return same ? prev : newSelectors;
      });
    } else {
      setSelectors(prev => prev.length === 0 ? prev : []);
    }
  }, [editor]);

  // Fetch Blocks only once when editor is ready (blocks rarely change)
  useEffect(() => {
    if (!editor) return;

    // Load blocks only once - they don't change during editing
    const loadBlocks = () => {
      const allBlocks = editor.Blocks.getAll();
      const newBlockIds = allBlocks.map((b: any) => b.getId()).join(',');
      const oldBlockIds = blocksRef.current.map((b: any) => b.getId()).join(',');

      // Only update if blocks actually changed
      if (newBlockIds !== oldBlockIds) {
        blocksRef.current = [...allBlocks];
        setBlocksVersion(v => v + 1);
      }
    };

    loadBlocks();
    refreshSelectors();

    // Event Listeners - only listen to block changes, not every selection
    editor.on('block:add block:remove', loadBlocks);
    // For selectors, debounce to avoid rapid updates
    let selectorTimeout: NodeJS.Timeout;
    const debouncedRefreshSelectors = () => {
      clearTimeout(selectorTimeout);
      selectorTimeout = setTimeout(refreshSelectors, 50);
    };
    editor.on('component:selected component:deselected', debouncedRefreshSelectors);

    return () => {
      editor.off('block:add block:remove', loadBlocks);
      editor.off('component:selected component:deselected', debouncedRefreshSelectors);
      clearTimeout(selectorTimeout);
    };
  }, [editor, refreshSelectors]);

  // Get blocks from ref
  const blocks = blocksRef.current;

  // Render GrapesJS built-in managers into our containers
  useEffect(() => {
    if (!editor) return;

    try {
      // Render Traits Manager
      if (traitsContainerRef.current && activeTab === 'design' && activeDesignSubTab === 'styles') {
        if (editor.TraitManager && typeof editor.TraitManager.render === 'function') {
          const traitsEl = editor.TraitManager.render();
          if (traitsEl) {
            traitsContainerRef.current.innerHTML = '';
            traitsContainerRef.current.appendChild(traitsEl);
          }
        }
      }

      // Render Style Manager
      if (stylesContainerRef.current && activeTab === 'design' && activeDesignSubTab === 'styles') {
        if (editor.StyleManager && typeof editor.StyleManager.render === 'function') {
          const stylesEl = editor.StyleManager.render();
          if (stylesEl) {
            stylesContainerRef.current.innerHTML = '';
            stylesContainerRef.current.appendChild(stylesEl);
          }
        }
      }

      // Render Layers
      if (layersContainerRef.current && activeTab === 'structure') {
        if (editor.LayerManager && typeof editor.LayerManager.render === 'function') {
          const layersEl = editor.LayerManager.render();
          if (layersEl) {
            layersContainerRef.current.innerHTML = '';
            layersContainerRef.current.appendChild(layersEl);
          }
        }
      }
    } catch (e) {
      console.warn('SidebarPanel: Error rendering GrapesJS managers, editor may not be fully initialized', e);
    }
  }, [editor, activeTab, activeDesignSubTab]);

  // CATEGORIZE BLOCKS
  const categories: Record<string, any[]> = {};
  blocks.forEach((block) => {
    const cat = block.getCategoryLabel() || t('uncategorized');
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(block);
  });

  const handleDragStart = (block: any, ev: React.DragEvent) => {
    // Use GrapesJS BlockManager's built-in drag functionality
    if (editor?.BlockManager?.startDrag) {
      editor.BlockManager.startDrag(block, ev.nativeEvent);
    } else {
      // Fallback: Set the block content as drag data
      ev.dataTransfer.setData('text/html', block.getContent() || '');
      ev.dataTransfer.effectAllowed = 'copy';
    }
  };

  const handleDragEnd = (ev: React.DragEvent) => {
    // Use GrapesJS BlockManager's built-in drag end
    if (editor?.BlockManager?.endDrag) {
      editor.BlockManager.endDrag();
    }
  };

  // Click-to-insert for mobile devices (since drag/drop doesn't work on touch)
  const handleBlockClick = (block: any) => {
    if (!editor) return;
    
    try {
      let content = block.get?.('content') || block.getContent?.();
      
      // Handle lazy content (function)
      if (typeof content === 'function') {
        content = content();
      }
      
      if (!content) {
        console.warn('Block has no content');
        return;
      }
      
      // Add block to canvas
      const components = editor.addComponents(content);
      
      // Scroll to and select the new component
      if (components && components.length > 0) {
        const lastComp = components[components.length - 1];
        editor.select(lastComp);
        lastComp.scrollIntoView?.();
      }
      
      // Close sidebar on mobile after inserting
      if (window.innerWidth < 768) {
        // Trigger sidebar close if we're on mobile
        window.dispatchEvent(new CustomEvent('close-mobile-sidebar'));
      }
    } catch (e) {
      console.error('Failed to insert block:', e);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 5px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
        /* Firefox support */
        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #3b82f6 #f1f5f9;
        }
        
        /* === FORCE LIGHT MODE FOR ALL GRAPES UI === */
        .gjs-one-bg {
          background-color: #ffffff !important;
        }
        .gjs-two-color {
          color: #1e293b !important;
        }
        .gjs-three-bg {
          background-color: #f8fafc !important;
        }
        .gjs-four-color,
        .gjs-four-color-h:hover {
          color: #3b82f6 !important;
        }
        
        /* Base GrapesJS panels */
        .gjs-pn-panel,
        .gjs-pn-views-container,
        .gjs-cv-canvas {
          background-color: #ffffff !important;
        }
        
        /* All buttons and controls */
        .gjs-pn-btn {
          color: #64748b !important;
        }
        .gjs-pn-btn:hover,
        .gjs-pn-active {
          color: #3b82f6 !important;
        }
        
        /* GrapesJS Style Manager Overrides */
        .gjs-sm-sector {
          background: transparent !important;
          border: none !important;
        }
        .gjs-sm-sector-title {
          background: #f8fafc !important;
          color: #1e293b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
          padding: 10px 12px !important;
        }
        .gjs-sm-property {
          margin: 8px 0 !important;
        }
        .gjs-sm-property .gjs-sm-label {
          color: #64748b !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .gjs-sm-property .gjs-field {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
        }
        .gjs-sm-property .gjs-field input,
        .gjs-sm-property .gjs-field select {
          color: #1e293b !important;
          font-size: 12px !important;
          background: transparent !important;
        }
        .gjs-sm-property .gjs-field:focus-within {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Trait Manager Overrides */
        .gjs-trt-traits {
          padding: 0 !important;
        }
        .gjs-trt-trait {
          padding: 8px 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .gjs-trt-trait:last-child {
          border-bottom: none !important;
        }
        .gjs-trt-trait .gjs-label {
          color: #64748b !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
        }
        .gjs-trt-trait .gjs-field {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
        }
        .gjs-trt-trait .gjs-field input,
        .gjs-trt-trait .gjs-field select {
          color: #1e293b !important;
          font-size: 12px !important;
          padding: 8px 10px !important;
        }
        
        /* Layer Manager Overrides */
        .gjs-layers {
          background: transparent !important;
        }
        .gjs-layer {
          background: #f8fafc !important;
          border-radius: 8px !important;
          margin: 4px 0 !important;
          border: 1px solid #e2e8f0 !important;
        }
        .gjs-layer:hover {
          border-color: #3b82f6 !important;
          border-width: 1px;
        }
        .gjs-layer.gjs-selected {
          background: #eff6ff !important;
          border-color: #3b82f6 !important;
        }
        .gjs-layer-title {
          color: #1e293b !important;
          font-size: 11px !important;
          font-weight: 500 !important;
        }
        .gjs-layer-vis {
          color: #64748b !important;
        }
        
        /* Style Manager Overflow Fixes */
        .gjs-sm-sector {
          min-width: 0 !important;
          overflow: visible !important;
        }
        .gjs-sm-sector-title {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .gjs-sm-property .gjs-sm-label {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          min-width: 0 !important;
          max-width: 90px !important;
        }
        .gjs-sm-composite .gjs-sm-properties {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 4px !important;
        }
        .gjs-sm-composite .gjs-sm-property {
          min-width: 0 !important;
          flex: 1 1 40% !important;
        }
        .gjs-sm-property .gjs-sm-icon {
          display: none !important;
        }
      `}} />

      <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 shadow-sm min-h-0">
        {/* Tab Switcher - Elementor Style */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1.5">
          <button
            onClick={() => onTabChange('widgets')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'widgets' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 shadow-indigo-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Box size={16} strokeWidth={2.5} />
            {t('widgets')}
          </button>
          <button
            onClick={() => onTabChange('design')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'design' ? 'bg-white text-blue-600 shadow-sm border border-blue-50 shadow-blue-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Palette size={16} strokeWidth={2.5} />
            {t('design')}
          </button>
          <button
            onClick={() => onTabChange('structure')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'structure' ? 'bg-white text-purple-600 shadow-sm border border-purple-50 shadow-purple-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Layers size={16} strokeWidth={2.5} />
            {t('structure')}
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all ${activeTab === 'settings' ? 'bg-orange-50 text-orange-600 shadow-sm' : ''}`}
            title={t('settings')}
          >
            <Settings2 size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          {activeTab === 'widgets' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('availableWidgets')}</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                  {Object.entries(categories).map(([catLabel, catBlocks]) => (
                    <div key={catLabel}>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {catLabel}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {catBlocks.map((block) => (
                          <div
                            key={block.getId()}
                            draggable
                            onDragStart={(ev) => handleDragStart(block, ev)}
                            onDragEnd={(ev) => handleDragEnd(ev)}
                            onClick={() => handleBlockClick(block)}
                            onTouchEnd={(ev) => {
                              // Prevent ghost click on touch devices
                              ev.preventDefault();
                              handleBlockClick(block);
                            }}
                            className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-indigo-400 hover:shadow-md transition cursor-pointer md:cursor-grab group bg-white active:scale-95 active:bg-indigo-50"
                          >
                            <div
                              className="text-gray-300 group-hover:text-indigo-600 mb-2 transition transform group-hover:scale-110 pointer-events-none"
                              dangerouslySetInnerHTML={{
                                __html: block.getMedia() || `
                                  <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor"/></svg>
                                ` }}
                            />
                            <span className="text-[9px] font-black text-gray-500 group-hover:text-indigo-700 text-center line-clamp-1 uppercase pointer-events-none">
                              {block.getLabel()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
              {/* Sub-tabs for Design */}
              <div className="flex p-2 gap-1 border-b border-gray-50 bg-gray-50/30">
                <button
                  onClick={() => setActiveDesignSubTab('styles')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${activeDesignSubTab === 'styles' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Palette size={12} />
                  {t('styles')}
                </button>
                <button
                  onClick={() => setActiveDesignSubTab('theme')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${activeDesignSubTab === 'theme' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <PaintBucket size={12} />
                  {t('theme')}
                </button>
                <button
                  onClick={() => setActiveDesignSubTab('templates')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${activeDesignSubTab === 'templates' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutTemplate size={12} />
                  {t('presets')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {activeDesignSubTab === 'styles' && (
                  <div className="p-4 space-y-6">
                    {/* State Selector (Normal/Hover/Focus/Active) */}
                    <StateSelector editor={editor} />

                    {/* Selectors Manager */}
                    <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">{t('activeElement')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectors.map(sel => (
                            <span key={sel.getLabel()} className="px-2.5 py-1 bg-white text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 shadow-sm">
                              #{sel.getLabel()}
                            </span>
                          ))}
                          {selectors.length === 0 && (
                            <p className="text-gray-400 text-[10px] font-medium italic">{t('selectElementHint')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Traits Manager */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-500 pl-3">{t('attributes')}</h4>
                      <div ref={traitsContainerRef} className="gjs-traits-wrap" />
                    </div>

                    {/* Style Manager - Custom "Elementor-like" Controls */}
                    <div className="space-y-4 pb-10">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-500 pl-3">{t('visualStyle')}</h4>
                      {editor && <StyleControls editor={editor} />}
                    </div>
                  </div>
                )}

                {activeDesignSubTab === 'theme' && themeConfig && onThemeChange && (
                  <ThemePanel config={themeConfig} onChange={onThemeChange} />
                )}

                {activeDesignSubTab === 'templates' && onLoadTemplate && (
                  <TemplatesPanel onLoadTemplate={onLoadTemplate} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('docStructure')}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div ref={layersContainerRef} className="gjs-layers-wrap" />
              </div>
            </div>
          )}

          {activeTab === 'settings' && pageConfig && onPageConfigChange && (
            <div className="absolute inset-0 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300 text-sm">
              <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('pageSettings')}</h3>
              </div>
              <div className="flex-1 overflow-y-auto relative">
                <PageSettingsPanel config={pageConfig} onChange={onPageConfigChange} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Memoized export to prevent flickering from parent re-renders
const SidebarPanel = memo(SidebarPanelBase);
export default SidebarPanel;
