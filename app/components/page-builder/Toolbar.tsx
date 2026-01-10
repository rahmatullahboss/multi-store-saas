import { useState, useEffect } from 'react';
import { useEditorMaybe } from '@grapesjs/react';
import { 
  Monitor, 
  Smartphone, 
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
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditorToolbar() {
  const editor = useEditorMaybe();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeContent, setCodeContent] = useState('');

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
        <p className="text-gray-400 text-xs font-medium">Loading editor...</p>
      </div>
    );
  }

  const handleDeviceChange = (device: string) => {
    editor.setDevice(device);
  };

  const handleSave = async () => {
    try {
      toast.loading('Saving draft...', { id: 'save-draft' });
      await editor.store();
      toast.success('Draft saved successfully!', { id: 'save-draft' });
    } catch (error) {
      toast.error('Failed to save draft', { id: 'save-draft' });
    }
  };


  const handlePublish = async () => {
    try {
      toast.loading('Publishing page...', { id: 'publish' });
      
      // Get storage manager and current options
      const sm = editor.StorageManager;
      const remote = sm.get('remote');
      
      if (!remote) {
        throw new Error('Remote storage not configured');
      }

      const originalUrl = remote.get('urlStore') as string;
      
      // Temporarily add publish flag
      const publishUrl = `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}publish=true`;
      remote.set('urlStore', publishUrl);
      
      await editor.store();
      
      // Restore original URL
      remote.set('urlStore', originalUrl);
      
      toast.success('Page live and published!', { id: 'publish' });
    } catch (error) {
      toast.error('Failed to publish page', { id: 'publish' });
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

      // Robust extraction for full HTML documents
      let htmlToApply = codeContent;
      let cssToApply = '';

      // Check if it's a full document
      if (codeContent.includes('<body') || codeContent.includes('<style')) {
        const doc = new DOMParser().parseFromString(codeContent, 'text/html');
        
        // Extract body content
        const bodyContent = doc.body.innerHTML;
        if (bodyContent) htmlToApply = bodyContent;

        // Extract and combine style blocks
        const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('\n');
        if (styles) cssToApply = styles;
      }

      if (selectedComponent) {
        selectedComponent.replaceWith(htmlToApply);
        if (cssToApply) editor.addStyle(cssToApply);
        toast.success('Element updated successfully');
      } else {
        editor.setComponents(htmlToApply);
        if (cssToApply) editor.addStyle(cssToApply);
        toast.success('Page updated successfully');
      }
      setIsCodeModalOpen(false);
    } catch (error) {
      console.error('Save code error:', error);
      toast.error('Failed to apply changes. Check code syntax.');
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
          title="Desktop View"
        >
          <Monitor size={18} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <button 
          onClick={() => handleDeviceChange('Mobile')}
          className="p-2 hover:bg-gray-100 rounded-lg transition group"
          title="Mobile View"
        >
          <Smartphone size={18} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button 
          onClick={() => editor.UndoManager.undo()}
          className="p-2 hover:bg-gray-100 rounded-lg transition group disabled:opacity-30"
          title="Undo"
        >
          <Undo size={16} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
        <button 
          onClick={() => editor.UndoManager.redo()}
          className="p-2 hover:bg-gray-100 rounded-lg transition group disabled:opacity-30"
          title="Redo"
        >
          <Redo size={16} className="text-gray-500 group-hover:text-emerald-600" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {selectedComponent ? (
          <button 
            onClick={() => editor.runCommand('open-ai-design-modal')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition shadow-md shadow-purple-100 animate-in fade-in zoom-in"
            title="Edit Selected Element with AI"
          >
            <Sparkles size={14} />
            MAGIC EDIT
          </button>
        ) : (
          <button 
            onClick={() => editor.runCommand('open-magic-modal')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-100 shadow-sm shadow-emerald-50"
            title="Generate Page with AI"
          >
            <Wand2 size={14} />
            MAGIC AI
          </button>
        )}

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        <button 
          onClick={handleOpenCode}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition border border-transparent hover:border-gray-200"
          title={selectedComponent ? "View/Edit Element Code" : "View/Edit Page Code"}
        >
          <Code size={14} />
          CODE
        </button>

        <button 
          onClick={() => editor.runCommand('core:preview')}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          <Eye size={14} />
          PREVIEW
        </button>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-100"
        >
          <Save size={14} />
          SAVE DRAFT
        </button>
        <button 
          onClick={handlePublish}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-100"
        >
          <Send size={14} />
          PUBLISH
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
                         {selectedComponent ? 'Edit Element HTML' : 'Edit Page HTML'}
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
                 <textarea 
                    autoFocus
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    className="w-full h-full p-4 bg-transparent text-gray-300 font-mono text-xs leading-relaxed outline-none resize-none custom-scrollbar"
                    spellCheck={false}
                 />
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-2">
                <button 
                   onClick={() => setIsCodeModalOpen(false)}
                   className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                >
                   CANCEL
                </button>
                <button 
                   onClick={handleSaveCode}
                   className="px-6 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition shadow-lg flex items-center gap-2"
                >
                   <Check size={14} />
                   APPLY CHANGES
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
