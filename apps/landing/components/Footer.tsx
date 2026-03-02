'use client';

import { ArrowRight, Phone, MessageCircle, Mail, Facebook, Instagram } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ASSETS } from '@/config/assets';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0A0F0D] text-white/60">
      {/* 1. Main Links Section (Constrained) */}
      <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <img                 src={ASSETS.brand.logoWhite}
                alt="Ozzyl"
                className="h-10 w-auto"
                width={103}
                height={40}
                loading="lazy"
              />
            </div>
            <p className="text-sm text-white/50">{t('footerAbout')}</p>
          </div>

          {/* Product Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerProduct')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#features"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkFeatures')}
                </a>
              </li>
              <li>
                <a href="/pricing"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkPricing')}
                </a>
              </li>
              <li>
                <a href="/tutorials"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkTemplates')}
                </a>
              </li>
              <li>
                <a href="/templates"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkIntegrations')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="text-[#006A4E] font-semibold mb-4">যোগাযোগ</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+8801570260118"
                  className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2 justify-center sm:justify-start"
                >
                  <Phone className="w-4 h-4" /> <span>01570-260118</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8801739416661"
                  className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2 justify-center sm:justify-start"
                >
                  <MessageCircle className="w-4 h-4" /> <span>Support Chat</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@ozzyl.com"
                  className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2 justify-center sm:justify-start"
                >
                  <Mail className="w-4 h-4" /> <span>hello@ozzyl.com</span>
                </a>
              </li>
              <li>
                <a href="/contact"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkContact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerLegal')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkPrivacy')}
                </a>
              </li>
              <li>
                <a href="/terms"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkTerms')}
                </a>
              </li>
              <li>
                <a href="/refund"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkRefund')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Try Now Section (Full Width) */}
      <div className="w-full border-y border-white/5">
        <a href="/register"
          className="group relative flex items-center justify-between w-full py-24 md:py-32 px-4 md:px-12 hover:bg-white/5 transition-colors duration-500 overflow-hidden"
        >
          {/* Centered Content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {/* Grid for Overlay - Full Width */}
            <div className="grid place-items-center w-full px-4 md:px-8">
              {/* Logo (Default) */}
              <div className="col-start-1 row-start-1 w-full transition-transform duration-500 group-hover:-translate-y-full opacity-100 group-hover:opacity-0 flex justify-center">
                <img                   src={ASSETS.brand.logoWhite}
                  alt="Ozzyl"
                  width={1200}
                  height={400}
                  quality={100}
                  priority
                  className="w-auto h-auto max-w-[95vw] max-h-[60vh] object-contain object-center scale-[2]"
                />
              </div>

              {/* Text (Hover) */}
              <div className="col-start-1 row-start-1 w-full transition-all duration-500 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex justify-center">
                <h2 className="text-[15vw] leading-none font-bold font-sans text-[#00875F] tracking-tighter text-center pr-[5vw]">
                  Try Now
                </h2>
              </div>
            </div>
          </div>

          {/* Arrow Icon (Right Aligned) */}
          <div className="ml-auto w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#00875F] group-hover:border-[#00875F] transition-all duration-500 group-hover:scale-110 relative z-10 bg-[#0A0F0D] group-hover:bg-[#00875F]">
            <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-white transform group-hover:-rotate-45 transition-transform duration-500" />
          </div>
        </a>
      </div>

      {/* 3. Copyright Section (Constrained) */}
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">{t('copyright')}</p>
          <div className="flex items-center gap-3">
            {[
              { icon: MessageCircle, label: 'WhatsApp' },
              { icon: Facebook, label: 'Facebook' },
              { icon: Instagram, label: 'Instagram' },
            ].map((social, i) => (
              <a                 key={i}
                href="#"
                className="w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition"
                title={social.label}
              >
                <social.icon className="w-5 h-5 text-[#00875F]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
