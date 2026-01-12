import { useEffect, useRef, useState } from 'react';
import { 
  Copy, 
  Trash2, 
  CopyPlus, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Scissors,
  Clipboard,
  Move
} from 'lucide-react';
import type { Editor } from 'grapesjs';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';

interface ContextMenuProps {
  editor: Editor | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export default function ContextMenu({ editor, position, onClose }: ContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  useEffect(() => {
    if (!editor || !position) return;

    const selected = editor.getSelected();
    setSelectedComponent(selected);

    // Close on click outside
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on canvas click (inside iframe)
    const handleCanvasClick = () => {
        onClose();
    };

    document.addEventListener('mousedown', handleClick);
    
    // Attach listener to canvas body if available
    const canvasDoc = editor.Canvas.getBody().ownerDocument;
    canvasDoc.addEventListener('mousedown', handleCanvasClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      canvasDoc.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [editor, position, onClose]);

  if (!position || !editor) return null;

  const handleAction = (action: string) => {
    const component = editor.getSelected();
    if (!component) return;

    switch (action) {
      case 'copy':
        editor.runCommand('tlb-copy');
        toast.success(t('copiedToClipboard') || 'Copied to clipboard');
        break;
      case 'paste':
        editor.runCommand('tlb-paste');
        toast.success(t('pasted') || 'Pasted');
        break;
      case 'duplicate':
        editor.runCommand('tlb-clone');
        toast.success(t('duplicated') || 'Duplicated');
        break;
      case 'delete':
        editor.runCommand('tlb-delete');
        // toast.success('Deleted'); // Usually redundant as visual feedback is instant
        break;
      case 'move-up':
        const collection = component.collection;
        const index = component.index();
        if (index > 0) {
            collection.remove(component);
            collection.add(component, { at: index - 1 });
        }
        break;
      case 'move-down':
        const collectionDown = component.collection;
        const indexDown = component.index();
        if (indexDown < collectionDown.length - 1) {
            collectionDown.remove(component);
            collectionDown.add(component, { at: indexDown + 1 });
        }
        break;
      case 'navigator':
         // We'll need to trigger the SidebarPanel to switch to 'structure' tab
         // This might require a custom event or shared state if direct access isn't available
         // For now, let's select the component which might auto-expand the layer manager
         editor.select(component); 
         // Custom event to tell sidebar to switch tab
         window.dispatchEvent(new CustomEvent('switch-sidebar-tab', { detail: 'structure' }));
         break;
    }
    onClose();
  };

  const isPasteAvailable = true; // GrapesJS internal clipboard state is hard to check, assuming true for UX

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-56 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.y, left: position.x }}
    >
      <div className="p-1.5 space-y-0.5">
        <h4 className="px-2 py-1.5 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-50 mb-1">
            {selectedComponent ? selectedComponent.getName() || selectedComponent.getTagName() : t('action') || 'Action'}
        </h4>

        <MenuItem 
            icon={<Copy size={14} />} 
            label={t('copy') || 'Copy'} 
            shortcut="⌘C" 
            onClick={() => handleAction('copy')} 
        />
        <MenuItem 
            icon={<Clipboard size={14} />} 
            label={t('paste') || 'Paste'} 
            shortcut="⌘V" 
            onClick={() => handleAction('paste')} 
            disabled={!isPasteAvailable}
        />
         <MenuItem 
            icon={<CopyPlus size={14} />} 
            label={t('duplicate') || 'Duplicate'} 
            shortcut="⌘D" 
            onClick={() => handleAction('duplicate')} 
        />

        <div className="h-px bg-gray-100 my-1" />

        <MenuItem 
            icon={<ArrowUp size={14} />} 
            label={t('moveUp') || 'Move Up'} 
            onClick={() => handleAction('move-up')} 
        />
        <MenuItem 
            icon={<ArrowDown size={14} />} 
            label={t('moveDown') || 'Move Down'} 
            onClick={() => handleAction('move-down')} 
        />
        
        <div className="h-px bg-gray-100 my-1" />
        
        <MenuItem 
            icon={<Layers size={14} />} 
            label={t('navigator') || 'Navigator'} 
            onClick={() => handleAction('navigator')} 
        />
        
        <div className="h-px bg-gray-100 my-1" />

        <MenuItem 
            icon={<Trash2 size={14} />} 
            label={t('delete') || 'Delete'} 
            shortcut="Del" 
            variant="destructive"
            onClick={() => handleAction('delete')} 
        />
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

function MenuItem({ icon, label, shortcut, onClick, disabled, variant = 'default' }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
        ${disabled 
            ? 'opacity-50 cursor-not-allowed text-gray-400' 
            : variant === 'destructive'
                ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
        }
      `}
    >
      <span className={variant === 'destructive' ? 'text-red-500' : 'text-gray-500'}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-[10px] text-gray-400 font-mono">{shortcut}</span>}
    </button>
  );
}
