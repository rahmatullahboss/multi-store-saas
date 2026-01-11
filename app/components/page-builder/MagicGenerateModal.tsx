
import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';

interface MagicGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  mode?: 'full-page' | 'section-design';
  initialData?: string; // Current HTML if in section-design mode
  isLocked?: boolean;
}

export default function MagicGenerateModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  mode = 'full-page',
  initialData,
  isLocked = false
}: MagicGenerateModalProps) {
  const { t } = useTranslation();
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
            {step === 'input' && (mode === 'section-design' ? t('magicAiEditor') : t('magicPageGenerator'))}
            {step === 'generating' && t('designingRequest')}
            {step === 'preview' && t('designReady')}
            {step === 'success' && t('appliedSuccess')}
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            {step === 'input' && (mode === 'section-design' 
              ? t('describeEditHint') 
              : t('describeProductHint'))}
            {step === 'generating' && t('generatingHtml')}
            {step === 'preview' && t('designCompletedHint')}
            {step === 'success' && t('updatingEditorHint')}
          </p>

          {isLocked ? (
            <div className="space-y-6 py-4">
              <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl border border-gray-200 text-left relative overflow-hidden shadow-inner">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles size={120} />
                </div>
                
                <div className="flex items-center gap-3 mb-6 relative">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase">{t('premiumPro')}</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{t('unlockMagicAi')}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
                  {t('magicAiFutureDesc')}
                </p>

                <div className="grid grid-cols-1 gap-3 mb-2">
                  <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white">
                    <div className="mt-1 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{t('customSectionRedesign')}</p>
                      <p className="text-[10px] text-gray-500">{t('editInstantly')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white">
                    <div className="mt-1 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{t('landingPageGeneration')}</p>
                      <p className="text-[10px] text-gray-500">{t('fullPageTemplates')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white">
                    <div className="mt-1 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{t('persuasiveCopy')}</p>
                      <p className="text-[10px] text-gray-500">{t('autoGeneratedBdMarket')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                   <a
                  href="/app/billing"
                  className="w-full bg-gray-900 text-white font-black text-lg py-5 rounded-2xl hover:bg-black transition shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group"
                >
                  {t('upgradeNow')}
                  <div className="bg-white/10 p-1 rounded-lg group-hover:bg-white/20 transition">
                    <Sparkles size={18} />
                  </div>
                </a>
                <button
                  onClick={onClose}
                  className="w-full text-gray-400 font-bold text-sm py-2 hover:text-gray-600 transition tracking-wide"
                >
                  {t('dashboardChat_maybeLater')}
                </button>
              </div>
            </div>
          ) : step === 'input' && (
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'section-design' ? t('describeEditHint') : t('describeProductHint')}
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
                {mode === 'section-design' ? t('startAiDesign') : t('generateFullPage')}
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <div className="h-2 w-48 bg-gray-100 rounded-full mx-auto overflow-hidden text-sm font-bold text-indigo-600">
                {t('processingMagic')}
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
                {t('applyDesignToPage')}
              </button>
              <button
                onClick={() => setStep('input')}
                className="w-full bg-white text-gray-500 font-bold text-lg py-2 rounded-xl hover:bg-gray-50 transition"
              >
                {t('tryAgain')}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 animate-in zoom-in duration-300 text-emerald-600 font-bold">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-2" />
              {t('everythingSet')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
