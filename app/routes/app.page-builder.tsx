/**
 * Advanced Page Builder Route
 * 
 * This route hosts the GrapesJS editor for creating custom landing pages.
 */

import { Suspense, lazy } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useTranslation } from '~/contexts/LanguageContext';

// Lazy load the editor as it's heavy and uses browser APIs
const GrapesEditor = lazy(() => import('~/components/page-builder/Editor'));

export const meta: MetaFunction = () => {
  return [{ title: 'Advanced Page Builder' }];
};

export default function PageBuilderRoute() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Info */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Advanced Page Builder (Beta)</h1>
          <p className="text-sm text-gray-500">Drag and drop elements to create your perfect landing page.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Preview
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
            Save Page
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 relative">
        {typeof document !== 'undefined' ? (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium font-sans">Loading GrapesJS Editor...</p>
              </div>
            </div>
          }>
            <GrapesEditor />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
             <p className="text-gray-500">Initializing workspace...</p>
          </div>
        )}
      </div>
    </div>
  );
}
