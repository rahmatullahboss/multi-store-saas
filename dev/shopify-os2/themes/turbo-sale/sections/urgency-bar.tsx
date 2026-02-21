import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { TURBO_SALE_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'urgency-bar',
  name: 'Urgency Bar',
  settings: [
    {
      type: 'checkbox',
      id: 'enabled',
      label: 'Show urgency bar',
      default: false,
    },
    {
      type: 'text',
      id: 'message',
      label: 'Message',
      default: '',
    },
    {
      type: 'number',
      id: 'stock_left',
      label: 'Stock Left',
      default: 12,
    },
  ],
};

export default function UrgencyBar({ settings }: SectionComponentProps) {
  const config = TURBO_SALE_THEME_CONFIG.colors!;
  const enabled = settings.enabled as boolean;
  
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

  // Hide if not enabled
  if (!enabled) {
    return null;
  }

  return (
    <div 
        className="w-full py-3 px-4 text-center sticky top-[60px] lg:top-[74px] z-40 shadow-md transition-all"
        style={{ backgroundColor: config.urgencyBg, color: config.urgencyText }}
    >
       <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base font-bold">
          
          <div className="flex items-center gap-2 animate-pulse">
             <AlertTriangle size={18} />
             <span>মাত্র {settings.stock_left as number} টি পণ্য বাকি আছে!</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-white/30"></div>

          <div className="flex items-center gap-3">
             <span>{settings.message as string}</span>
             <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg font-mono tracking-widest">
                <Clock size={16} className="mr-1"/>
                <span>{format(timeLeft.h)}:{format(timeLeft.m)}:{format(timeLeft.s)}</span>
             </div>
          </div>

       </div>
    </div>
  );
}
