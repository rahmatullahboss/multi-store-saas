/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 */

import GjsEditor, { Canvas } from '@grapesjs/react';
import grapesjs from 'grapesjs';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsForms from 'grapesjs-plugin-forms';

// Important: Import GrapesJS CSS
import 'grapesjs/dist/css/grapes.min.css';
import { getGrapesConfig } from '~/lib/grapesjs/config';
import { bdBlocksPlugin } from '~/lib/grapesjs/bd-blocks';
import EditorToolbar from './Toolbar';
import SidebarPanel from './SidebarPanel';

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
          gjsForms as any,
          bdBlocksPlugin as any, // Our custom plugin
        ]}
        onEditor={onEditor}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <EditorToolbar />
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Unified Left Sidebar: Blocks + Customization */}
            <div className="h-full overflow-hidden flex-shrink-0">
              <SidebarPanel />
            </div>

            {/* Main Area: Canvas */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                <div className="w-full h-full shadow-lg relative bg-white">
                    <Canvas className="h-full w-full" />
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
