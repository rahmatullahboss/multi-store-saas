  Monitor, 
  Smartphone, 
  Tablet,
  Undo, 
  Redo, 
  Eye, 
  Save, 
  Send,
  Trash2,
  Sparkles, 
  Wand2,
  X,
  Code,
  Check,
  Lock,
  Layout,
  Copy,
  ExternalLink,
  Link2,
  PanelRightOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';
import CodeEditor from './CodeEditor';
import ButtonConnectorModal, { type ButtonConnection } from './ButtonConnectorModal';
import { generateHandlerScript } from './ButtonActionHandler';

export default function EditorToolbar({ 
  isAiLocked = false,
  onOpenLibrary,
  onToggleAISidebar,
  isAISidebarOpen,
  publishedPageUrl,
  pageId,
  editor
}: { 
  isAiLocked?: boolean,
  onOpenLibrary?: () => void,
  onToggleAISidebar?: () => void,
  isAISidebarOpen?: boolean,
  publishedPageUrl?: string,
  pageId?: string,
  editor?: any
}) {
  const { t, lang } = useTranslation();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [connectedButtonsCount, setConnectedButtonsCount] = useState(0);

  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  useEffect(() => {
    if (!editor) return;

    const onSelected = () => setSelectedComponent(editor.getSelected());
    const onDeselected = () => setSelectedComponent(null);

    editor.on('component:selected', onSelected);
    editor.on('component:deselected', onDeselected);

    return () => {
      editor.off('component:selected', onSelected);
      editor.off('component:deselected', onDeselected);
    };
  }, [editor]);

  // Wait for editor to be ready
  if (!editor) {
    return (
      <div className="flex items-center justify-center px-4 py-2 bg-white border-b border-gray-200 h-12">
        <p className="text-gray-400 text-xs font-medium">{t('loadingEditor')}</p>
      </div>
    );
  }

  const handleDeviceChange = (device: string) => {
    editor.setDevice(device);
  };

  const handleSave = async () => {
    try {
      toast.loading(t('savingDraft'), { id: 'save-draft' });
      await editor.store();
      toast.success(t('draftSaved'), { id: 'save-draft' });
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(t('saveDraftFailed'), { id: 'save-draft' });
    }
  };


  const handlePublish = async () => {
    try {
      toast.loading(t('publishingPage'), { id: 'publish' });
      
      // Set publishing flag on editor instance (read by storage:start:store hook in Editor.tsx)
      (editor as any).isPublishing = true;
      
      await editor.store();
      
      // Reset flag
      (editor as any).isPublishing = false;
      
      // Copy URL to clipboard if available
      if (publishedPageUrl) {
        try {
          await navigator.clipboard.writeText(publishedPageUrl);
          toast.success(
            <div className="flex flex-col gap-1">
              <span className="font-bold">{t('pagePublished')}</span>
              <span className="text-xs opacity-75">URL copied: {publishedPageUrl}</span>
              <a 
                href={publishedPageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
              >
                {t('openPage') || 'Open Page'} <ExternalLink size={10} />
              </a>
            </div>,
            { id: 'publish', duration: 6000 }
          );
        } catch {
          toast.success(t('pagePublished'), { id: 'publish' });
        }
      } else {
        toast.success(t('pagePublished'), { id: 'publish' });
      }
    } catch (error) {
      console.error('Publish error:', error);
      (editor as any).isPublishing = false;
      toast.error(t('publishFailed'), { id: 'publish' });
    }
  };

  const handleOpenCode = () => {
    if (selectedComponent) {
      const html = selectedComponent.toHTML();
      // Format HTML nicely
      setCodeContent(html_beautify(html));
    } else {
      const html = editor.getHtml();
      setCodeContent(html_beautify(html));
    }
    setIsCodeModalOpen(true);
  };

  const handleSaveCode = () => {
    try {
      if (!codeContent.trim()) return;

      let htmlToApply = codeContent;
      let cssToApply = '';
      let bodyAttrs: Record<string, string> = {};
      let bodyClasses: string[] = [];
      let isFullDocument = false;

      // Check if it's a full document
      if (codeContent.includes('<body') || codeContent.includes('<html')) {
        isFullDocument = true;
        const doc = new DOMParser().parseFromString(codeContent, 'text/html');
        
        // 1. Extract Body Content & Attributes
        if (doc.body) {
          htmlToApply = doc.body.innerHTML;
          
          // Capture Body Classes
          doc.body.classList.forEach(cls => bodyClasses.push(cls));
          
          // Capture Body Attributes (style, id, data-*, etc.)
          Array.from(doc.body.attributes).forEach(attr => {
            if (attr.name !== 'class') {
              bodyAttrs[attr.name] = attr.value;
            }
          });
        }

        // 2. Extract and combine style blocks & stylesheet links
      const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('\n');
      
      // Capture external stylesheets
      const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(link => link.outerHTML).join('');
      
      if (styles) cssToApply = styles;
      if (links) htmlToApply += links; // Append links to valid HTML body so GrapesJS parses them

      }

      if (selectedComponent) {
        // FIX: Use parent.append instead of replaceWith to preserve emojis/unicode
        const parent = selectedComponent.parent();
        if (parent) {
          const index = selectedComponent.index();
          // Add new component at the same position
          const newComps = parent.append(htmlToApply, { at: index });
          // Remove the old component
          selectedComponent.remove();
          // Select the first new component
          if (newComps && newComps.length > 0) {
            editor.select(newComps[0]);
          }
        } else {
          // Fallback if no parent
          selectedComponent.replaceWith(htmlToApply);
        }
        if (cssToApply) editor.addStyle(cssToApply);
        toast.success(t('importSuccess'));
      } else {
        // === Full Page Update ===
        
        // 0. CRITICAL: Remove theme overrides from canvas iframe for clean import
        if (isFullDocument) {
          try {
            const frame = editor.Canvas.getFrameEl();
            if (frame && frame.contentDocument) {
              const canvasDoc = frame.contentDocument;
              
              // Remove theme-variables-style
              const themeStyle = canvasDoc.getElementById('theme-variables-style');
              if (themeStyle) themeStyle.remove();
            }
          } catch (e) {
            console.warn('Could not access canvas iframe:', e);
          }
          
          // Clear existing GrapesJS CSS rules
          const cssComposer = editor.CssComposer;
          if (cssComposer) cssComposer.clear();
        }
        
        // 1. Set Components (Content)
        editor.setComponents(htmlToApply);
        
        // 2. Add Styles (Global CSS)
        if (cssToApply) editor.addStyle(cssToApply);

        // 3. Apply Body/HTML Attributes to Wrapper
        const wrapper = editor.getWrapper();
        if (wrapper) {
            // A. Clear and apply classes
            if (isFullDocument) wrapper.setClass([]);
            if (bodyClasses.length > 0) wrapper.addClass(bodyClasses); 
            
            // B. Apply Attributes (ID, data-*, etc.)
            Object.entries(bodyAttrs).forEach(([key, value]) => {
                if (key !== 'style') wrapper.addAttributes({ [key]: value });
            });

            // C. Apply Body Inline Styles
            if (bodyAttrs['style']) {
                const styleObj: Record<string, string> = {};
                bodyAttrs['style'].split(';').forEach(rule => {
                    const parts = rule.split(':');
                    if (parts.length >= 2) {
                        const prop = parts[0].trim();
                        const val = parts.slice(1).join(':').trim();
                        if (prop && val) styleObj[prop] = val;
                    }
                });
                wrapper.addStyle(styleObj);
            }
            
            // D. Ensure Wrapper covers full height
            wrapper?.addStyle({ 'min-height': '100vh', 'overflow-x': 'hidden' });
        }
        toast.success(t('importSuccess'));
      }
      setIsCodeModalOpen(false);
    } catch (error) {
      console.error('Save code error:', error);
      toast.error(t('applyFailed'));
    }
  };

  // Simple formatter since we don't have a library
  const html_beautify = (html: string) => {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    html = html.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    html.split('\r\n').forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        let padding = '';
        for (let i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm relative z-10">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleDeviceChange('Desktop')}
          className="p-2 hover:bg-gray-100 rounded-lg transition group"
          title={t('desktopView')}
        >
          <Monitor size={18} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <button 
          onClick={() => handleDeviceChange('Tablet')}
          className="p-2 hover:bg-gray-100 rounded-lg transition group"
          title={t('tabletView')}
        >
          <Tablet size={18} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <button 
          onClick={() => handleDeviceChange('Mobile')}
          className="p-2 hover:bg-gray-100 rounded-lg transition group"
          title={t('mobileView')}
        >
          <Smartphone size={18} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button 
          onClick={() => editor.UndoManager.undo()}
          className="p-2 hover:bg-gray-100 rounded-lg transition group disabled:opacity-30"
          title={t('undo')}
        >
          <Undo size={16} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
      <button 
          onClick={() => editor.UndoManager.redo()}
          className="p-2 hover:bg-gray-100 rounded-lg transition group disabled:opacity-30"
          title={t('redo')}
        >
          <Redo size={16} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button 
          onClick={() => {
            if (confirm(t('confirmClearCanvas'))) {
              editor.DomComponents.clear();
            }
          }}
          className="p-2 hover:bg-red-50 rounded-lg transition group"
          title={t('clearCanvas')}
        >
          <Trash2 size={16} className="text-gray-500 group-hover:text-red-600" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenLibrary}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-white hover:border-indigo-500 hover:text-indigo-600 rounded-xl transition border shadow-sm group"
          title={t('addBlock')}
        >
          <Layout size={14} className="group-hover:scale-110 transition-transform" />
          {t('addBlock')}
        </button>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        {selectedComponent ? (
          <button 
            onClick={() => {
              if (isAiLocked) {
                editor.runCommand('open-ai-design-modal');
              } else if (onToggleAISidebar) {
                onToggleAISidebar();
              } else {
                editor.runCommand('open-ai-design-modal');
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition shadow-md animate-in fade-in zoom-in group relative ${
              isAiLocked 
                ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-100 hover:from-slate-500 hover:to-slate-600' 
                : isAISidebarOpen
                  ? 'bg-violet-600 text-white shadow-violet-100 ring-2 ring-violet-500 ring-offset-2'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-100'
            }`}
            title={isAiLocked ? (t('unlockMagicAi') || "Unlock Magic AI (Premium)") : (t('editElementAi') || "Edit Selected Element with AI")}
          >
            {isAiLocked ? (
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-white/80" />
                <span>{t('magicEditLabel') || 'MAGIC EDIT'}</span>
                <span className="bg-white/20 text-[8px] px-1 rounded-sm backdrop-blur-sm">{t('proBadge') || 'PRO'}</span>
              </div>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{t('magicEdit')}</span>
                {isAISidebarOpen && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />}
              </>
            )}
          </button>
        ) : (
          <button 
            onClick={() => {
              if (isAiLocked) {
                editor.runCommand('open-magic-modal');
              } else if (onToggleAISidebar) {
                onToggleAISidebar();
              } else {
                editor.runCommand('open-magic-modal');
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition border shadow-sm group relative ${
              isAiLocked
                ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-slate-50'
                : isAISidebarOpen
                  ? 'text-violet-600 bg-violet-50 border-violet-200 ring-2 ring-violet-500 ring-offset-2'
                  : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100 shadow-emerald-50'
            }`}
            title={isAiLocked ? (t('unlockMagicAi') || "Unlock Magic AI (Premium)") : (t('generateWithAi') || "Generate Page with AI")}
          >
            {isAiLocked ? (
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>{t('magicAiLabel') || 'MAGIC AI'}</span>
                <span className="bg-slate-200 text-slate-600 text-[8px] px-1 rounded-sm">{t('proBadge') || 'PRO'}</span>
              </div>
            ) : (
              <>
                <Wand2 size={14} />
                <span>{t('magicAi')}</span>
                {isAISidebarOpen && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-white animate-pulse" />}
              </>
            )}
          </button>
        )}

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        <button 
          onClick={handleOpenCode}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition border border-transparent hover:border-gray-200"
          title={selectedComponent ? t('editElementHtml') : t('editPageHtml')}
        >
          <Code size={14} />
          {t('code')}
        </button>

        {/* Connect with Backend Button */}
        <button 
          onClick={() => setIsConnectorModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition border ${
            connectedButtonsCount > 0
              ? 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
              : 'text-gray-600 hover:bg-gray-100 border-transparent hover:border-gray-200'
          }`}
          title={t('connectButtonsBackend')}
        >
          <Link2 size={14} />
          {t('connect')}
          {connectedButtonsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full leading-none">
              {connectedButtonsCount}
            </span>
          )}
        </button>

        <button 
          onClick={async () => {
            if (pageId) {
              try {
                toast.loading(t('savingForPreview') || 'Preparing preview...', { id: 'preview' });
                await editor.store();
                toast.dismiss('preview');
                window.open(`/app/page-builder/preview/${pageId}`, '_blank');
              } catch (error) {
                console.error('Preview save error:', error);
                toast.error(t('previewFailed'), { id: 'preview' });
              }
            } else {
              // Fallback to inline preview if no pageId
              editor.runCommand('core:preview');
            }
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          title={t('previewInNewTab') || 'Preview in New Tab'}
        >
          <Eye size={14} />
          {t('preview')}
        </button>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-100"
        >
          <Save size={14} />
          {t('saveDraft')}
        </button>
        <button 
          onClick={handlePublish}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-100"
        >
          <Send size={14} />
          {t('publish')}
        </button>

      </div>


      {/* Code Editor Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                       <Code size={16} className="text-gray-600" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-gray-900">
                         {selectedComponent ? t('editElementHtml') : t('editPageHtml')}
                       </h3>
                       <p className="text-[10px] text-gray-500 font-medium font-mono">
                         {selectedComponent ? `<${selectedComponent.get('tagName') || 'div'}>` : '<body>'}
                       </p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsCodeModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition text-gray-400 hover:text-gray-600"
                 >
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 relative bg-[#1e1e1e]">
                 <CodeEditor 
                    value={codeContent}
                    onChange={(val) => setCodeContent(val || '')}
                    language="html"
                 />
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-2">
                <button 
                   onClick={() => setIsCodeModalOpen(false)}
                   className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                >
                   {t('cancel')}
                </button>
                <button 
                   onClick={handleSaveCode}
                   className="px-6 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition shadow-lg flex items-center gap-2"
                >
                   <Check size={14} />
                   {t('applyChanges')}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Button Connector Modal */}
      <ButtonConnectorModal
        isOpen={isConnectorModalOpen}
        onClose={() => setIsConnectorModalOpen(false)}
        htmlContent={editor?.getHtml() || ''}
        onApply={(connections) => {
          if (!editor) return;
          
          // Apply connections to the HTML
          const wrapper = editor.getWrapper();
          if (!wrapper) return;
          
          connections.forEach(conn => {
            // Find components matching the selector pattern
            const components = wrapper.findType('*').filter((comp: any) => {
              const tagName = comp.get('tagName') || '';
              const classes = comp.getClasses().join(' ');
              const id = comp.get('id') || '';
              
              // Match by ID
              if (conn.selector.startsWith('#') && id === conn.selector.slice(1)) {
                return true;
              }
              // Match by tag and class
              if (conn.selector.includes('.')) {
                const [tag, ...classNames] = conn.selector.split('.');
                const hasTag = !tag || tagName.toLowerCase() === tag.toLowerCase();
                const hasClasses = classNames.every(c => classes.includes(c));
                return hasTag && hasClasses;
              }
              return false;
            });
            
            // Apply attributes to matched components
            components.forEach((comp: any) => {
              comp.addAttributes({
                'data-ozzyl-action': conn.actionType,
                ...(conn.productId && { 'data-ozzyl-product': conn.productId.toString() }),
                ...(conn.phoneNumber && { 'data-ozzyl-phone': conn.phoneNumber }),
                ...(conn.messageTemplate && { 'data-ozzyl-message': conn.messageTemplate })
              });
            });
          });
          
          setConnectedButtonsCount(connections.length);
          toast.success(t('buttonsConnectedCount', { count: connections.length }));
        }}
      />
    </div>
  );
}
