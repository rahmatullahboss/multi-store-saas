'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react';
import { Code, Eye, Maximize2, Minimize2, Copy, Check, Download, AlertTriangle, ExternalLink, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { injectOrderForm, extractCode, type OrderConfig } from '@/lib/order-integration';

interface CodePreviewProps {
  code: string;
  orderConfig: OrderConfig;
  isFullscreen?: boolean;
}

export function CodePreview({ code, orderConfig, isFullscreen = false }: CodePreviewProps) {
  const [showCode, setShowCode] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const prevCodeLengthRef = useRef(0);
  const codeDisplayRef = useRef<HTMLPreElement>(null);

  // Detect streaming state
  useEffect(() => {
    if (code.length > prevCodeLengthRef.current) {
      setIsStreaming(true);
    }
    prevCodeLengthRef.current = code.length;
    
    // Auto-scroll to bottom of code display while streaming
    if (codeDisplayRef.current && isStreaming) {
      codeDisplayRef.current.scrollTop = codeDisplayRef.current.scrollHeight;
    }
    
    // Stop streaming detection after 1 second of no changes
    const timer = setTimeout(() => {
      setIsStreaming(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [code, isStreaming]);

  // Process the code: extract and inject order form
  const processedCode = useMemo(() => {
    if (!code) return '';
    
    try {
      const extractedCode = extractCode(code);
      const withOrderForm = injectOrderForm(extractedCode, orderConfig);
      
      // Basic validation - check if code looks complete
      const hasExport = withOrderForm.includes('export default') || withOrderForm.includes('export function');
      const openBraces = (withOrderForm.match(/\{/g) || []).length;
      const closeBraces = (withOrderForm.match(/\}/g) || []).length;
      const balanced = openBraces === closeBraces && openBraces > 0;
      
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

  // Safe code wrapper for incomplete code
  const safeCode = useMemo(() => {
    if (!processedCode) {
      return `
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">🚀 AI Landing Builder</h1>
        <p className="text-gray-400 text-lg">আপনার পণ্যের বিবরণ দিন, সুন্দর ল্যান্ডিং পেজ তৈরি হবে!</p>
        <div className="mt-8 flex justify-center gap-4">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
`;
    }
    
    if (hasError || isStreaming) {
      return `
export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">কোড জেনারেট হচ্ছে...</span>
          </div>
          <p className="text-gray-400 text-sm">সম্পূর্ণ হলে preview দেখা যাবে</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-xs text-green-400 overflow-auto max-h-[500px]">
          <pre className="whitespace-pre-wrap">${processedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}</pre>
        </div>
      </div>
    </div>
  );
}
`;
    }
    
    return processedCode;
  }, [processedCode, hasError, isStreaming]);

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

html {
  scroll-behavior: smooth;
}

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

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
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

  // Fullscreen mode (internal toggle)
  if (showFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowFullscreen(false)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
        <SandpackProvider
          template="react"
          theme="dark"
          files={files}
          options={{
            externalResources: ['https://cdn.tailwindcss.com'],
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

  // Prop-based fullscreen (from parent)
  if (isFullscreen) {
    return (
      <div className="h-full w-full">
        <SandpackProvider
          template="react"
          theme="dark"
          files={files}
          options={{
            externalResources: ['https://cdn.tailwindcss.com'],
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
          
          {(hasError || isStreaming) && code && (
            <span className="flex items-center gap-1 text-xs text-purple-400 ml-2">
              <Terminal className="w-3 h-3 animate-pulse" />
              {isStreaming ? 'Streaming...' : 'Generating...'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyCode}
            disabled={!processedCode}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="কোড কপি করুন"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadCode}
            disabled={!processedCode}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="কোড ডাউনলোড করুন"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFullscreen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="ফুলস্ক্রিন প্রিভিউ"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview/Code Area */}
      <div className="flex-1 overflow-hidden">
        {showCode ? (
          // Streaming Code View - Real-time line by line
          <div className="h-full bg-gray-900 overflow-auto">
            <pre 
              ref={codeDisplayRef}
              className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap"
              style={{ minHeight: '100%' }}
            >
              {processedCode || '// কোড এখানে দেখা যাবে...'}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />
              )}
            </pre>
          </div>
        ) : (
          <SandpackProvider
            template="react"
            theme="dark"
            files={files}
            options={{
              externalResources: ['https://cdn.tailwindcss.com'],
            }}
          >
            <SandpackPreview
              showNavigator={false}
              showRefreshButton={true}
              showOpenInCodeSandbox={false}
              style={{ height: '100%', minHeight: '500px' }}
            />
          </SandpackProvider>
        )}
      </div>

      {/* Status bar */}
      {processedCode && (
        <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/30 flex items-center justify-between text-xs text-gray-500">
          <span>
            {processedCode.split('\n').length} lines • {(processedCode.length / 1024).toFixed(1)} KB
          </span>
          {!hasError && !isStreaming && (
            <span className="text-green-500 flex items-center gap-1">
              <Check className="w-3 h-3" />
              সম্পূর্ণ
            </span>
          )}
        </div>
      )}
    </div>
  );
}
