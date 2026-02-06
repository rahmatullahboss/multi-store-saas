'use client';

import { useState, FormEvent } from 'react';
import { Send, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';


interface ChatInterfaceProps {
  onCodeGenerated: (code: string) => void;
  storeId?: number;
  productId?: number;
}

export function ChatInterface({ onCodeGenerated, storeId = 1, productId = 1 }: ChatInterfaceProps) {
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');

    try {
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
          
          // Parse SSE format: data: {...}
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
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
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      toast.success('Landing page generated!');
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
    'Make a premium watch landing page with luxury feel',
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
            Generating your landing page...
          </p>
        )}
      </form>
    </div>
  );
}
