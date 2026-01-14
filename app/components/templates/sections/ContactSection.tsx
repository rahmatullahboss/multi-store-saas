import React from 'react';
import { SectionProps } from './types';
import { useTranslation } from '~/contexts/LanguageContext';

export const ContactSection: React.FC<SectionProps> = ({ theme }) => {
  const { t } = useTranslation();

  return (
    <section className={`py-12 ${theme.isDark ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-3">📞</div>
            <h4 className="font-bold text-lg mb-2">{t('callUs')}</h4>
            <p className="text-gray-400">{t('callHours')}</p>
          </div>
          <div>
            <div className="text-3xl mb-3">💬</div>
            <h4 className="font-bold text-lg mb-2">{t('messageUs')}</h4>
            <p className="text-gray-400">{t('viaMessenger')}</p>
          </div>
          <div>
            <div className="text-3xl mb-3">📧</div>
            <h4 className="font-bold text-lg mb-2">{t('emailUs')}</h4>
            <p className="text-gray-400">{t('replyIn24Hours')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
