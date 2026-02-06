'use client';

import { useState, useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
} from '@codesandbox/sandpack-react';
import { Code, Eye, Maximize2, Minimize2, Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import { injectOrderForm, extractCode, type OrderConfig } from '@/lib/order-integration';

interface CodePreviewProps {
  code: string;
  orderConfig: OrderConfig;
}

export function CodePreview({ code, orderConfig }: CodePreviewProps) {
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Process the code: extract and inject order form
  const processedCode = useMemo(() => {
    if (!code) return '';
    
    const extractedCode = extractCode(code);
    const withOrderForm = injectOrderForm(extractedCode, orderConfig);
    
    return withOrderForm;
  }, [code, orderConfig]);

  // Sandpack files
  const files = useMemo(() => ({
    '/App.js': {
      code: processedCode || `
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">AI Landing Page Builder</h1>
        <p className="text-gray-400">Enter a prompt to generate your landing page</p>
      </div>
    </div>
  );
}
`,
    },
    '/styles.css': {
      code: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
}

/* Tailwind-like utilities will be applied via CDN */
`,
    },
  }), [processedCode]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(processedCode);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([processedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LandingPage.jsx';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
        <SandpackProvider
          template="react"
          theme="dark"
          files={files}
          customSetup={{
            dependencies: {},
          }}
          options={{
            externalResources: [
              'https://cdn.tailwindcss.com',
            ],
          }}
        >
          <SandpackPreview 
            showNavigator={false}
            showRefreshButton={true}
            style={{ height: '100vh' }}
          />
        </SandpackProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !showCode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setShowCode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showCode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            disabled={!processedCode}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadCode}
            disabled={!processedCode}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview/Code Area */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          template="react"
          theme="dark"
          files={files}
          customSetup={{
            dependencies: {},
          }}
          options={{
            externalResources: [
              'https://cdn.tailwindcss.com',
            ],
          }}
        >
          {showCode ? (
            <SandpackCodeEditor
              showLineNumbers
              showTabs={false}
              style={{ height: '100%' }}
            />
          ) : (
            <SandpackPreview
              showNavigator={false}
              showRefreshButton={true}
              style={{ height: '100%' }}
            />
          )}
        </SandpackProvider>
      </div>
    </div>
  );
}
