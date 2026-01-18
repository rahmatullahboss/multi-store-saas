/**
 * Newsletter Section
 * 
 * Email subscription form.
 */

import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import type { RenderContext } from '~/lib/template-resolver.server';

interface NewsletterSectionProps {
  sectionId: string;
  props: {
    title?: string;
    description?: string;
    buttonText?: string;
    successMessage?: string;
  };
  context: RenderContext;
}

export default function NewsletterSection({ sectionId, props, context }: NewsletterSectionProps) {
  const {
    title = 'Subscribe to Our Newsletter',
    description = 'Get updates on new products and special offers',
    buttonText = 'Subscribe',
    successMessage = 'Thanks for subscribing!',
  } = props;

  const themeColors = context.theme;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.accentColor + '10' }}
    >
      <div className="max-w-xl mx-auto text-center">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ 
            color: themeColors.textColor,
            fontFamily: themeColors.headingFont,
          }}
        >
          {title}
        </h2>
        
        <p className="text-gray-600 mb-6">{description}</p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: themeColors.accentColor }}
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                buttonText
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-2 text-sm text-red-500">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
