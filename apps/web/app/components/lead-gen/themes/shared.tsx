/**
 * Shared Components for Lead Gen Themes
 * 
 * Reusable components used across all lead gen theme renderers.
 */

import { useFetcher } from '@remix-run/react';
import type { LeadGenSettingsWithTheme } from '~/services/lead-gen-settings.server';

// ============================================================================
// TYPES
// ============================================================================
export interface LeadGenThemeProps {
  settings: LeadGenSettingsWithTheme;
  storeId: number;
}

// ============================================================================
// UTILITIES
// ============================================================================

export function hexToRgb(hexColor: string): string {
  const value = hexColor.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const normalized = full.padEnd(6, '0').slice(0, 6);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

// ============================================================================
// LEAD CAPTURE FORM
// ============================================================================

export function LeadCaptureForm({ 
  formId, 
  submitButtonText,
  primaryColor 
}: { 
  formId: string;
  submitButtonText: string;
  primaryColor: string;
}) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;

  if (actionData?.success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" action="/api/submit-lead" className="space-y-4">
      <input type="hidden" name="form_id" value={formId} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          name="company"
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          name="message"
          rows={4}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      {/* Honeypot */}
      <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-white font-semibold py-4 rounded-lg hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </button>
      {actionData?.success === false && actionData.error ? (
        <p className="text-sm text-red-600">{actionData.error}</p>
      ) : null}
    </fetcher.Form>
  );
}

// ============================================================================
// REUSABLE CARDS
// ============================================================================

export function ServiceCard({ title, description, primaryColor }: { title: string; description: string; primaryColor: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
        <svg className="w-8 h-8" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export function TestimonialCard({ text, author, position, rating }: { text: string; author: string; position: string; rating: number }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="text-gray-700 mb-6">"{text}"</blockquote>
      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-600">{position}</div>
      </div>
    </div>
  );
}
