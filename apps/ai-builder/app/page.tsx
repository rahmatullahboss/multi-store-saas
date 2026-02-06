'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { CodePreview } from '@/components/CodePreview';
import { Sparkles, Settings, ExternalLink } from 'lucide-react';

export default function HomePage() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Config from env or defaults
  const [config, setConfig] = useState({
    storeId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_STORE_ID || '1'),
    productId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || '1'),
    apiUrl: process.env.NEXT_PUBLIC_MAIN_API_URL || 'https://ozzyl.com',
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Landing Builder</h1>
              <p className="text-xs text-gray-500">Powered by Claude 3.5</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-gray-800 px-4 py-4 bg-gray-900/50">
          <div className="max-w-screen-2xl mx-auto">
            <h3 className="text-sm font-medium mb-3">Order Integration Settings</h3>
            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Store ID</label>
                <input
                  type="number"
                  value={config.storeId}
                  onChange={(e) => setConfig({ ...config, storeId: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Product ID</label>
                <input
                  type="number"
                  value={config.productId}
                  onChange={(e) => setConfig({ ...config, productId: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">API URL</label>
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-[400px] flex-shrink-0 border-r border-gray-800 flex flex-col">
          <ChatInterface
            onCodeGenerated={setGeneratedCode}
            storeId={config.storeId}
            productId={config.productId}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 p-4">
          <CodePreview
            code={generatedCode}
            orderConfig={config}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 py-2">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <p>AI-generated code may need review</p>
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            Powered by OpenRouter
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
