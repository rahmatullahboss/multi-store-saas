import { useEditor } from '@grapesjs/react';
import { 
  Monitor, 
  Smartphone, 
  Undo, 
  Redo, 
  Eye, 
  Save, 
  Send,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditorToolbar() {
  const editor = useEditor();

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
        <button 
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
    </div>
  );
}
