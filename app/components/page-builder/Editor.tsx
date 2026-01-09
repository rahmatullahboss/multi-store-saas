/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 */

import GjsEditor, { Canvas, StylesProvider, TraitsProvider, SelectorsProvider } from '@grapesjs/react';
import grapesjs from 'grapesjs';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsForms from 'grapesjs-plugin-forms';

// Important: Import GrapesJS CSS
import 'grapesjs/dist/css/grapes.min.css';
import { getGrapesConfig } from '~/lib/grapesjs/config';
import { bdBlocksPlugin } from '~/lib/grapesjs/bd-blocks';
import EditorToolbar from './Toolbar';
import BlocksPanel from './BlocksPanel';

interface GrapesEditorProps {
  pageId?: string;
}

export default function GrapesEditor({ pageId }: GrapesEditorProps) {
  const onEditor = (editor: any) => {
    console.log('Editor loaded', editor);
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        // Pass GrapesJS options
        options={{
          ...getGrapesConfig(null as any, pageId),
          height: '100%',
        }}
        // Load plugins correctly
        plugins={[
          gjsBlocksBasic as any,
          gjsPresetWebpage as any,
          gjsForms as any,
          bdBlocksPlugin as any, // Our custom plugin
        ]}
        onEditor={onEditor}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <EditorToolbar />
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left Panel: Blocks */}
            <BlocksPanel />

            {/* Center: Canvas */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                <div className="w-full h-full shadow-lg relative bg-white">
                    <Canvas className="h-full w-full" />
                </div>
            </div>

            {/* Right Panel: Styles & Traits */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden flex-shrink-0 shadow-sm min-h-0">
               <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
                  <h3 className="font-bold text-gray-900">Customization</h3>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Style selected element</p>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                  {/* Selectors Manager */}
                  <div className="p-4 border-b border-gray-50 bg-gray-50/10">
                    <SelectorsProvider>
                      {(props) => (
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">Selectors</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {props.selectors.map(sel => (
                                <span key={sel.getLabel()} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-100 italic">
                                   .{sel.getLabel()}
                                </span>
                              ))}
                              {props.selectors.length === 0 && <span className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter">No element selected</span>}
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
                                 <span className="text-[10px] font-bold text-blue-600 uppercase">Attributes</span>
                              </div>
                              {traits.map(trait => (
                                 <div key={trait.getId()} className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{trait.getLabel()}</label>
                                    <div className="gjs-trait-input-container">
                                       <div ref={el => { if (el && (trait as any).getElement) el.appendChild((trait as any).getElement()) }} className="text-sm font-medium border border-gray-100 rounded p-1 bg-gray-50/30" />
                                    </div>
                                 </div>
                              ))}
                              {traits.length === 0 && <p className="text-[10px] text-gray-300 font-medium italic">Select an element to see attributes</p>}
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
                                 <span className="text-[10px] font-bold text-purple-600 uppercase">Style Settings</span>
                              </div>
                              {sectors.map(sector => (
                                 <div key={sector.getId()} className="space-y-3">
                                    <h4 className="text-[11px] font-bold text-gray-700 bg-gray-50 p-2 rounded-lg flex items-center justify-between">
                                       {sector.getName()}
                                       <span className="text-[9px] text-gray-400">Expand</span>
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 px-1">
                                       {sector.getProperties().map(prop => (
                                          <div key={prop.getId()} className="space-y-1">
                                             <label className="text-[10px] font-bold text-gray-400 uppercase leading-none">{prop.getLabel()}</label>
                                             <div ref={el => { if (el && (prop as any).getElement) el.appendChild((prop as any).getElement()) }} className="gjs-sm-property-input" />
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                              {sectors.length === 0 && <p className="text-[10px] text-gray-300 font-medium italic text-center">Select an element to edit style</p>}
                           </div>
                        )}
                     </StylesProvider>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </GjsEditor>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        /* GrapesJS Built-in Styles Overrides to match our UI */
        .gjs-sm-property-input input, .gjs-sm-property-input select {
          border: 1px solid #f1f5f9 !important;
          border-radius: 8px !important;
          background-color: #f8fafc !important;
          color: #1e293b !important;
          font-size: 11px !important;
          padding: 4px 8px !important;
          width: 100% !important;
        }
        .gjs-sm-property-input input:focus {
          border-color: #10b981 !important;
          outline: none !important;
        }
        .gjs-trait-input-container input, .gjs-trait-input-container select {
          border: 0 !important;
          background: transparent !important;
          width: 100% !important;
          font-size: 11px !important;
        }
      `}} />
    </div>
  );
}
