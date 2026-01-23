import { useEffect, useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

interface ClientDateProps {
  date: string | Date | number | null | undefined;
  format?: Intl.DateTimeFormatOptions;
  fallback?: string;
  className?: string;
}

export function ClientDate({ date, format, fallback = '—', className }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const { lang } = useTranslation();

  useEffect(() => {
    if (!date) {
      setFormattedDate(fallback);
      return;
    }

    try {
      const d = new Date(date);
      // Valid date check
      if (isNaN(d.getTime())) {
        setFormattedDate(fallback);
        return;
      }

      setFormattedDate(d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-BD', format || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }));
    } catch (e) {
      setFormattedDate(fallback);
    }
  }, [date, format, lang, fallback]);

  if (!date) return <span className={className}>{fallback}</span>;
  
  // Render nothing or specific placeholder during SSR to avoid mismatch
  // Or render a suppressHydrationWarning span if we wanted to risk it, 
  // but returning null/loading state is safer for "ClientOnly" behavior.
  if (formattedDate === null) {
      return <span className={className}>...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}

export function ClientTime({ date, className }: { date: string | Date | number | null | undefined, className?: string }) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return;
      
      setFormattedTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {}
  }, [date]);

  if (!date || formattedTime === null) return <span className={className}>...</span>;

  return <span className={className}>{formattedTime}</span>;
}
