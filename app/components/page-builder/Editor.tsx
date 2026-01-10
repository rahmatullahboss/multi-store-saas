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
  const [aiDesignMode, setAiDesignMode] = useState<'full-page' | 'section-design'>('full-page');
  const [selectedComponentData, setSelectedComponentData] = useState<string | null>(null);
  
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
          setAiDesignMode('full-page');
          setIsMagicModalOpen(true);
      },
    });

    editorInstance.Commands.add('open-ai-design-modal', {
      run: () => {
          const selected = editorInstance.getSelected();
          if (selected) {
            setSelectedComponentData(selected.toHTML());
            setAiDesignMode('section-design');
            setIsMagicModalOpen(true);
          } else {
            toast.error("Please select a block to design with AI");
          }
      },
    });

    // Add Sparkle icon to component toolbar
    editorInstance.on('component:selected', () => {
      const selected = editorInstance.getSelected();
      if (selected) {
        const toolbar = selected.get('toolbar');
        const hasAiBtn = toolbar.some((btn: any) => btn.command === 'open-ai-design-modal');
        
        if (!hasAiBtn) {
          toolbar.unshift({
            attributes: { title: 'Design with AI', class: 'fa fa-magic' },
            command: 'open-ai-design-modal',
            label: `
              <svg viewBox="0 0 24 24" fill="none" width="12" height="12" style="margin: 4px" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            `
          });
          selected.set('toolbar', toolbar);
        }
      }
    });

    // Initial Theme Injection
    updateCanvasTheme(editorInstance, themeConfig);
  };

  const handleMagicGenerate = (data: any) => {
    if (!editor) return;

    if (aiDesignMode === 'section-design') {
      const selected = editor.getSelected();
      if (selected && data.html) {
        // Replace selected component with new HTML
        // We use insertBefore and then remove old to ensure proper placement
        const parent = selected.parent();
        if (parent) {
          const index = selected.index();
          const newComp = editor.addComponents(data.html, { at: index })[0];
          selected.remove();
          editor.select(newComp);
        } else {
          // If no parent (root level), just append
          editor.DomComponents.clear(); // Safety clearing if it was a placeholder at root
          editor.addComponents(data.html);
        }
        toast.success("Section redesigned successfully!");
      }
      return;
    }

    // Clear existing content (Full Page Mode)
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

  // Handle template loading
  const handleLoadTemplate = (templateId: string) => {
    if (!editor) return;

    // Import template config
    import('~/lib/grapesjs/template-configs').then(({ TEMPLATE_CONFIGS }) => {
      const template = TEMPLATE_CONFIGS[templateId];
      if (!template) {
        console.warn(`Template not found: ${templateId}`);
        return;
      }

      // Clear existing canvas content
      editor.DomComponents.clear();

      //Load template blocks sequentially
      template.blocks.forEach((blockId) => {
        const blockDef = editor.Blocks.get(blockId);
        if (blockDef) {
          const content = blockDef.getContent ? blockDef.getContent() : blockDef.attributes.content;
          if (content) {
            editor.addComponents(content);
          } else {
            console.warn(`Content not found for block: ${blockId}`);
          }
        } else {
          console.warn(`Block not found: ${blockId}`);
        }
      });

      // Apply template colors to theme
      setThemeConfig({
        primaryColor: template.themeColors.primaryColor,
        secondaryColor: template.themeColors.secondaryColor,
        fontHeading: template.themeColors.fontHeading,
        fontBody: template.themeColors.fontBody,
      });

      toast.success(`Template "${template.nameEn}" loaded!`);
    });
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

    // Remove existing theme style if any
    const existingStyle = doc.getElementById('theme-variables-style');
    if (existingStyle) existingStyle.remove();

    // Create new theme style with CSS custom properties
    const style = doc.createElement('style');
    style.id = 'theme-variables-style';
    style.innerHTML = `
      :root {
        --primary-color: ${config.primaryColor};
        --secondary-color: ${config.secondaryColor};
        --font-heading: "${config.fontHeading}", sans-serif;
        --font-body: "${config.fontBody}", sans-serif;
      }
      
      /* Apply fonts to common elements */
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
      
      body, p, span, div, a, button, input, textarea, select {
        font-family: var(--font-body);
      }
      
      /* Utility classes for theme colors */
      .bg-primary { background-color: var(--primary-color) !important; }
      .text-primary { color: var(--primary-color) !important; }
      .border-primary { border-color: var(--primary-color) !important; }
      
      .bg-secondary { background-color: var(--secondary-color) !important; }
      .text-secondary { color: var(--secondary-color) !important; }
      .border-secondary { border-color: var(--secondary-color) !important; }
      
      /* Button hover effects */
      .bg-primary:hover { filter: brightness(0.9); }
      .bg-secondary:hover { filter: brightness(0.9); }
    `;
    
    // Inject into head
    doc.head.appendChild(style);
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
                onLoadTemplate={handleLoadTemplate}
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
        onClose={() => {
          setIsMagicModalOpen(false);
          setSelectedComponentData(null);
        }}
        onGenerate={handleMagicGenerate}
        mode={aiDesignMode}
        initialData={selectedComponentData || undefined}
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
