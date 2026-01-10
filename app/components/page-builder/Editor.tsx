/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 */

import { useState, useEffect } from 'react';
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
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react';
import MagicGenerateModal from "./MagicGenerateModal";
import { toast } from 'sonner';

interface GrapesEditorProps {
  pageId?: string;
}

export default function GrapesEditor({ pageId }: GrapesEditorProps) {
  const [editor, setEditor] = (useState<any>)(null);
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  
  // Global Theme State
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#059669', // emerald-600
    secondaryColor: '#2563eb', // blue-600
    fontHeading: 'Hind Siliguri',
    fontBody: 'Hind Siliguri',
  });

  const onEditor = (editorInstance: any) => {
    console.log('Editor loaded', editorInstance);
    setEditor(editorInstance);

    // Add Magic Generate Button to Panel
    editorInstance.Panels.addButton('options', {
      id: 'magic-generate',
      className: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold !px-3 !border-none hover:opacity-90 flex items-center gap-2',
      label: '✨ AI Generate',
      command: 'open-magic-modal',
      attributes: { title: 'Generate Landing Page with AI' }
    });

    editorInstance.Commands.add('open-magic-modal', {
      run: () => {
          setIsMagicModalOpen(true);
      },
    });

    // Initial Theme Injection
    updateCanvasTheme(editorInstance, themeConfig);
  };

  const handleMagicGenerate = (data: any) => {
    if (!editor) return;

    // Clear existing content
    editor.DomComponents.clear();

    // Add blocks based on AI response
    if (data.blocks && Array.isArray(data.blocks)) {
      data.blocks.sort((a: any, b: any) => a.order - b.order).forEach((block: any) => {
        const blockType = block.type;
        
        // Find the block definition from GrapesJS Block Manager
        const blockDef = editor.Blocks.get(blockType);
        
        if (blockDef) {
           // Get HTML content from the block definition
           // GrapesJS blocks store content in 'content' property of the model attributes
           const content = blockDef.getContent ? blockDef.getContent() : blockDef.attributes.content;
           
           if (content) {
             editor.addComponents(content);
           } else {
             console.warn(`Content not found for block type: ${blockType}`);
           }
        } else {
          console.warn(`Block type not found: ${blockType}. Make sure bdBlocksPlugin is loaded.`);
        }
      });
    }

    toast.success("Page generated successfully!");
  };
  
  // Inject Dynamic Tailwind Config when Theme Changes
  useEffect(() => {
    if (editor) {
      updateCanvasTheme(editor, themeConfig);
    }
  }, [themeConfig, editor]);

  const updateCanvasTheme = (editor: any, config: any) => {
    const frame = editor.Canvas.getFrameEl();
    if (!frame) return;

    const doc = frame.contentDocument;
    if (!doc) return;

    // Remove existing config script if any
    const existingScript = doc.getElementById('tailwind-config-script');
    if (existingScript) existingScript.remove();

    // Create new config script
    const script = doc.createElement('script');
    script.id = 'tailwind-config-script';
    script.innerHTML = `
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${config.primaryColor}',
              secondary: '${config.secondaryColor}',
            },
            fontFamily: {
              heading: ['"${config.fontHeading}"', 'sans-serif'],
              body: ['"${config.fontBody}"', 'sans-serif'],
            }
          }
        }
      }
    `;
    
    // Inject into head
    doc.head.appendChild(script);
    
    // Force refresh might be needed or just wait for Tailwind Play to observe
    // Tailwind Play CDN usually watches DOM, but config changes might require re-init
    // A simple hack to force style re-calc is to add/remove a class from body
    doc.body.classList.add('theme-updating');
    setTimeout(() => doc.body.classList.remove('theme-updating'), 10);
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
            <SidebarPanel 
                themeConfig={themeConfig} 
                onThemeChange={setThemeConfig} 
            />
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

      <MagicGenerateModal 
        isOpen={isMagicModalOpen} 
        onClose={() => setIsMagicModalOpen(false)}
        onGenerate={handleMagicGenerate}
      />

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
