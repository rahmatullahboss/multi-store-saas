
import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface MagicGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

export default function MagicGenerateModal({ isOpen, onClose, onGenerate }: MagicGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [step, setStep] = useState<'input' | 'generating' | 'success'>('input');
  const fetcher = useFetcher<{ success: boolean; data?: any; error?: string }>();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setPrompt('');
    }
  }, [isOpen]);

  // Handle API response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success) {
        setStep('success');
        setTimeout(() => {
            if (fetcher.data?.data) {
                onGenerate(fetcher.data.data);
            }
            onClose();
        }, 1500);
      } else if (fetcher.data.error) {
        setStep('input');
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data, onClose, onGenerate]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setStep('generating');
    fetcher.submit(
      { 
        action: 'GENERATE_GRAPESJS_PAGE',
        prompt 
      },
      { 
        method: 'post', 
        action: '/api/ai/action',
        encType: 'application/json' 
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <Sparkles className="text-white w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {step === 'input' && 'Magic Page Generator'}
            {step === 'generating' && 'Designing Your Page...'}
            {step === 'success' && 'Page Ready!'}
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            {step === 'input' && 'Describe your product or business, and AI will build a high-converting landing page instantly.'}
            {step === 'generating' && 'AI is selecting the best layout, writing sales copy, and optimizing for conversion.'}
            {step === 'success' && 'Your landing page has been generated successfully. Loading editor...'}
          </p>

          {step === 'input' && (
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A premium organic honey brand called 'Modhu' that offers pure Sundarbans honey with home delivery."
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] text-lg resize-none bg-gray-50 focus:bg-white transition"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Generate Page
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <div className="h-2 w-48 bg-gray-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress w-2/3"></div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 animate-in zoom-in duration-300">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
