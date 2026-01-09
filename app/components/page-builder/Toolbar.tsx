import { useEditor } from '@grapesjs/react';
import { 
  Monitor, 
  Smartphone, 
  Undo, 
  Redo, 
  Eye, 
  Save, 
  Code,
  Trash2
} from 'lucide-react';

export default function EditorToolbar() {
  const editor = useEditor();

  const handleDeviceChange = (device: string) => {
    editor.setDevice(device);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleDeviceChange('Desktop')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Desktop View"
        >
          <Monitor size={20} className="text-gray-600" />
        </button>
        <button 
          onClick={() => handleDeviceChange('Mobile')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Mobile View"
        >
          <Smartphone size={20} className="text-gray-600" />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button 
          onClick={() => editor.UndoManager.undo()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Undo"
        >
          <Undo size={18} className="text-gray-600" />
        </button>
        <button 
          onClick={() => editor.UndoManager.redo()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Redo"
        >
          <Redo size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <Eye size={16} />
          Preview
        </button>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
        >
          <Save size={16} />
          Save Draft
        </button>
      </div>
    </div>
  );
}
