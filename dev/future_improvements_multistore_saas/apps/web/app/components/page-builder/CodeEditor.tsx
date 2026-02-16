
import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, language = 'html', readOnly = false }: CodeEditorProps) {
  return (
    <div className="w-full h-full overflow-hidden border border-gray-100/10 rounded-xl bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        loading={
            <div className="flex items-center justify-center h-full text-white gap-2">
                <Loader2 className="animate-spin text-emerald-500" />
                <span className="text-xs font-mono text-gray-400">Loading VS Code Engine...</span>
            </div>
        }
        options={{
          minimap: { enabled: true },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
