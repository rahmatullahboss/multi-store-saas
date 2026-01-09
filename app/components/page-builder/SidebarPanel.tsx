import { BlocksProvider, StylesProvider, TraitsProvider, SelectorsProvider, LayersProvider } from '@grapesjs/react';
import { useState } from 'react';
import { Box, Palette, Settings2, Layers } from 'lucide-react';

export default function SidebarPanel() {
  const [activeTab, setActiveTab] = useState<'elements' | 'styles' | 'layers'>('elements');

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
      `}} />

      <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shadow-sm min-h-0">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 gap-1">
           <button 
             onClick={() => setActiveTab('elements')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'elements' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
           >
              <Box size={14} strokeWidth={2.5} />
              ELEMENTS
           </button>
           <button 
             onClick={() => setActiveTab('styles')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'styles' ? 'bg-white text-blue-600 shadow-sm border border-blue-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
           >
              <Palette size={14} strokeWidth={2.5} />
              STYLE
           </button>
           <button 
             onClick={() => setActiveTab('layers')}
             className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'layers' ? 'bg-white text-purple-600 shadow-sm border border-purple-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
           >
              <Layers size={14} strokeWidth={2.5} />
              LAYERS
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
            <div className="flex-1 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
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
                 <TraitsProvider>
                    {({ traits }) => (
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Element Attributes</span>
                          </div>
                          {traits.map(trait => (
                             <div key={trait.getId()} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{trait.getLabel()}</label>
                                <div className="gjs-trait-input-container bg-gray-50/50 rounded-lg border border-gray-100 overflow-hidden">
                                   <div ref={el => { if (el && (trait as any).getElement) el.appendChild((trait as any).getElement()) }} className="text-[11px] font-medium p-1" />
                                </div>
                             </div>
                          ))}
                          {traits.length === 0 && <p className="text-[10px] text-gray-300 font-medium italic text-center py-2">No attributes for this element</p>}
                       </div>
                    )}
                 </TraitsProvider>
              </div>

              {/* Style Manager */}
              <div className="p-4">
                 <StylesProvider>
                    {({ sectors }) => (
                       <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visual Styling</span>
                          </div>
                          {sectors.map(sector => (
                             <div key={sector.getId()} className="space-y-3 mb-6 bg-gray-50/30 p-3 rounded-2xl border border-gray-100/50">
                                <h4 className="text-[11px] font-black text-gray-800 flex items-center justify-between uppercase tracking-tighter">
                                   {sector.getName()}
                                   <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                </h4>
                                <div className="grid grid-cols-1 gap-4 px-1">
                                   {sector.getProperties().map(prop => (
                                      <div key={prop.getId()} className="space-y-1.5">
                                         <label className="text-[10px] font-bold text-gray-400 uppercase leading-none tracking-tight">{prop.getLabel()}</label>
                                         <div ref={el => { if (el && (prop as any).getElement) el.appendChild((prop as any).getElement()) }} className="gjs-sm-property-input" />
                                      </div>
                                   ))}
                                </div>
                             </div>
                          ))}
                          {sectors.length === 0 && <p className="text-[10px] text-gray-300 font-medium italic text-center py-10">Select an element to edit style</p>}
                       </div>
                    )}
                 </StylesProvider>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300 p-4">
               <div className="mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layer Structure</h3>
                  <p className="text-[9px] text-gray-300 font-bold">Manage element hierarchy</p>
               </div>
               <LayersProvider>
                  {(props: any) => (
                     <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div ref={el => { 
                          if (el && props.Layers) {
                            // In @grapesjs/react, we usually build the layers UI
                            // But if we want to inject Gjs default, we can try to get it from editor
                            el.appendChild(props.Layers.getElement());
                          }
                        }} className="gjs-layers-container min-h-[200px] p-2" />
                        <p className="p-4 text-center text-[10px] text-gray-400 font-medium italic">
                          Layers view is active. Use this to reorder elements.
                        </p>
                     </div>
                  )}
               </LayersProvider>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
