'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { CodePreview } from '@/components/CodePreview';
import { Sparkles, Settings, ExternalLink, MessageCircle, X, Maximize2 } from 'lucide-react';

export default function HomePage() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isFullPreview, setIsFullPreview] = useState(false);
  
  // Config from env or defaults
  const [config, setConfig] = useState({
    storeId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_STORE_ID || '1'),
    productId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || '1'),
    apiUrl: process.env.NEXT_PUBLIC_MAIN_API_URL || 'https://ozzyl.com',
  });

  // Full preview mode
  if (isFullPreview && generatedCode) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setIsFullPreview(false)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">প্রিভিউ বন্ধ করুন</span>
          </button>
        </div>
        
        {/* Floating chat button */}
        <button
          onClick={() => {
            setIsFullPreview(false);
            setShowChat(true);
          }}
          className="absolute bottom-6 right-6 z-10 p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        
        <CodePreview
          code={generatedCode}
          orderConfig={config}
          isFullscreen={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Landing Builder</h1>
              <p className="text-xs text-gray-500">OpenRouter দ্বারা চালিত</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {generatedCode && (
              <button
                onClick={() => setIsFullPreview(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm"
              >
                <Maximize2 className="w-4 h-4" />
                ফুল স্ক্রিন
              </button>
            )}
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
            <h3 className="text-sm font-medium mb-3">অর্ডার ইন্টিগ্রেশন সেটিংস</h3>
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

      {/* Main Content - Fullscreen Preview Focus */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Preview takes full width when chat is hidden */}
        <div className={`flex-1 p-4 transition-all duration-300 ${showChat ? 'pr-[420px]' : ''}`}>
          <CodePreview
            code={generatedCode}
            orderConfig={config}
            isFullscreen={false}
          />
        </div>

        {/* Chat Panel - Slides in from right */}
        <div className={`absolute right-0 top-0 bottom-0 w-[400px] border-l border-gray-800 bg-gray-950 flex flex-col transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
          <ChatInterface
            onCodeGenerated={setGeneratedCode}
            storeId={config.storeId}
            productId={config.productId}
          />
        </div>

        {/* Chat toggle button when hidden */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="absolute bottom-6 right-6 p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white shadow-lg z-10"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {/* Chat close button */}
        {showChat && (
          <button
            onClick={() => setShowChat(false)}
            className="absolute top-4 right-[410px] p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white z-10"
            title="চ্যাট লুকান"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 py-2 bg-gray-950/90">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <p>AI জেনারেটেড কোড রিভিউ করা উচিত</p>
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
