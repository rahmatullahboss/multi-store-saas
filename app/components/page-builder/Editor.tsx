/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import GjsEditor, { Canvas } from '@grapesjs/react';
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
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react';

import BlockLibraryModal from "./BlockLibraryModal";
// Removed AISidebar import
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
  const isAiLocked = planType === 'free';
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = useState(false);
  // Removed MagicModal state
  const [selectedComponentData, setSelectedComponentData] = useState<string | null>(null);
  // Removed isChatOpen state

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
  
  // Custom Event Listener for Tab Switching from Context Menu
  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent) => {
        // This is caught by SidebarPanel ideally, or we can pass a prop if we hoist state
        // Since SidebarPanel manages its own state locally, we might need to hoist `activeTab` to `GrapesEditor`.
        // For now, we will dispatch it to window and let SidebarPanel listen, OR hoist the state.
        // Hoisting state is cleaner.
    };
    // window.addEventListener('switch-sidebar-tab', handleTabSwitch as any);
    // return () => window.removeEventListener('switch-sidebar-tab', handleTabSwitch as any);
  }, []);

  const onEditor = (editorInstance: any) => {
    console.log('Editor loaded', editorInstance);
    setEditor(editorInstance);

    // Disable default context menu and show custom one
    editorInstance.on('load', () => {
        const body = editorInstance.Canvas.getBody();
        // FORCE CONTENT EDITABLE
        body.setAttribute('contenteditable', 'true');
        
        // Manual CSS Injection to ensure GrapesJS styles are present in the iframe
        const head = editorInstance.Canvas.getDocument().head;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
        head.appendChild(link);
        
        body.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            // Calculate absolute position based on iframe offset
            const canvasOffset = editorInstance.Canvas.getElement().getBoundingClientRect();
            setContextMenuPos({
                x: canvasOffset.left + e.clientX,
                y: canvasOffset.top + e.clientY
            });
            // Select component under cursor if not selected
            const target = editorInstance.getSelected();
            if (!target) {
                // editorInstance.select(e.target); // This is tricky with iframe coordinates, let Grapes handle selection mostly
            }
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
      if (editorInstance.isPublishing) {
        data.publish = true;
      }
    });

    editorInstance.on('storage:end:store', () => {
      onStorageStatusChange?.('saved');
      // Reset to idle after 3 seconds
      setTimeout(() => {
        onStorageStatusChange?.('idle');
      }, 3000);
    });

    editorInstance.on('storage:error', () => {
      onStorageStatusChange?.('error');
      // Reset to idle after 5 seconds or keep error? 
      // Let's reset to idle after 5s so it doesn't stay stuck
      setTimeout(() => {
        onStorageStatusChange?.('idle');
      }, 5000);
    });

    // Removed Magic Generate Button and Commands
    // AI Actions should now be handled via the Sidebar exclusively


    // Removed Component Toolbar "Design with AI" button as it triggered the old modal


    // Initial Theme Injection
    updateCanvasTheme(editorInstance, themeConfig);
  };

    // Removed handleMagicGenerate


  // Handle template loading
  const handleLoadTemplate = async (templateId: string) => {
    if (!editor) return;

    try {
      // Import template config
      const { TEMPLATE_CONFIGS } = await import('~/lib/grapesjs/template-configs');
      const template = TEMPLATE_CONFIGS[templateId];
      
      if (!template) {
        console.warn(`Template not found: ${templateId}`);
        toast.error('Template not found');
        return;
      }

      // Clear existing canvas content
      editor.DomComponents.clear();

      // Load template blocks sequentially
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

      // Apply template colors to theme
      setThemeConfig({
        primaryColor: template.themeColors.primaryColor,
        secondaryColor: template.themeColors.secondaryColor,
        fontHeading: template.themeColors.fontHeading,
        fontBody: template.themeColors.fontBody,
      });

      // CRITICAL: Force render and update
      editor.render();
      editor.refresh();
      
      // Clear undo history so we don't undo into a partial state
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

      // Update Featured Product references
      if (pageConfig.featuredProductName) {
        wrapper.find('.product-name').forEach((comp: any) => {
          comp.set('content', pageConfig.featuredProductName);
        });
      }

      // Update WhatsApp links
      if (pageConfig.whatsappNumber) {
        const msg = encodeURIComponent(pageConfig.whatsappMessage || '');
        const url = `https://wa.me/${pageConfig.whatsappNumber}?text=${msg}`;
        wrapper.find('.whatsapp-link').forEach((comp: any) => {
          // Check if it's a link component or has a tagName 'a'
          if (comp.get('type') === 'link' || comp.get('tagName') === 'a') {
            comp.addAttributes({ href: url });
          }
        });
      }

      // Update Social Proof
      if (pageConfig.socialProofCount !== undefined && pageConfig.socialProofCount !== null) {
        wrapper.find('.social-proof-count').forEach((comp: any) => {
          comp.set('content', pageConfig.socialProofCount?.toString() || '0');
        });
      }

      // Update Countdown Timers
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
  
  // State for Controlling Tabs via Context Menu
  const [activeSidebarTab, setActiveSidebarTab] = useState<'widgets' | 'design' | 'structure' | 'settings'>('widgets');

  useEffect(() => {
      // Listen for the custom event
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
      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        // Pass GrapesJS options
        options={{
          ...getGrapesConfig(null as any, pageId, planType),
          height: '100%',
        }}
        // Load plugins correctly
        plugins={[
          gjsBlocksBasic as any,
          gjsForms as any,
          bdBlocksPlugin as any, // Our custom blocks
          animationPlugin as any, // Animation traits for all components
          swiperPlugin as any, // New Slider Plugin
          productLoopPlugin as any, // Product Loop Plugin
          shapeDividersPlugin as any, // Shape Dividers
          popupPlugin as any, // Popup Builder
        ]}
        onEditor={onEditor}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <EditorToolbar 
            isAiLocked={isAiLocked} 
            onOpenLibrary={() => setIsBlockLibraryOpen(true)}
            publishedPageUrl={publishedBaseUrl && pageSlug ? `${publishedBaseUrl}/p/${pageSlug}` : undefined}
            pageId={pageId}
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
            />
            </div>

            {/* Main Area: Canvas */}
            <div 
                className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative"
                onContextMenu={(e) => {
                  e.preventDefault(); 
                  // Fallback if not caught by iframe
                }}
            >
                <div className="w-full h-full shadow-lg relative bg-white">
                    <Canvas className="h-full w-full" />
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

            {/* AI Sidebar Removed */}
          </div>
        </div>
      </GjsEditor>



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
      `}} />
    </div>
  );
}

