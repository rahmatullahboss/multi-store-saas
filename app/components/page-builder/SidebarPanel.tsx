import { BlocksProvider, SelectorsProvider, useEditorMaybe } from '@grapesjs/react';
import { useState, useEffect, useRef } from 'react';
import { Box, Palette, Settings2, Layers, PaintBucket, LayoutTemplate } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import ThemePanel from './ThemePanel';
import TemplatesPanel from './TemplatesPanel';

interface SidebarPanelProps {
  themeConfig?: any;
  onThemeChange?: (config: any) => void;
  onLoadTemplate?: (templateId: string) => void;
}

export default function SidebarPanel({ themeConfig, onThemeChange, onLoadTemplate }: SidebarPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'templates' | 'elements' | 'styles' | 'layers' | 'theme'>('templates');
  const editor = useEditorMaybe();
  
  const traitsContainerRef = useRef<HTMLDivElement>(null);
  const stylesContainerRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);

  // Render GrapesJS built-in managers into our containers
  useEffect(() => {
    if (!editor) return;

    // Render Traits Manager
    if (traitsContainerRef.current && activeTab === 'styles') {
      const traitsEl = editor.TraitManager.render();
      traitsContainerRef.current.innerHTML = '';
      traitsContainerRef.current.appendChild(traitsEl);
    }

    // Render Style Manager
    if (stylesContainerRef.current && activeTab === 'styles') {
      const stylesEl = editor.StyleManager.render();
      stylesContainerRef.current.innerHTML = '';
      stylesContainerRef.current.appendChild(stylesEl);
    }

    // Render Layers
    if (layersContainerRef.current && activeTab === 'layers') {
      const layersEl = editor.LayerManager.render();
      layersContainerRef.current.innerHTML = '';
      layersContainerRef.current.appendChild(layersEl);
    }
  }, [editor, activeTab]);

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

      <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shadow-sm min-h-0">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 gap-1">
           {/* Templates Tab */}
           <button 
             onClick={() => setActiveTab('templates')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'templates' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
             title="Templates"
           >
              <LayoutTemplate size={14} strokeWidth={2.5} />
              <span className="sr-only">Templates</span>
           </button>
           <button 
             onClick={() => setActiveTab('elements')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'elements' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
             title="Add Elements"
           >
              <Box size={14} strokeWidth={2.5} />
              <span className="sr-only">Elements</span>
           </button>
           <button 
             onClick={() => setActiveTab('styles')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'styles' ? 'bg-white text-blue-600 shadow-sm border border-blue-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
             title="Style Editor"
           >
              <Palette size={14} strokeWidth={2.5} />
              <span className="sr-only">Styles</span>
           </button>
           <button 
             onClick={() => setActiveTab('layers')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'layers' ? 'bg-white text-purple-600 shadow-sm border border-purple-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
             title="Layers"
           >
              <Layers size={14} strokeWidth={2.5} />
              <span className="sr-only">Layers</span>
           </button>
           
           {/* New Theme Tab */}
           <button 
             onClick={() => setActiveTab('theme')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'theme' ? 'bg-white text-pink-600 shadow-sm border border-pink-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
             title="Global Theme"
           >
              <PaintBucket size={14} strokeWidth={2.5} />
              <span className="sr-only">Theme</span>
           </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          {activeTab === 'elements' ? (
            <BlocksProvider>
              {({ blocks, dragStart, dragStop }) => {
                const categories: Record<string, any[]> = {};
                blocks.forEach((block) => {
                  const cat = block.getCategoryLabel() || 'Uncategorized';
                  if (!categories[cat]) categories[cat] = [];
                  categories[cat].push(block);
                });

                return (
                  <div className="absolute inset-0 overflow-y-auto p-4 space-y-6 custom-scrollbar animate-in fade-in duration-300">
                    <div className="mb-2">
                       <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Components</h3>
                    </div>
                    {Object.entries(categories).map(([catLabel, catBlocks]) => (
                      <div key={catLabel}>
                        <h4 className="text-xs font-black text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                           {catLabel}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {catBlocks.map((block) => (
                            <div
                              key={block.getId()}
                              draggable
                              onDragStart={(ev) => dragStart(block, ev.nativeEvent)}
                              onDragEnd={() => dragStop()}
                              className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-emerald-500 hover:shadow-md transition cursor-grab group bg-gray-50/30"
                            >
                              <div 
                                className="text-gray-400 group-hover:text-emerald-600 mb-2 transition transform group-hover:scale-110"
                                dangerouslySetInnerHTML={{ __html: block.getMedia() || `
                                  <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor"/></svg>
                                ` }}
                              />
                              <span className="text-[10px] font-extrabold text-gray-600 group-hover:text-emerald-700 text-center line-clamp-1 uppercase">
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
          ) : activeTab === 'styles' ? (
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
              {/* Selectors Manager */}
              <div className="p-4 border-b border-gray-50 bg-blue-50/10">
                <SelectorsProvider>
                  {(props) => (
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2">
                          <Settings2 size={12} className="text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest active-selectors-label">Active Selectors</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {props.selectors.map(sel => (
                            <span key={sel.getLabel()} className="px-2 py-1 bg-white text-blue-700 rounded-md text-[10px] font-bold border border-blue-100 shadow-sm italic">
                               .{sel.getLabel()}
                            </span>
                          ))}
                          {props.selectors.length === 0 && (
                            <div className="py-2 px-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 w-full text-center">
                               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">Select an element to customize</p>
                            </div>
                          )}
                       </div>
                    </div>
                  )}
                </SelectorsProvider>
              </div>

              {/* Traits Manager */}
              <div className="p-4 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Element Attributes</span>
                </div>
                <div ref={traitsContainerRef} className="gjs-traits-wrap" />
              </div>

              {/* Style Manager */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visual Styling</span>
                </div>
                <div ref={stylesContainerRef} className="gjs-styles-wrap" />
              </div>
            </div>
          ) : activeTab === 'layers' ? (
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300 p-4">
               <div className="mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layer Structure</h3>
                  <p className="text-[9px] text-gray-300 font-bold">Manage element hierarchy</p>
               </div>
               <div ref={layersContainerRef} className="gjs-layers-wrap min-h-[200px]" />
            </div>
          ) : (
             themeConfig && onThemeChange && (
               <ThemePanel config={themeConfig} onChange={onThemeChange} />
             )
          )}
        </div>
      </div>
    </>
  );
}
