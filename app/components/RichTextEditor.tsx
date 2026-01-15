/**
 * Rich Text Editor Component
 * 
 * Uses TipTap for WYSIWYG editing.
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Write something...' }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const ToolbarButton = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-1.5 rounded hover:bg-gray-100 transition ${active ? 'bg-gray-100 text-emerald-600' : 'text-gray-600'}`}
        >
            {children}
        </button>
    );

    const setLink = () => {
        const url = prompt('Enter URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
    };

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton onClick={setLink} active={editor.isActive('link')}>
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                <div className="flex-1" />
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </ToolbarButton>
            </div>
            {/* Editor */}
            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-3 min-h-[120px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
            />
        </div>
    );
}
