'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react';
import { Code, Eye, Maximize2, Minimize2, Copy, Check, Download, AlertTriangle, ExternalLink } from 'lucide-react';
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
  const [hasError, setHasError] = useState(false);

  // Process the code: extract and inject order form
  const processedCode = useMemo(() => {
    if (!code) return '';
    
    try {
      const extractedCode = extractCode(code);
      const withOrderForm = injectOrderForm(extractedCode, orderConfig);
      
      // Basic validation - check if code looks complete
      const hasExport = withOrderForm.includes('export default') || withOrderForm.includes('export function');
      const balanced = (withOrderForm.match(/\{/g) || []).length === (withOrderForm.match(/\}/g) || []).length;
      
      if (!hasExport || !balanced) {
        setHasError(true);
      } else {
        setHasError(false);
      }
      
      return withOrderForm;
    } catch {
      setHasError(true);
      return code;
    }
  }, [code, orderConfig]);

  // Wrap code in safe component if it seems incomplete
  const safeCode = useMemo(() => {
    if (!processedCode) {
      return `
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">🚀 AI Landing Builder</h1>
        <p className="text-gray-400">আপনার পণ্যের বিবরণ দিন, সুন্দর ল্যান্ডিং পেজ তৈরি হবে!</p>
      </div>
    </div>
  );
}
`;
    }
    
    // If code looks incomplete, wrap it
    if (hasError) {
      return `
export default function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 text-sm">
        ⚠️ কোড জেনারেট হচ্ছে... সম্পূর্ণ হলে preview দেখা যাবে।
      </div>
      <div className="p-8">
        <pre className="text-xs text-gray-500 overflow-auto">${processedCode.slice(0, 200).replace(/`/g, '\\`')}...</pre>
      </div>
    </div>
  );
}
`;
    }
    
    return processedCode;
  }, [processedCode, hasError]);

  // Sandpack files
  const files = useMemo(() => ({
    '/App.js': {
      code: safeCode,
    },
    '/styles.css': {
      code: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Hind Siliguri', 'Inter', sans-serif;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
`,
    },
  }), [safeCode]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(processedCode);
    setCopied(true);
    toast.success('কোড কপি হয়েছে');
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
    toast.success('কোড ডাউনলোড হয়েছে');
  };

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white"
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
            showOpenInCodeSandbox={false}
            style={{ height: '100vh', width: '100%' }}
          />
        </SandpackProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
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
          
          {hasError && code && (
            <span className="flex items-center gap-1 text-xs text-yellow-500 ml-2">
              <AlertTriangle className="w-3 h-3" />
              Generating...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
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
            title="Fullscreen preview"
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
              style={{ height: '100%', minHeight: '500px' }}
            />
          ) : (
            <SandpackPreview
              showNavigator={false}
              showRefreshButton={true}
              showOpenInCodeSandbox={false}
              style={{ height: '100%', minHeight: '500px' }}
            />
          )}
        </SandpackProvider>
      </div>

      {/* Open in Sandbox button */}
      {processedCode && !hasError && (
        <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/30">
          <button
            onClick={() => {
              // Open in new sandbox
              const sandboxUrl = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${encodeURIComponent(JSON.stringify({
                files: {
                  'App.js': { content: processedCode },
                  'package.json': { content: JSON.stringify({ dependencies: { react: 'latest', 'react-dom': 'latest' }}) }
                }
              }))}`;
              window.open(sandboxUrl, '_blank');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in CodeSandbox
          </button>
        </div>
      )}
    </div>
  );
}
