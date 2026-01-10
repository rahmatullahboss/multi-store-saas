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
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    const isEditing = !!selectedComponent;
    const loadingMsg = aiPrompt.toLowerCase().includes('connect') || aiPrompt.toLowerCase().includes('backend')
      ? 'AI is connecting your form to the backend... 🔌' 
      : (isEditing ? 'AI is improving your section... ✨' : 'AI is crafting your page... 🏗️');
    
    const toastId = toast.loading(loadingMsg, { id: 'ai-gen' });
    
    try {
      if (isEditing) {
        // EDIT MODE
        const currentHtml = selectedComponent.toHTML();
        
        const response = await fetch('/api/ai/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'EDIT_ELEMENTOR_SECTION',
            prompt: aiPrompt,
            currentHtml
          })
        });

        const result = await response.json() as any;
        if (result.success && result.data) {
          const { html, css } = result.data;
          
          // Replace selected component content
          selectedComponent.replaceWith(html);
          if (css) editor.setStyle(css); // Append new CSS
          
          toast.success('Magic! Section updated.', { id: 'ai-gen' });
        } else {
          throw new Error(result.error || 'AI Edit failed');
        }

      } else {
        // GENERATE PAGE MODE (Block-based)
        const response = await fetch('/api/ai/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'GENERATE_GRAPESJS_PAGE',
            prompt: aiPrompt
          })
        });
        
        const result = await response.json() as any;
        
        if (result.success && result.data && result.data.blocks) {
          const { blocks, primaryColor } = result.data;
          
          // Clear current canvas
          editor.DomComponents.clear();
          
          // Sort blocks by order and add to canvas
          blocks.sort((a: any, b: any) => a.order - b.order).forEach((block: any) => {
             const blockType = block.type;
             const blockDef = editor.Blocks.get(blockType);
             
             if (blockDef) {
               const content = blockDef.getContent ? blockDef.getContent() : blockDef.attributes.content;
               if (content) {
                 editor.addComponents(content);
               } else {
                 console.warn(`Content not found for block type: ${blockType}`);
               }
             } else {
               console.warn(`Block type not found: ${blockType}`);
             }
          });

          // Optional: Set Primary Color variable if supported
          // if (primaryColor) editor.Css.addRules(...) 

          toast.success('Magic! Page generated.', { id: 'ai-gen' });
        } else {
          throw new Error(result.error || 'AI Generation failed');
        }
      }

      setIsAIModalOpen(false);
      setAiPrompt('');
      setSelectedComponent(null); // Reset selection
      
    } catch (error) {
      console.error('AI Gen Error:', error);
      toast.error('AI failed. Try a different prompt.', { id: 'ai-gen' });
    } finally {
      setIsGenerating(false);
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
    if (selectedComponent) {
      selectedComponent.replaceWith(codeContent);
      toast.success('Element updated from code');
    } else {
      editor.setComponents(codeContent);
      toast.success('Page updated from code');
    }
    setIsCodeModalOpen(false);
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
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition shadow-md shadow-purple-100 animate-in fade-in zoom-in"
            title="Edit Selected Element with AI"
          >
            <Sparkles size={14} />
            MAGIC EDIT
          </button>
        ) : (
          <button 
            onClick={() => setIsAIModalOpen(true)}
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

      {/* AI Prompt Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-emerald-50/30">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                       <Sparkles size={20} className="text-emerald-600" />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-gray-900 leading-tight">
                         {selectedComponent ? 'Magic Editor' : 'Magic AI Generator'}
                       </h3>
                       <p className="text-xs text-gray-500 font-medium">
                         {selectedComponent ? 'Describe how to change this element.' : 'Describe your page and watch the magic happen.'}
                       </p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsAIModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition text-gray-400 hover:text-gray-600"
                 >
                    <X size={20} />
                 </button>
              </div>

              <div className="p-8">
                 <label className="block text-sm font-bold text-gray-700 mb-3">
                   {selectedComponent ? 'What changes do you want?' : 'What kind of page should I build?'}
                 </label>
                 <textarea 
                    autoFocus
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={selectedComponent ? "e.g., Make the background red, change text to 'Buy Now', add a shadow..." : "e.g., Create a high-converting landing page for a Premium Honey..."}
                    className="w-full h-32 px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition text-gray-600 font-medium text-sm resize-none"
                 />
                 
                 <div className="mt-6 flex flex-col gap-3">
                    <button 
                       onClick={handleAIGenerate}
                       disabled={isGenerating || !aiPrompt.trim()}
                       className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                       {isGenerating ? (
                          <>
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             {selectedComponent ? 'UPDATING...' : 'CRAFTING PAGE...'}
                          </>
                       ) : (
                          <>
                             <Wand2 size={18} />
                             {selectedComponent ? 'UPDATE ELEMENT' : 'GENERATE MAGIC PAGE'}
                          </>
                       )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Powered by OpenRouter AI</p>
                 </div>
              </div>
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
