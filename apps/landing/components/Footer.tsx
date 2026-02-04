'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ASSETS } from '@/config/assets';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <Image
                src={ASSETS.brand.logoWhite}
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
                <Link
                  href="/#features"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkFeatures')}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkPricing')}
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkTemplates')}
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkIntegrations')}
                </Link>
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
                  className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2"
                >
                  <span>📞</span> 01570-260118
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8801739416661"
                  className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2"
                >
                  <span>💬</span> WhatsApp: 01739-416661
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@ozzyl.com"
                  className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2"
                >
                  <span>📧</span> contact@ozzyl.com
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkContact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerLegal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkPrivacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkTerms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-white/50 hover:text-[#00875F] transition text-sm"
                >
                  {t('footerLinkRefund')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#006A4E]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">{t('copyright')}</p>
          <div className="flex items-center gap-3">
            {[
              { icon: '💬', label: 'WhatsApp' },
              { icon: '📘', label: 'Facebook' },
              { icon: '📸', label: 'Instagram' },
            ].map((social, i) => (
              <Link
                key={i}
                href="#"
                className="w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition"
                title={social.label}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
