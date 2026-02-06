'use client';

import { useState, FormEvent } from 'react';
import { Send, Loader2, Sparkles, RefreshCw, Zap, Bot } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

type Backend = 'arena' | 'openrouter';

interface ChatInterfaceProps {
  onCodeGenerated: (code: string) => void;
  storeId?: number;
  productId?: number;
}

const ARENA_MODELS = [
  { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6 Thinking', icon: '🧠' },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', icon: '✨' },
  { id: 'claude-opus-4-5-thinking', name: 'Claude Opus 4.5 Thinking', icon: '💭' },
  { id: 'gpt-5.2-high', name: 'GPT-5.2 High', icon: '🚀' },
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', icon: '🤖' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', icon: '💎' },
  { id: 'kimi-k2.5-thinking', name: 'Kimi K2.5 Thinking', icon: '🔮' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', icon: '⚡' },
  { id: 'glm-4.7', name: 'GLM 4.7', icon: '🎯' },
  { id: 'minimax-m2.1-preview', name: 'MiniMax M2.1', icon: '🎭' },
  { id: 'gpt-5.2', name: 'GPT-5.2', icon: '🤖' },
];

export function ChatInterface({ onCodeGenerated, storeId = 1, productId = 1 }: ChatInterfaceProps) {
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [backend, setBackend] = useState<Backend>('arena');
  const [selectedModel, setSelectedModel] = useState('claude-opus-4-6-thinking');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');

    try {
      if (backend === 'arena') {
        // Use Arena automation backend (non-streaming)
        const response = await fetch('/api/generate-arena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            images: images.length > 0 ? images : undefined,
            storeId,
            productId,
            model: selectedModel,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Arena generation failed');
        }

        const data = await response.json();
        setGeneratedCode(data.code);
        onCodeGenerated(data.code);
        toast.success(`Generated with ${data.model}!`);
      } else {
        // Use OpenRouter (streaming)
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            images: images.length > 0 ? images : undefined,
            storeId,
            productId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Generation failed');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullCode = '';

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                
                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    fullCode += content;
                    setGeneratedCode(fullCode);
                    onCodeGenerated(fullCode);
                  }
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }
        }
        toast.success('Landing page generated!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    'Create a shoe product landing page with dark theme',
    'Design a skincare product page with elegant pink colors',
    'Build a fitness supplement landing page with energetic design',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Builder
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Describe your landing page and watch it come to life
        </p>
      </div>

      {/* Backend Selector */}
      <div className="p-3 border-b border-gray-800 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setBackend('arena')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              backend === 'arena'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            Arena (Free)
          </button>
          <button
            onClick={() => setBackend('openrouter')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              backend === 'openrouter'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            OpenRouter
          </button>
        </div>

        {/* Model selector for Arena */}
        {backend === 'arena' && (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
          >
            {ARENA_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Example Prompts */}
        {!generatedCode && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <ImageUpload 
          images={images} 
          onImagesChange={setImages} 
          maxImages={2}
        />

        {/* Generated Code Preview */}
        {generatedCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Generated Code</p>
              <button
                onClick={() => {
                  setGeneratedCode('');
                  onCodeGenerated('');
                }}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {generatedCode.slice(0, 500)}
                {generatedCode.length > 500 && '...'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your landing page..."
            rows={2}
            className="flex-1 resize-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {isGenerating && (
          <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
            <span className="streaming">●</span>
            {backend === 'arena' 
              ? 'Generating via Arena (may take 30-60s)...'
              : 'Generating your landing page...'
            }
          </p>
        )}
      </form>
    </div>
  );
}
