import { BlocksProvider, SelectorsProvider, useEditorMaybe } from '@grapesjs/react';
import { useState, useEffect, useRef } from 'react';
import { Box, Palette, Settings2, Layers, PaintBucket, LayoutTemplate } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import ThemePanel from './ThemePanel';
import TemplatesPanel from './TemplatesPanel';
import PageSettingsPanel from './PageSettingsPanel';
import StateSelector from './StateSelector';

interface SidebarPanelProps {
  themeConfig?: any;
  onThemeChange?: (config: any) => void;
  pageConfig?: any;
  onPageConfigChange?: (config: any) => void;
  onLoadTemplate?: (templateId: string) => void;
}

export default function SidebarPanel({ 
  themeConfig, 
  onThemeChange, 
  pageConfig,
  onPageConfigChange,
  onLoadTemplate 
}: SidebarPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'widgets' | 'design' | 'structure' | 'settings'>('widgets');
  const [activeDesignSubTab, setActiveDesignSubTab] = useState<'styles' | 'theme' | 'templates'>('styles');
  const editor = useEditorMaybe();
  
  const traitsContainerRef = useRef<HTMLDivElement>(null);
  const stylesContainerRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);

  // Render GrapesJS built-in managers into our containers
  useEffect(() => {
    if (!editor) return;

    // Render Traits Manager
    if (traitsContainerRef.current && activeTab === 'design' && activeDesignSubTab === 'styles') {
      const traitsEl = editor.TraitManager.render();
      traitsContainerRef.current.innerHTML = '';
      traitsContainerRef.current.appendChild(traitsEl);
    }

    // Render Style Manager
    if (stylesContainerRef.current && activeTab === 'design' && activeDesignSubTab === 'styles') {
      const stylesEl = editor.StyleManager.render();
      stylesContainerRef.current.innerHTML = '';
      stylesContainerRef.current.appendChild(stylesEl);
    }

    // Render Layers
    if (layersContainerRef.current && activeTab === 'structure') {
      const layersEl = editor.LayerManager.render();
      layersContainerRef.current.innerHTML = '';
      layersContainerRef.current.appendChild(layersEl);
    }
  }, [editor, activeTab, activeDesignSubTab]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <div className="flex flex-col h-full bg-white border-r border-gray-200 w-72 shadow-sm min-h-0">
        {/* Tab Switcher - Elementor Style */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1.5">
           <button 
             onClick={() => setActiveTab('widgets')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'widgets' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 shadow-indigo-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
           >
              <Box size={16} strokeWidth={2.5} />
              WIDGETS
           </button>
           <button 
             onClick={() => setActiveTab('design')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'design' ? 'bg-white text-blue-600 shadow-sm border border-blue-50 shadow-blue-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
           >
              <Palette size={16} strokeWidth={2.5} />
              DESIGN
           </button>
           <button 
             onClick={() => setActiveTab('structure')}
             className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'structure' ? 'bg-white text-purple-600 shadow-sm border border-purple-50 shadow-purple-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
           >
              <Layers size={16} strokeWidth={2.5} />
              STRUCTURE
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={`p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all ${activeTab === 'settings' ? 'bg-orange-50 text-orange-600 shadow-sm' : ''}`}
             title="Settings"
           >
              <Settings2 size={16} strokeWidth={2.5} />
           </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          {activeTab === 'widgets' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden animate-in fade-in duration-300">
               <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Widgets</h3>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                <BlocksProvider>
                  {({ blocks, dragStart, dragStop }) => {
                    const categories: Record<string, any[]> = {};
                    blocks.forEach((block) => {
                      const cat = block.getCategoryLabel() || 'Uncategorized';
                      if (!categories[cat]) categories[cat] = [];
                      categories[cat].push(block);
                    });

                    return (
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
                                  onDragStart={(ev) => dragStart(block, ev.nativeEvent)}
                                  onDragEnd={() => dragStop()}
                                  className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-indigo-400 hover:shadow-md transition cursor-grab group bg-white"
                                >
                                  <div 
                                    className="text-gray-300 group-hover:text-indigo-600 mb-2 transition transform group-hover:scale-110"
                                    dangerouslySetInnerHTML={{ __html: block.getMedia() || `
                                      <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor"/></svg>
                                    ` }}
                                  />
                                  <span className="text-[9px] font-black text-gray-500 group-hover:text-indigo-700 text-center line-clamp-1 uppercase">
                                    {block.getLabel()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </BlocksProvider>
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
                    STYLES
                 </button>
                 <button 
                   onClick={() => setActiveDesignSubTab('theme')}
                   className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${activeDesignSubTab === 'theme' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <PaintBucket size={12} />
                    THEME
                 </button>
                 <button 
                   onClick={() => setActiveDesignSubTab('templates')}
                   className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-widest flex items-center justify-center gap-1.5 transition-all ${activeDesignSubTab === 'templates' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <LayoutTemplate size={12} />
                    PRESETS
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {activeDesignSubTab === 'styles' && (
                  <div className="p-4 space-y-6">
                    {/* State Selector (Normal/Hover/Focus/Active) */}
                    <StateSelector />
                    
                    {/* Selectors Manager */}
                    <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-50">
                      <SelectorsProvider>
                        {(props) => (
                          <div className="space-y-3">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Active Element</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {props.selectors.map(sel => (
                                  <span key={sel.getLabel()} className="px-2.5 py-1 bg-white text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 shadow-sm">
                                     #{sel.getLabel()}
                                  </span>
                                ))}
                                {props.selectors.length === 0 && (
                                  <p className="text-gray-400 text-[10px] font-medium italic">Select an element to start styling</p>
                                )}
                             </div>
                          </div>
                        )}
                      </SelectorsProvider>
                    </div>

                    {/* Traits Manager */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-500 pl-3">Attributes</h4>
                      <div ref={traitsContainerRef} className="gjs-traits-wrap" />
                    </div>

                    {/* Style Manager */}
                    <div className="space-y-4 pb-10">
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-500 pl-3">Visual Style</h4>
                      <div ref={stylesContainerRef} className="gjs-styles-wrap" />
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
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Document Structure</h3>
               </div>
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div ref={layersContainerRef} className="gjs-layers-wrap" />
               </div>
            </div>
          )}

          {activeTab === 'settings' && pageConfig && onPageConfigChange && (
            <div className="absolute inset-0 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300 text-sm">
               <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Page Settings</h3>
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
