/**
 * PageHeader - Consistent header for all admin pages
 * Shopify-inspired design with title, description, and action buttons
 */

import { Link } from '@remix-run/react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backLink,
  backLabel,
  primaryAction,
  secondaryAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Back link */}
      {backLink && (
        <Link
          to={backLink}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel || 'Back'}
        </Link>
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction || children) && (
          <div className="flex items-center gap-3">
            {children}
            
            {secondaryAction && (
              secondaryAction.href ? (
                <Link
                  to={secondaryAction.href}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  {secondaryAction.icon}
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  {secondaryAction.icon}
                  {secondaryAction.label}
                </button>
              )
            )}

            {primaryAction && (
              primaryAction.href ? (
                <Link
                  to={primaryAction.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
                >
                  {primaryAction.icon}
                  {primaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {primaryAction.icon}
                  {primaryAction.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
