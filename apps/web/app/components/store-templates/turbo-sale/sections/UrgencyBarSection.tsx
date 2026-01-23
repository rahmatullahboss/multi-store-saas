
import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import type { SectionSettings } from '~/components/store-sections/registry';
import { withAISchema } from '~/utils/ai-editable';

interface UrgencyBarSectionProps {
  settings: SectionSettings;
  theme: any;
}

export const URGENCY_BAR_AI_SCHEMA = {
  component: 'UrgencyBarSection',
  version: '1.0.0',
  type: 'urgency-bar',
  properties: {
    message: { type: 'string' },
    stockLeft: { type: 'number' },
    backgroundColor: { type: 'string', format: 'color' },
    textColor: { type: 'string', format: 'color' }
  }
};

function UrgencyBarSectionBase({ settings, theme }: UrgencyBarSectionProps) {
  const {
      message = "অফার শেষ হতে বাকি আর মাত্র:",
      stockLeft = 12,
      backgroundColor = "#DC2626",
      textColor = "#FFFFFF"
  } = settings || {};

  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number}>({ h: 2, m: 15, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
       setTimeLeft(prev => {
           if(prev.s > 0) return { ...prev, s: prev.s - 1 };
           if(prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
           if(prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
           return prev; // Stop at 0
       });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full py-3 px-4 text-center sticky top-0 z-40 shadow-md" style={{ backgroundColor, color: textColor }}>
       <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base font-bold">
          
          <div className="flex items-center gap-2 animate-pulse">
             <AlertTriangle size={18} />
             <span>মাত্র {stockLeft} টি পণ্য বাকি আছে!</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-white/30"></div>

          <div className="flex items-center gap-3">
             <span>{message}</span>
             <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg font-mono tracking-widest">
                <Clock size={16} className="mr-1"/>
                <span>{format(timeLeft.h)}:{format(timeLeft.m)}:{format(timeLeft.s)}</span>
             </div>
          </div>

       </div>
    </div>
  );
}

const UrgencyBarSection = withAISchema(UrgencyBarSectionBase, URGENCY_BAR_AI_SCHEMA as any);
export default UrgencyBarSection;
