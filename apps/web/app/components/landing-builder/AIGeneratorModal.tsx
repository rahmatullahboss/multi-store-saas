
import { useState, useEffect } from 'react';
import { Form } from 'react-router';
import { Sparkles, X } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
}

export default function AIGeneratorModal({ isOpen, onClose, language }: AIGeneratorModalProps) {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: language === 'bn' ? 'মার্কেট রিসার্চ এনালাইসিস' : 'Analyzing market research...', delay: 0 },
    { text: language === 'bn' ? 'কপিরাইটিং তৈরি হচ্ছে' : 'Drafting high-converting copy...', delay: 2000 },
    { text: language === 'bn' ? 'কালার প্যালেট নির্বাচন' : 'Selecting optimal color palette...', delay: 4500 },
    { text: language === 'bn' ? 'লেআউট সাজানো হচ্ছে' : 'Structuring landing page...', delay: 7000 },
  ];

  // Simulate progress when loading - with proper cleanup to prevent memory leaks
  useEffect(() => {
    if (!loading || currentStep >= steps.length - 1) return;
    
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 2500);
    
    // Cleanup: clear timeout if component unmounts or loading stops
    return () => clearTimeout(timer);
  }, [loading, currentStep, steps.length]);

  // Reset step when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setLoading(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    setLoading(true);
    setCurrentStep(0);
    // The actual submission will be handled by the parent component or Remix Form
    // This state is just for immediate UI feedback
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h2 className="text-xl font-bold">
              {language === 'bn' ? 'ম্যাজিক জেনারেটর' : 'Magic Page Generator'}
            </h2>
          </div>
          <p className="text-indigo-100 text-sm">
            {language === 'bn' 
              ? 'আপনার ব্যবসার বর্ণনা দিন, আমরা পুরো ল্যান্ডিং পেজ বানিয়ে দেব।' 
              : 'Describe your business, and we\'ll build the entire page for you.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'bn' ? 'আপনার পেজ তৈরি হচ্ছে...' : 'Generating your page...'}
                </h3>
                <p className="text-indigo-600 font-medium animate-pulse">
                  {steps[currentStep].text}
                </p>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <Form method="post" onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="action" value="GENERATE_FULL_PAGE" />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'bn' ? 'আপনার ব্যবসা সম্পর্কে বলুন' : 'Tell us about your business'}
                </label>
                <textarea
                  name="description"
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={language === 'bn' 
                    ? 'উদাহরণ: আমি প্রিমিয়াম চামড়ার ব্যাগ বিক্রি করি। আমার টার্গেট অডিয়েন্স হল কর্পোরেট চাকুরিজীবী...' 
                    : 'E.g., I sell premium leather bags targeting corporate professionals in Dhaka...'}
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-100">
                <div className="flex gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="text-xs text-indigo-800 space-y-1">
                    <p className="font-medium">
                      {language === 'bn' ? 'AI যা যা তৈরি করবে:' : 'AI will generate:'}
                    </p>
                    <ul className="list-disc list-inside opacity-80 pl-1">
                      <li>{language === 'bn' ? 'আকর্ষণীয় হেডলাইন ও কপি' : 'Compelling headlines & copy'}</li>
                      <li>{language === 'bn' ? 'বেনিফিট ও ফিচার সেকশন' : 'Benefit-focused features'}</li>
                      <li>{language === 'bn' ? 'বিশ্বাসযোগ্য টেস্টিমোনিয়াল' : 'Realistic testimonials'}</li>
                      <li>{language === 'bn' ? 'প্রফেশনাল কালার থিম' : 'Professional color theme'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  {language === 'bn' ? 'ম্যাজিক জেনারেট করুন' : 'Generate with Magic'}
                </button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
