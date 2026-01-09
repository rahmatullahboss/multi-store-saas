/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 */

import GjsEditor, { Canvas } from '@grapesjs/react';
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

export default function GrapesEditor() {
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
          ...getGrapesConfig(null as any),
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
        <div className="flex flex-col h-full">
          <EditorToolbar />
          <div className="flex flex-1 overflow-hidden">
            <BlocksPanel />
            <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
               {/* Fixed size center canvas for better control */}
               <div className="w-full h-full shadow-lg relative bg-white">
                  <Canvas className="h-full w-full" />
               </div>
            </div>
            {/* Right sidebar for styles could go here in future */}
          </div>
        </div>
      </GjsEditor>
    </div>
  );
}
