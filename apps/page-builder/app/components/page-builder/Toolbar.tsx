import { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Undo,
  Redo,
  Eye,
  Save,
  Send,
  Wand2,
  Trash2,
  Sparkles,
  X,
  Code,
  Check,
  Lock,
  Layout,
  ExternalLink,
  Link2,
  Menu,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '~/contexts/LanguageContext';
import CodeEditor from './CodeEditor';
import ButtonConnectorModal from './ButtonConnectorModal';
import HistoryPanel from './HistoryPanel';

export default function EditorToolbar({
  isAiLocked = false,
  onOpenLibrary,
  onToggleAISidebar,
  isAISidebarOpen,
  publishedPageUrl,
  pageId,
  editor,
  mainAppUrl = 'https://ozzyl.com',
}: {
  isAiLocked?: boolean;
  onOpenLibrary?: () => void;
  onToggleAISidebar?: () => void;
  isAISidebarOpen?: boolean;
  publishedPageUrl?: string;
  pageId?: string;
  editor?: any;
  mainAppUrl?: string;
}) {
  const { t } = useLanguage();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [connectedButtonsCount, setConnectedButtonsCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  // Helper function to count existing connections
  const countExistingConnections = useCallback(() => {
    if (!editor) return 0;
    const wrapper = editor.getWrapper();
    if (!wrapper) return 0;

    const allComponents = wrapper.findType('*');
    let count = 0;
    allComponents.forEach((comp: any) => {
      const attrs = comp.getAttributes();
      if (attrs['data-ozzyl-action']) {
        count++;
      }
    });
    return count;
  }, [editor]);

  // Count existing connections when editor is ready
  useEffect(() => {
    if (!editor) return;

    // Count on editor ready
    const handleEditorReady = () => {
      const count = countExistingConnections();
      setConnectedButtonsCount(count);
    };

    // Try to count immediately (editor might already be ready)
    setTimeout(handleEditorReady, 500);

    // Also listen for load event
    editor.on('load', handleEditorReady);

    return () => {
      editor.off('load', handleEditorReady);
    };
  }, [editor, countExistingConnections]);

  // Update count when modal opens
  useEffect(() => {
    if (isConnectorModalOpen && editor) {
      const count = countExistingConnections();
      setConnectedButtonsCount(count);
    }
  }, [isConnectorModalOpen, editor, countExistingConnections]);

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
      const bodyAttrs: Record<string, string> = {};
      const bodyClasses: string[] = [];
      let isFullDocument = false;

      // Check if it's a full document
      if (codeContent.includes('<body') || codeContent.includes('<html')) {
        isFullDocument = true;
        const doc = new DOMParser().parseFromString(codeContent, 'text/html');

        // 1. Extract Body Content & Attributes
        if (doc.body) {
          htmlToApply = doc.body.innerHTML;

          // Capture Body Classes
          doc.body.classList.forEach((cls) => bodyClasses.push(cls));

          // Capture Body Attributes (style, id, data-*, etc.)
          Array.from(doc.body.attributes).forEach((attr) => {
            if (attr.name !== 'class') {
              bodyAttrs[attr.name] = attr.value;
            }
          });
        }

        // 2. Extract and combine style blocks & stylesheet links
        const styles = Array.from(doc.querySelectorAll('style'))
          .map((s) => s.textContent)
          .join('\n');

        // Capture external stylesheets
        const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
          .map((link) => link.outerHTML)
          .join('');

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
            bodyAttrs['style'].split(';').forEach((rule) => {
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

  /**
   * Improved HTML beautifier with better handling of:
   * - Self-closing tags (img, br, hr, input, meta, link)
   * - Void elements
   * - Script/Style content preservation
   * - Inline elements
   */
  const html_beautify = (html: string): string => {
    // Preserve script and style content
    const preserved: string[] = [];
    let preserveIndex = 0;

    // Preserve <script> and <style> content
    html = html.replace(
      /<(script|style)([^>]*)>([\s\S]*?)<\/\1>/gi,
      (match, tag, attrs, content) => {
        const placeholder = `__PRESERVE_${preserveIndex}__`;
        preserved.push(match);
        preserveIndex++;
        return placeholder;
      }
    );

    // Self-closing/void elements that shouldn't increase indent
    const voidElements = new Set([
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ]);

    // Add newlines between tags
    html = html.replace(/>\s*</g, '>\n<');

    const lines = html.split('\n');
    let formatted = '';
    let indent = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for closing tag
      const closingMatch = trimmed.match(/^<\/(\w+)/);
      if (closingMatch) {
        indent = Math.max(0, indent - 1);
      }

      // Add indentation
      formatted += '  '.repeat(indent) + trimmed + '\n';

      // Check for opening tag (not self-closing, not void, not closing)
      const openingMatch = trimmed.match(/^<(\w+)(?:\s|>)/);
      if (openingMatch) {
        const tagName = openingMatch[1].toLowerCase();
        const isSelfClosing = trimmed.endsWith('/>') || voidElements.has(tagName);
        const hasClosingTag = trimmed.includes(`</${tagName}>`);

        if (!isSelfClosing && !hasClosingTag && !closingMatch) {
          indent++;
        }
      }
    }

    // Restore preserved content
    preserved.forEach((content, i) => {
      formatted = formatted.replace(`__PRESERVE_${i}__`, content);
    });

    return formatted.trim();
  };

  return (
    <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-white border-b border-gray-200 shadow-sm relative z-10">
      {/* Left side - Device switcher & Undo/Redo (always visible) */}
      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => handleDeviceChange('Desktop')}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition group"
          title={t('desktopView')}
        >
          <Monitor
            size={16}
            className="md:w-[18px] md:h-[18px] text-gray-500 group-hover:text-emerald-600"
          />
        </button>
        <button
          onClick={() => handleDeviceChange('Tablet')}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition group hidden sm:flex"
          title={t('tabletView')}
        >
          <Tablet
            size={16}
            className="md:w-[18px] md:h-[18px] text-gray-500 group-hover:text-emerald-600"
          />
        </button>
        <button
          onClick={() => handleDeviceChange('Mobile')}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition group"
          title={t('mobileView')}
        >
          <Smartphone
            size={16}
            className="md:w-[18px] md:h-[18px] text-gray-500 group-hover:text-emerald-600"
          />
        </button>
        <div className="w-[1px] h-5 md:h-6 bg-gray-200 mx-0.5 md:mx-1 hidden sm:block" />
        <button
          onClick={() => editor.UndoManager.undo()}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition group disabled:opacity-30"
          title={t('undo')}
        >
          <Undo size={14} className="md:w-4 md:h-4 text-gray-500 group-hover:text-emerald-600" />
        </button>
        <button
          onClick={() => editor.UndoManager.redo()}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition group disabled:opacity-30"
          title={t('redo')}
        >
          <Redo size={14} className="md:w-4 md:h-4 text-gray-500 group-hover:text-emerald-600" />
        </button>
      </div>

      {/* Center - Primary actions (hidden on mobile, shown on md+) */}
      <div className="hidden md:flex items-center gap-3">
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
        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-white hover:border-indigo-500 hover:text-indigo-600 rounded-xl transition border shadow-sm group"
          title={t('addBlock')}
        >
          <Layout size={14} className="group-hover:scale-110 transition-transform" />
          {t('addBlock')}
        </button>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition group"
          title="Revision History"
        >
          <Clock size={16} className="text-gray-500 group-hover:text-emerald-600" />
        </button>

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
            title={
              isAiLocked
                ? t('unlockMagicAi') || 'Unlock Magic AI (Premium)'
                : t('editElementAi') || 'Edit Selected Element with AI'
            }
          >
            {isAiLocked ? (
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-white/80" />
                <span>{t('magicEditLabel') || 'MAGIC EDIT'}</span>
                <span className="bg-white/20 text-[8px] px-1 rounded-sm backdrop-blur-sm">
                  {t('proBadge') || 'PRO'}
                </span>
              </div>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{t('magicEdit')}</span>
                {isAISidebarOpen && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                )}
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
            title={
              isAiLocked
                ? t('unlockMagicAi') || 'Unlock Magic AI (Premium)'
                : t('generateWithAi') || 'Generate Page with AI'
            }
          >
            {isAiLocked ? (
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>{t('magicAiLabel') || 'MAGIC AI'}</span>
                <span className="bg-slate-200 text-slate-600 text-[8px] px-1 rounded-sm">
                  {t('proBadge') || 'PRO'}
                </span>
              </div>
            ) : (
              <>
                <Wand2 size={14} />
                <span>{t('magicAi')}</span>
                {isAISidebarOpen && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-white animate-pulse" />
                )}
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
                window.open(`${mainAppUrl}/preview/${pageId}`, '_blank');
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
      </div>

      {/* Right side - Save & Publish (always visible), hamburger menu on mobile */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile hamburger menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition md:hidden"
          title="Menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg md:rounded-xl transition shadow-md shadow-emerald-100"
        >
          <Save size={12} className="md:w-[14px] md:h-[14px]" />
          <span className="hidden sm:inline">{t('saveDraft')}</span>
        </button>
        <button
          onClick={handlePublish}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl transition shadow-md shadow-blue-100"
        >
          <Send size={12} className="md:w-[14px] md:h-[14px]" />
          <span className="hidden sm:inline">{t('publish')}</span>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-2 px-3 md:hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (confirm(t('confirmClearCanvas'))) {
                  editor.DomComponents.clear();
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-3 hover:bg-red-50 rounded-xl transition"
            >
              <Trash2 size={18} className="text-gray-500" />
              <span className="text-[10px] font-medium text-gray-600">{t('clearCanvas')}</span>
            </button>
            <button
              onClick={() => {
                onOpenLibrary?.();
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-3 hover:bg-indigo-50 rounded-xl transition"
            >
              <Layout size={18} className="text-indigo-600" />
              <span className="text-[10px] font-medium text-gray-600">{t('addBlock')}</span>
            </button>
            <button
              onClick={() => {
                if (isAiLocked) {
                  editor.runCommand('open-magic-modal');
                } else if (onToggleAISidebar) {
                  onToggleAISidebar();
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-3 hover:bg-purple-50 rounded-xl transition"
            >
              <Wand2 size={18} className="text-purple-600" />
              <span className="text-[10px] font-medium text-gray-600">{t('magicAi')}</span>
            </button>
            <button
              onClick={() => {
                handleOpenCode();
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition"
            >
              <Code size={18} className="text-gray-600" />
              <span className="text-[10px] font-medium text-gray-600">{t('code')}</span>
            </button>
            <button
              onClick={() => {
                setIsConnectorModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-3 hover:bg-indigo-50 rounded-xl transition relative"
            >
              <Link2 size={18} className="text-indigo-600" />
              <span className="text-[10px] font-medium text-gray-600">{t('connect')}</span>
              {connectedButtonsCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] rounded-full">
                  {connectedButtonsCount}
                </span>
              )}
            </button>
            <button
              onClick={async () => {
                if (pageId) {
                  try {
                    toast.loading(t('savingForPreview') || 'Preparing preview...', {
                      id: 'preview',
                    });
                    await editor.store();
                    toast.dismiss('preview');
                    window.open(`${mainAppUrl}/preview/${pageId}`, '_blank');
                  } catch (error) {
                    console.error('Preview save error:', error);
                    toast.error(t('previewFailed'), { id: 'preview' });
                  }
                } else {
                  editor.runCommand('core:preview');
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition"
            >
              <Eye size={18} className="text-gray-600" />
              <span className="text-[10px] font-medium text-gray-600">{t('preview')}</span>
            </button>
          </div>
        </div>
      )}

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
                    {selectedComponent
                      ? `<${selectedComponent.get('tagName') || 'div'}>`
                      : '<body>'}
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
        editor={editor}
        onApply={(connections) => {
          if (!editor) return;

          // Apply connections to the HTML
          const wrapper = editor.getWrapper();
          if (!wrapper) return;

          try {
            // Start an UndoManager transaction
            (editor as any).UndoManager?.start();

            connections.forEach((conn) => {
              // Find components matching the selector pattern
              const allComponents = wrapper.findType('*');

              const components = allComponents.filter((comp: any) => {
                const tagName = (comp.get('tagName') || '').toLowerCase();
                const classes = comp.getClasses().join(' ').toLowerCase();
                const id = comp.get('id') || '';
                const text = (comp.get('content') || comp.view?.el?.textContent || '')
                  .trim()
                  .toLowerCase();

                // Match by ID
                if (conn.selector.startsWith('#') && id === conn.selector.slice(1)) {
                  return true;
                }

                // Match by tag and class (e.g., "a.btn.order-btn")
                if (conn.selector.includes('.')) {
                  const parts = conn.selector.split('.');
                  const selectorTag = parts[0].toLowerCase();
                  const selectorClasses = parts.slice(1).map((c) => c.toLowerCase());

                  const hasTag = !selectorTag || tagName === selectorTag;
                  const hasClasses = selectorClasses.every((c) => classes.includes(c));

                  if (hasTag && hasClasses) {
                    return true;
                  }
                }

                // Match by nth-of-type (fallback for elements without ID/class)
                if (conn.selector.includes(':nth-of-type')) {
                  const selectorTag = conn.selector.split(':')[0].toLowerCase();
                  if (tagName === selectorTag) {
                    // For nth-of-type, we need to check all and match first one
                    // This is a simplified match
                    return true;
                  }
                }

                // Text-based fallback for buttons
                // If the button text matches patterns, connect it
                if (text && text.length < 50) {
                  if (text.includes('অর্ডার') && conn.actionType === 'order') return true;
                  if (text.includes('order') && conn.actionType === 'order') return true;
                  if (text.includes('whatsapp') && conn.actionType === 'whatsapp') return true;
                  if (text.includes('হোয়াটসঅ্যাপ') && conn.actionType === 'whatsapp') return true;
                  if (text.includes('কল') && conn.actionType === 'call') return true;
                  if (text.includes('call') && conn.actionType === 'call') return true;
                }

                return false;
              });

              // Log matched components count for debugging

              // Apply attributes to matched components
              components.forEach((comp: any) => {
                comp.addAttributes({
                  'data-ozzyl-action': conn.actionType,
                  ...(conn.productId && { 'data-ozzyl-product': conn.productId.toString() }),
                  ...(conn.phoneNumber && { 'data-ozzyl-phone': conn.phoneNumber }),
                  ...(conn.messageTemplate && { 'data-ozzyl-message': conn.messageTemplate }),
                });
                // Successfully applied connection
              });
            });

            // End the transaction
            (editor as any).UndoManager?.stop();

            // CRITICAL: Explicitly trigger storage to persist changes
            editor
              .store()
              .then(() => {
                // Changes stored successfully
              })
              .catch((err: any) => {
                console.error('[ButtonConnector] Failed to store changes:', err);
              });

            setConnectedButtonsCount(connections.length);
            toast.success(t('buttonsConnectedCount', { count: connections.length }));
          } catch (err) {
            console.error('[ButtonConnector] Error applying connections:', err);
            toast.error(t('errorApplyingConnections') || 'Failed to apply connections');
          }
        }}
      />

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        pageId={pageId}
        editor={editor}
      />
    </div>
  );
}
