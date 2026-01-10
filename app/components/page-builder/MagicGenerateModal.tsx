
import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface MagicGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  mode?: 'full-page' | 'section-design';
  initialData?: string; // Current HTML if in section-design mode
}

export default function MagicGenerateModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  mode = 'full-page',
  initialData 
}: MagicGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [step, setStep] = useState<'input' | 'generating' | 'preview' | 'success'>('input');
  const [generatedData, setGeneratedData] = useState<any>(null);
  const fetcher = useFetcher<{ success: boolean; data?: any; error?: string }>();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setPrompt('');
      setGeneratedData(null);
    }
  }, [isOpen]);

  // Handle API response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success) {
        setGeneratedData(fetcher.data.data);
        setStep('preview');
      } else if (fetcher.data.error) {
        setStep('input');
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setStep('generating');
    
    const action = mode === 'section-design' ? 'DESIGN_CUSTOM_SECTION' : 'GENERATE_GRAPESJS_PAGE';
    fetcher.submit(
      { action, prompt, currentHtml: initialData || '' },
      { method: 'post', action: '/api/ai/action', encType: 'application/json' }
    );
  };

  const handleApply = () => {
    if (generatedData) {
      setStep('success');
      onGenerate(generatedData);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
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
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 text-white">
            <Sparkles size={32} />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {step === 'input' && (mode === 'section-design' ? 'Magic AI Editor' : 'Magic Page Generator')}
            {step === 'generating' && 'Designing Your Request...'}
            {step === 'preview' && 'Design Ready!'}
            {step === 'success' && 'Applied Successfully!'}
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            {step === 'input' && (mode === 'section-design' 
              ? 'Tell AI how to edit or design this section. (e.g. "Move this to right", "Make it dark gold")' 
              : 'Describe your product, and AI will build a high-converting landing page.')}
            {step === 'generating' && 'AI is generating high-quality HTML & Tailwind CSS...'}
            {step === 'preview' && 'The AI has completed your design. Click Apply to update your page.'}
            {step === 'success' && 'Your page has been updated. Loading editor changes...'}
          </p>

          {step === 'input' && (
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'section-design' ? 'e.g. Center the headline and change all buttons to Emerald green.' : 'e.g. A premium honey brand...'}
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
                {mode === 'section-design' ? 'Start AI Design' : 'Generate Full Page'}
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <div className="h-2 w-48 bg-gray-100 rounded-full mx-auto overflow-hidden text-sm font-bold text-indigo-600">
                Processing magic...
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="py-4 space-y-4">
               <div className="py-8 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500" />
               </div>
               <button
                onClick={handleApply}
                className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                Apply Design to Page
              </button>
              <button
                onClick={() => setStep('input')}
                className="w-full bg-white text-gray-500 font-bold text-lg py-2 rounded-xl hover:bg-gray-50 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 animate-in zoom-in duration-300 text-emerald-600 font-bold">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-2" />
              Everything is set!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
