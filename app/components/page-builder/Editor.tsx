/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 * Uses vanilla GrapesJS initialization with useRef for reliable DOM mounting.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs from 'grapesjs';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsForms from 'grapesjs-plugin-forms';

// Important: Import GrapesJS CSS
import 'grapesjs/dist/css/grapes.min.css';
import '~/styles/grapesjs-overrides.css';
import '~/styles/grapesjs-navigator.css'; // Custom Navigator Styles
import { getGrapesConfig } from '~/lib/grapesjs/config';
import { bdBlocksPlugin } from '~/lib/grapesjs/bd-blocks';
import { animationPlugin } from '~/lib/grapesjs/animation-plugin';
import swiperPlugin from '~/lib/grapesjs/plugins/slider';
import productLoopPlugin from '~/lib/grapesjs/plugins/product-loop';
import shapeDividersPlugin from '~/lib/grapesjs/plugins/shape-dividers';
import popupPlugin from '~/lib/grapesjs/plugins/popup';
import EditorToolbar from './Toolbar';
import SidebarPanel from './SidebarPanel';

import BlockLibraryModal from "./BlockLibraryModal";
import { toast } from 'sonner';
import ContextMenu from './ContextMenu';

interface GrapesEditorProps {
  pageId?: string;
  planType?: string;
  onStorageStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  publishedBaseUrl?: string;
  pageSlug?: string;
}

