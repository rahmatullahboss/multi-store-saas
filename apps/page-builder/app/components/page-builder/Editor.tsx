/**
 * GrapesJS Editor Component
 * 
 * Clean implementation with proper GrapesJS initialization.
 * Fixed: React strict mode causing double init/destroy cycle.
 * Solution: Use a mount tracking ref and ensure load event fires.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsForms from 'grapesjs-plugin-forms';

// GrapesJS CSS
import 'grapesjs/dist/css/grapes.min.css';
import '~/styles/grapesjs-overrides.css';
import '~/styles/grapesjs-navigator.css';

// Config and plugins
import { getGrapesConfig } from '~/lib/grapesjs/config';
import { bdBlocksPlugin } from '~/lib/grapesjs/bd-blocks';
import { animationPlugin } from '~/lib/grapesjs/animation-plugin';
import swiperPlugin from '~/lib/grapesjs/plugins/slider';
import productLoopPlugin from '~/lib/grapesjs/plugins/product-loop';
import shapeDividersPlugin from '~/lib/grapesjs/plugins/shape-dividers';
import popupPlugin from '~/lib/grapesjs/plugins/popup';

// Reusable UI Components
import EditorToolbar from './Toolbar';
import SidebarPanel from './SidebarPanel';
import BlockLibraryModal from './BlockLibraryModal';
import ContextMenu from './ContextMenu';
import { AISidebar } from './ai-sidebar';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';

interface GrapesEditorProps {
  pageId?: string;
  planType?: string;
  onStorageStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  publishedBaseUrl?: string;
  pageSlug?: string;
  initialProjectData?: any; // Pre-fetched from route loader to skip autoload blocking
  mainAppUrl?: string;
}

interface PageConfig {
  featuredProductId?: number;
  featuredProductName?: string;
  featuredProductPrice?: number;
  featuredProductComparePrice?: number | null;
  featuredProductImage?: string | null;
  featuredProductVariants?: Array<{ id: number; name: string; price: number }>;
  whatsappNumber?: string;
  whatsappMessage?: string;
  timerEndDate?: string;
  socialProofCount?: number;
  socialProofText?: string;
}

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
}

export default function GrapesEditor({ 
  pageId, 
  planType = 'free', 
  onStorageStatusChange, 
  publishedBaseUrl, 
  pageSlug,
  initialProjectData,
  mainAppUrl = 'https://ozzyl.com'
}: GrapesEditorProps) {
  const { t } = useTranslation();
  // Core state
  const containerRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // Mount tracking to handle React Strict Mode
  const mountedRef = useRef(true);
  
  // UI state
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false); // AI Sidebar closed by default
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'widgets' | 'design' | 'structure' | 'settings'>('widgets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  
  // Listen for close-mobile-sidebar event from SidebarPanel when block is inserted
  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarOpen(false);
    window.addEventListener('close-mobile-sidebar', handleCloseSidebar);
    return () => window.removeEventListener('close-mobile-sidebar', handleCloseSidebar);
  }, []);
  
  // Configuration state - use refs to avoid stale closures in event handlers
  const [pageConfig, setPageConfig] = useState<PageConfig>({});
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#059669',
    secondaryColor: '#2563eb',
    fontHeading: 'Hind Siliguri',
    fontBody: 'Hind Siliguri',
  });
  
  const pageConfigRef = useRef(pageConfig);
  const themeConfigRef = useRef(themeConfig);
  
  // Keep refs in sync
  useEffect(() => { pageConfigRef.current = pageConfig; }, [pageConfig]);
  useEffect(() => { themeConfigRef.current = themeConfig; }, [themeConfig]);

  // Initialize GrapesJS
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Reset mount tracking
    mountedRef.current = true;
    let editorInstance: any = null;
    
    // Delay initialization to handle React Strict Mode's double-invoke pattern
    const initTimeout = setTimeout(() => {
      if (!mountedRef.current || !containerRef.current) {
        console.log('Skipping GrapesJS init - component unmounted');
        return;
      }
      
      console.log('Initializing GrapesJS...');
      
      const config = getGrapesConfig(containerRef.current, pageId, planType);
      
      editorInstance = grapesjs.init({
        ...config,
        container: containerRef.current,
        height: '100%',
        width: 'auto',
        // Per GrapesJS docs: when projectData is defined, autoload is skipped
        ...(initialProjectData ? { projectData: initialProjectData } : {}),
        plugins: [
          gjsBlocksBasic,
          gjsForms,
          bdBlocksPlugin,
          animationPlugin,
          swiperPlugin,
          productLoopPlugin,
          shapeDividersPlugin,
          popupPlugin,
        ],
        pluginsOpts: {
          [gjsBlocksBasic as any]: {},
          [gjsForms as any]: {},
        },
      });

      // Function to apply isolation to a component
      const applyIsolation = (component: any) => {
        if (component.get('type') === 'custom-code') {
          const classes = component.getClasses();
          if (!classes.includes('bd-custom-code-isolated')) {
            component.addClass('bd-custom-code-isolated');
          }
        }
      };

      // Event Listeners
      editorInstance.on('component:create', applyIsolation);
      
      editorInstance.on('load', () => {
        editorInstance.getComponents().forEach((component: any) => {
          applyIsolation(component);
          // Also check all nested components if necessary (though custom-code is usually a leaf)
        });
      });

      // Check if still mounted after init
      if (!mountedRef.current) {
        console.log('Component unmounted during init, destroying...');
        editorInstance.destroy();
        editorInstance = null;
        return;
      }

      // Set editor for React state
      setEditor(editorInstance);

      // -- Editor Ready (per GrapesJS docs: use onReady(), not on('load')) --
      editorInstance.onReady(() => {
        if (!mountedRef.current) return;
        
        console.log('GrapesJS is ready!');
        
        const frame = editorInstance.Canvas.getFrameEl();
        const body = editorInstance.Canvas.getBody();
        
        if (frame) {
          frame.style.height = '100%';
          frame.style.width = '100%';
        }
        
        if (body) {
          body.style.height = '100%';
          body.style.width = '100%';
          body.style.margin = '0';
          body.style.pointerEvents = 'auto';
          
          body.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            const canvasEl = editorInstance.Canvas.getElement();
            if (canvasEl) {
              const rect = canvasEl.getBoundingClientRect();
              setContextMenuPos({
                x: rect.left + e.clientX,
                y: rect.top + e.clientY,
              });
            }
          });
        }
        
        // Note: autoload is false in config to prevent blocking initialization
        // Autosave will still work and save new content
        
        setIsEditorReady(true);
        
        // Auto-detect viewport and set device accordingly
        // This ensures canvas shows mobile view when editor is opened on mobile
        const detectAndSetDevice = () => {
          const width = window.innerWidth;
          if (width <= 480) {
            editorInstance.setDevice('Mobile');
          } else if (width <= 768) {
            editorInstance.setDevice('Tablet');
          }
          // Desktop is default, no need to set explicitly
        };
        
        // Set initial device based on viewport
        detectAndSetDevice();
      });

      // -- Storage Events --
      editorInstance.on('storage:start', () => {
        onStorageStatusChange?.('saving');
      });
      
      editorInstance.on('storage:end', () => {
        onStorageStatusChange?.('saved');
        setTimeout(() => onStorageStatusChange?.('idle'), 2000);
      });
      
      editorInstance.on('storage:error', (err: any) => {
        console.error('Storage error:', err);
        onStorageStatusChange?.('error');
      });

      // -- Load Config from Storage --
      editorInstance.on('storage:load', (data: any) => {
        if (data?.pageConfig) setPageConfig(data.pageConfig);
        if (data?.themeConfig) setThemeConfig(data.themeConfig);
      });

      // -- Inject Config into Storage --
      editorInstance.on('storage:start:store', (data: any) => {
        data.pageConfig = pageConfigRef.current;
        data.themeConfig = themeConfigRef.current;
      });

      // -- Device Change Handler (for Desktop full width) --
      let desktopObserver: MutationObserver | null = null;
      
      const setDeviceAttribute = (device: string) => {
        // Set on our container (which we control)
        if (containerRef.current) {
          containerRef.current.setAttribute('data-gjs-device', device);
        }
        // Also try setting on .gjs-editor and its parent
        const editorEl = document.querySelector('.gjs-editor') as HTMLElement;
        if (editorEl) {
          editorEl.setAttribute('data-gjs-device', device);
          // Also set on parent wrapper
          const parent = editorEl.parentElement;
          if (parent) {
            parent.setAttribute('data-gjs-device', device);
          }
        }
      };
      
      const forceDesktopFullWidth = () => {
        const frameWrapper = document.querySelector('.gjs-frame-wrapper') as HTMLElement;
        if (frameWrapper) {
          // Use setProperty with 'important' to override GrapesJS inline styles
          frameWrapper.style.setProperty('width', '100%', 'important');
          frameWrapper.style.setProperty('max-width', '100%', 'important');
          frameWrapper.style.setProperty('min-width', '100%', 'important');
          frameWrapper.style.setProperty('box-shadow', 'none', 'important');
          frameWrapper.style.setProperty('margin', '0', 'important');
          frameWrapper.style.setProperty('left', '0', 'important');
        }
      };
      
      // Set initial device attribute on load
      const initialDevice = editorInstance.getDevice() || 'Desktop';
      setDeviceAttribute(initialDevice);
      if (initialDevice === 'Desktop') {
        setTimeout(forceDesktopFullWidth, 200);
      }
      
      editorInstance.on('device:change', () => {
        const device = editorInstance.getDevice();
        const frameWrapper = document.querySelector('.gjs-frame-wrapper') as HTMLElement;
        const framesContainer = document.querySelector('.gjs-cv-canvas__frames') as HTMLElement;
        
        // Set data attribute on editor for CSS targeting
        setDeviceAttribute(device);
        
        // Disconnect any existing observer
        if (desktopObserver) {
          desktopObserver.disconnect();
          desktopObserver = null;
        }
        
        if (frameWrapper) {
          if (device === 'Desktop') {
            // Force full width immediately
            forceDesktopFullWidth();
            
            // Watch for GrapesJS trying to change the width
            desktopObserver = new MutationObserver(() => {
              forceDesktopFullWidth();
            });
            desktopObserver.observe(frameWrapper, { 
              attributes: true, 
              attributeFilter: ['style'] 
            });
            
            if (framesContainer) {
              framesContainer.style.justifyContent = 'flex-start';
            }
          } else {
            // Tablet/Mobile: Remove forced styles
            frameWrapper.style.removeProperty('width');
            frameWrapper.style.removeProperty('max-width');
            frameWrapper.style.removeProperty('min-width');
            frameWrapper.style.removeProperty('left');
            frameWrapper.style.setProperty('box-shadow', '0 0 20px rgba(0,0,0,0.15)');
            frameWrapper.style.setProperty('margin', '0 auto');
            if (framesContainer) {
              framesContainer.style.justifyContent = 'center';
            }
          }
        }
      });

      // Trigger initial device change to set correct styles
      setTimeout(() => {
        editorInstance.trigger('device:change');
      }, 100);
    }, 0); // Minimal delay, just enough to skip React Strict Mode's first invoke

    // Cleanup function
    return () => {
      mountedRef.current = false;
      clearTimeout(initTimeout);
      
      if (editorInstance) {
        console.log('Cleanup: Destroying GrapesJS editor...');
        editorInstance.destroy();
      }
      setEditor(null);
      setIsEditorReady(false);
    };
  }, [pageId, planType, onStorageStatusChange]);

  // -- Theme Injection --
  useEffect(() => {
    if (!editor || !isEditorReady) return;
    
    const doc = editor.Canvas.getDocument();
    if (!doc) return;
    
    let styleEl = doc.getElementById('theme-vars') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = 'theme-vars';
      doc.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      :root {
        --primary-color: ${themeConfig.primaryColor};
        --secondary-color: ${themeConfig.secondaryColor};
        --font-heading: "${themeConfig.fontHeading}", sans-serif;
        --font-body: "${themeConfig.fontBody}", sans-serif;
      }
      h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
      body, p, a, div, span, button, input { font-family: var(--font-body); }
      .text-primary { color: var(--primary-color) !important; }
      .bg-primary { background-color: var(--primary-color) !important; }
      .border-primary { border-color: var(--primary-color) !important; }
      .text-secondary { color: var(--secondary-color) !important; }
      .bg-secondary { background-color: var(--secondary-color) !important; }
    `;
  }, [themeConfig, isEditorReady, editor]);

  // -- Page Config Sync --
  useEffect(() => {
    if (!editor || !isEditorReady || !pageConfig) return;
    
    // Use Canvas document for direct DOM manipulation
    const canvasDoc = editor.Canvas.getDocument();
    if (!canvasDoc) return;

    console.warn('[Product Sync] Syncing product data:', {
      name: pageConfig.featuredProductName,
      price: pageConfig.featuredProductPrice,
      image: pageConfig.featuredProductImage,
    });

    // Sync product name
    if (pageConfig.featuredProductName) {
      const nameElements = canvasDoc.querySelectorAll('.product-name');
      console.warn(`[Product Sync] Found ${nameElements.length} .product-name elements`);
      nameElements.forEach((el: Element) => {
        el.textContent = pageConfig.featuredProductName || '';
      });
    }

    // Sync product price
    if (pageConfig.featuredProductPrice) {
      const formattedPrice = `৳${pageConfig.featuredProductPrice.toLocaleString('bn-BD')}`;
      const priceElements = canvasDoc.querySelectorAll('.product-price');
      console.warn(`[Product Sync] Found ${priceElements.length} .product-price elements`);
      priceElements.forEach((el: Element) => {
        el.textContent = formattedPrice;
      });
    }

    // Sync compare price
    if (pageConfig.featuredProductComparePrice) {
      const formattedCompare = `৳${pageConfig.featuredProductComparePrice.toLocaleString('bn-BD')}`;
      const compareElements = canvasDoc.querySelectorAll('.product-compare-price');
      console.warn(`[Product Sync] Found ${compareElements.length} .product-compare-price elements`);
      compareElements.forEach((el: Element) => {
        el.textContent = formattedCompare;
      });
    }

    // Sync product image
    if (pageConfig.featuredProductImage) {
      const imageElements = canvasDoc.querySelectorAll('.product-image');
      console.warn(`[Product Sync] Found ${imageElements.length} .product-image elements`);
      imageElements.forEach((el: Element) => {
        if (el.tagName.toLowerCase() === 'img') {
          (el as HTMLImageElement).src = pageConfig.featuredProductImage || '';
        }
      });
    }

    // Sync WhatsApp link
    if (pageConfig.whatsappNumber) {
      const msg = encodeURIComponent(pageConfig.whatsappMessage || '');
      const url = `https://wa.me/${pageConfig.whatsappNumber}?text=${msg}`;
      const whatsappLinks = canvasDoc.querySelectorAll('.whatsapp-link');
      whatsappLinks.forEach((el: Element) => {
        if (el.tagName.toLowerCase() === 'a') {
          (el as HTMLAnchorElement).href = url;
        }
      });
    }
  }, [pageConfig, isEditorReady, editor]);

  // -- Tab Switch Event Listener --
  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent) => {
      if (e.detail) setActiveSidebarTab(e.detail);
    };
    window.addEventListener('switch-sidebar-tab', handleTabSwitch as EventListener);
    return () => window.removeEventListener('switch-sidebar-tab', handleTabSwitch as EventListener);
  }, []);

  // -- Template Loading --
  const handleLoadTemplate = useCallback(async (templateId: string) => {
    if (!editor) return;
    
    try {
      const { TEMPLATE_CONFIGS } = await import('~/lib/grapesjs/template-configs');
      const template = TEMPLATE_CONFIGS[templateId];
      
      if (!template) {
        toast.error(t('templateNotFound') || 'Template not found');
        return;
      }

      editor.DomComponents.clear();
      
      let blocksAdded = 0;
      template.blocks.forEach((blockId: string) => {
        const block = editor.Blocks.get(blockId);
        if (block) {
          const content = typeof block.getContent === 'function' 
            ? block.getContent() 
            : block.get('content');
          if (content) {
            editor.addComponents(content);
            blocksAdded++;
          }
        }
      });

      if (blocksAdded === 0) {
        toast.error(t('loadTemplateBlocksError') || 'Could not load template blocks');
        return;
      }

      setThemeConfig(prev => ({
        ...prev,
        ...template.themeColors,
      }));

      editor.UndoManager.clear();
      toast.success(t('templateLoaded') || 'Template loaded!');
    } catch (err) {
      console.error('Template load failed:', err);
      toast.error(t('loadTemplateError') || 'Failed to load template');
    }
  }, [editor]);

  const isAiLocked = planType === 'free';
  const publishedPageUrl = publishedBaseUrl && pageSlug 
    ? `${publishedBaseUrl}/p/${pageSlug}` 
    : undefined;

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* Toolbar */}
        <EditorToolbar 
          isAiLocked={isAiLocked} 
          onOpenLibrary={() => setIsBlockLibraryOpen(true)}
          onToggleAISidebar={() => setIsAISidebarOpen(!isAISidebarOpen)}
          isAISidebarOpen={isAISidebarOpen}
          publishedPageUrl={publishedPageUrl}
          pageId={pageId}
          editor={editor}
          mainAppUrl={mainAppUrl}
        />
        
        <div className="flex flex-1 overflow-hidden min-h-0 relative">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed left-2 bottom-20 z-50 md:hidden w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>

          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar - Hidden on mobile by default, slide-in when open */}
          <div className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-auto
            h-full overflow-hidden flex-shrink-0
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
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

          {/* Canvas Area - EXPLICIT height required for GrapesJS */}
          <div 
            className="bg-gray-100 overflow-hidden relative flex-1 min-w-0"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* GrapesJS Container */}
            <div 
              ref={containerRef} 
              id="gjs"
              className="w-full h-full"
              style={{ height: '100%', width: '100%' }}
            />
            
            {/* Loading Overlay */}
            {!isEditorReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-2" />
                  <span className="text-gray-500 font-medium">{t('initializingEditor')}</span>
                </div>
              </div>
            )}

            {/* Context Menu */}
            {contextMenuPos && (
              <ContextMenu 
                editor={editor}
                position={contextMenuPos}
                onClose={() => setContextMenuPos(null)}
              />
            )}
          </div>

          {/* AI Sidebar */}
          {!isAiLocked && (
            <AISidebar
              editor={editor}
              isOpen={isAISidebarOpen}
              onClose={() => setIsAISidebarOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Block Library Modal */}
      <BlockLibraryModal 
        isOpen={isBlockLibraryOpen}
        onClose={() => setIsBlockLibraryOpen(false)}
        editor={editor}
      />
      
      {/* Scoped Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Base editor sizing */
        .gjs-cv-canvas { 
          height: 100% !important;
          width: 100% !important;
          top: 0 !important;
          left: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          background: #e5e7eb !important;
        }
        .gjs-editor { height: 100% !important; }
        .gjs-editor-cont { height: 100% !important; }
        
        /* Hide default GrapesJS panels (we use our own sidebar) */
        .gjs-pn-panels { display: none !important; }
        .gjs-pn-views-container { display: none !important; }
        .gjs-pn-commands { display: none !important; }
        .gjs-pn-views { display: none !important; }
        
        /* Canvas frames container - stretch to fill for Desktop, center for others */
        .gjs-cv-canvas__frames {
          height: 100% !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
        }
        
        /* Frame wrapper - width controlled by JS device handler */
        .gjs-frame-wrapper {
          height: 100% !important;
          transition: box-shadow 0.3s ease !important;
          background: white !important;
        }
        
        /* Hide frame wrapper resize handles */
        .gjs-frame-wrapper__top,
        .gjs-frame-wrapper__left,
        .gjs-frame-wrapper__right,
        .gjs-frame-wrapper__bottom {
          display: none !important;
        }
        
        /* Frame (iframe) - fill wrapper */
        .gjs-frame {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Remove canvas toolbar spacing */
        .gjs-cv-canvas__toolbar {
          /* display: none !important; */
        }
        
        /* Scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
      `}} />
    </div>
  );
}