export default function GrapesEditor({ pageId, planType = 'free', onStorageStatusChange, publishedBaseUrl, pageSlug }: GrapesEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAiLocked = planType === 'free';
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Page Configurations (Featured Product, WhatsApp, etc.)
  const [pageConfig, setPageConfig] = useState<{
    featuredProductId?: number;
    featuredProductName?: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
    timerEndDate?: string;
    socialProofCount?: number;
    socialProofText?: string;
  }>({});

  // Global Theme State
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#059669', // emerald-600
    secondaryColor: '#2563eb', // blue-600
    fontHeading: 'Hind Siliguri',
    fontBody: 'Hind Siliguri',
  });

  // Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  
  // State for Controlling Tabs via Context Menu
  const [activeSidebarTab, setActiveSidebarTab] = useState<'widgets' | 'design' | 'structure' | 'settings'>('widgets');

  // Initialize GrapesJS using vanilla approach
  useEffect(() => {
    if (!containerRef.current || editor) return;

    // Small delay to ensure DOM is fully ready
    const initTimeout = setTimeout(() => {
      if (!containerRef.current) return;

      const config = getGrapesConfig(containerRef.current, pageId, planType);
      
      const editorInstance = grapesjs.init({
        ...config,
        container: containerRef.current,
        plugins: [
          gjsBlocksBasic,
          gjsForms,
          bdBlocksPlugin, // Our custom blocks
          animationPlugin, // Animation traits for all components
          swiperPlugin, // New Slider Plugin
          productLoopPlugin, // Product Loop Plugin
          shapeDividersPlugin, // Shape Dividers
          popupPlugin, // Popup Builder
        ],
        pluginsOpts: {
          [gjsBlocksBasic as any]: {},
          [gjsForms as any]: {},
        },
      });

      console.log('Editor initialized', editorInstance);
      setEditor(editorInstance);
      setIsEditorReady(true);

      // Setup event handlers
      editorInstance.on('load', () => {
        const body = editorInstance.Canvas.getBody();
        // FORCE CONTENT EDITABLE
        body.setAttribute('contenteditable', 'true');
        
        body.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault();
          const canvasOffset = editorInstance.Canvas.getElement().getBoundingClientRect();
          setContextMenuPos({
            x: canvasOffset.left + e.clientX,
            y: canvasOffset.top + e.clientY
          });
        });
      });

      // 1. Initial Data Loading (pageConfig)
      editorInstance.on('storage:load', (res: any) => {
        if (res && res.pageConfig) {
          setPageConfig(res.pageConfig);
        }
        if (res && res.themeConfig) {
          setThemeConfig(res.themeConfig);
        }
      });

      // 2. Inject pageConfig during Save
      editorInstance.on('storage:start:store', (data: any) => {
        onStorageStatusChange?.('saving');
        data.pageConfig = pageConfig;
        data.themeConfig = themeConfig;
        data.html = editorInstance.getHtml();
        data.css = editorInstance.getCss();
        // Check if publishing flag is set (custom property)
        if ((editorInstance as any).isPublishing) {
          data.publish = true;
        }
      });

      editorInstance.on('storage:end:store', () => {
        onStorageStatusChange?.('saved');
        setTimeout(() => {
          onStorageStatusChange?.('idle');
        }, 3000);
      });

      editorInstance.on('storage:error', () => {
        onStorageStatusChange?.('error');
        setTimeout(() => {
          onStorageStatusChange?.('idle');
        }, 5000);
      });

      // Initial Theme Injection
      updateCanvasTheme(editorInstance, themeConfig);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (editor) {
        editor.destroy();
      }
    };
  }, [pageId, planType]); // Only re-init if these change

  // Handle template loading
  const handleLoadTemplate = async (templateId: string) => {
    if (!editor) return;

    try {
      const { TEMPLATE_CONFIGS } = await import('~/lib/grapesjs/template-configs');
      const template = TEMPLATE_CONFIGS[templateId];
      
      if (!template) {
        console.warn(`Template not found: ${templateId}`);
        toast.error('Template not found');
        return;
      }

      editor.DomComponents.clear();

      let blocksAdded = 0;
      template.blocks.forEach((blockId) => {
        const blockDef = editor.Blocks.get(blockId);
        if (blockDef) {
          const content = blockDef.getContent ? blockDef.getContent() : blockDef.attributes.content;
          if (content) {
            editor.addComponents(content);
            blocksAdded++;
          } else {
            console.warn(`Content not found for block: ${blockId}`);
          }
        } else {
          console.warn(`Block not found: ${blockId}`);
        }
      });

      if (blocksAdded === 0) {
        toast.error('Could not load any blocks for this template');
        return;
      }

      setThemeConfig({
        primaryColor: template.themeColors.primaryColor,
        secondaryColor: template.themeColors.secondaryColor,
        fontHeading: template.themeColors.fontHeading,
        fontBody: template.themeColors.fontBody,
      });

      editor.render();
      editor.refresh();
      
      setTimeout(() => {
        editor.UndoManager.clear();
      }, 100);

      toast.success(`Template "${template.nameEn}" loaded!`);
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
    }
  };
  
  // Smart Sync: Update blocks when pageConfig changes
  useEffect(() => {
    if (!editor || !pageConfig) return;

    const syncConfigToBlocks = () => {
      const wrapper = editor.getWrapper();
      if (!wrapper) return;

      if (pageConfig.featuredProductName) {
        wrapper.find('.product-name').forEach((comp: any) => {
          comp.set('content', pageConfig.featuredProductName);
        });
      }

      if (pageConfig.whatsappNumber) {
        const msg = encodeURIComponent(pageConfig.whatsappMessage || '');
        const url = `https://wa.me/${pageConfig.whatsappNumber}?text=${msg}`;
        wrapper.find('.whatsapp-link').forEach((comp: any) => {
          if (comp.get('type') === 'link' || comp.get('tagName') === 'a') {
            comp.addAttributes({ href: url });
          }
        });
      }

      if (pageConfig.socialProofCount !== undefined && pageConfig.socialProofCount !== null) {
        wrapper.find('.social-proof-count').forEach((comp: any) => {
          comp.set('content', pageConfig.socialProofCount?.toString() || '0');
        });
      }

      if (pageConfig.timerEndDate) {
        wrapper.find('[data-gjs-type="countdown"]').forEach((comp: any) => {
          comp.set('end-date', pageConfig.timerEndDate);
        });
      }
    };

    syncConfigToBlocks();
  }, [pageConfig, editor]);

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

    const existingStyle = doc.getElementById('theme-variables-style');
    if (existingStyle) existingStyle.remove();

    const style = doc.createElement('style');
    style.id = 'theme-variables-style';
    style.innerHTML = `
      :root {
        --primary-color: ${config.primaryColor};
        --secondary-color: ${config.secondaryColor};
        --font-heading: "${config.fontHeading}", sans-serif;
        --font-body: "${config.fontBody}", sans-serif;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
      
      body, p, span, div, a, button, input, textarea, select {
        font-family: var(--font-body);
      }
      
      .bg-primary { background-color: var(--primary-color) !important; }
      .text-primary { color: var(--primary-color) !important; }
      .border-primary { border-color: var(--primary-color) !important; }
      
      .bg-secondary { background-color: var(--secondary-color) !important; }
      .text-secondary { color: var(--secondary-color) !important; }
      .border-secondary { border-color: var(--secondary-color) !important; }
      
      .bg-primary:hover { filter: brightness(0.9); }
      .bg-secondary:hover { filter: brightness(0.9); }
    `;
    
    doc.head.appendChild(style);
  };

  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent) => {
      if (e.detail) {
        setActiveSidebarTab(e.detail);
      }
    };
    window.addEventListener('switch-sidebar-tab', handleTabSwitch as any);
    return () => window.removeEventListener('switch-sidebar-tab', handleTabSwitch as any);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="flex flex-col h-full overflow-hidden">
        <EditorToolbar 
          isAiLocked={isAiLocked} 
          onOpenLibrary={() => setIsBlockLibraryOpen(true)}
          publishedPageUrl={publishedBaseUrl && pageSlug ? `${publishedBaseUrl}/p/${pageSlug}` : undefined}
          pageId={pageId}
          editor={editor}
        />
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Unified Left Sidebar: Blocks + Customization */}
          <div className="h-full overflow-hidden flex-shrink-0">
            <SidebarPanel 
              themeConfig={themeConfig} 
              onThemeChange={setThemeConfig}
              pageConfig={pageConfig}
              onPageConfigChange={setPageConfig}
              onLoadTemplate={handleLoadTemplate}
              activeTab={activeSidebarTab}
              onTabChange={setActiveSidebarTab}
              editor={editor}
            />
          </div>

          {/* Main Area: GrapesJS Canvas Container */}
          <div 
            className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative"
            onContextMenu={(e) => {
              e.preventDefault(); 
            }}
          >
            <div className="w-full h-full shadow-lg relative bg-white">
              {/* GrapesJS will render its canvas here */}
              <div 
                ref={containerRef} 
                className="h-full w-full gjs-editor-container"
              />
              
              {/* Loading Overlay */}
              {!isEditorReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                  <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-400 font-medium">Loading Editor...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Custom Context Menu */}
            {contextMenuPos && (
              <ContextMenu 
                editor={editor} 
                position={contextMenuPos} 
                onClose={() => setContextMenuPos(null)} 
              />
            )}
          </div>
        </div>
      </div>

      <BlockLibraryModal 
        isOpen={isBlockLibraryOpen}
        onClose={() => setIsBlockLibraryOpen(false)}
        editor={editor}
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
        /* Ensure GrapesJS editor container takes full space */
        .gjs-editor-container .gjs-editor {
          height: 100% !important;
        }
        .gjs-editor-container .gjs-cv-canvas {
          width: 100% !important;
          height: 100% !important;
        }
      `}} />
    </div>
  );
}
