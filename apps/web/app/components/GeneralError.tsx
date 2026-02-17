/**
 * GeneralError Component
 * 
 * A reusable, user-friendly error display component with:
 * - 404: Store Not Found / Page Not Found
 * - 500: Server Error / Maintenance Mode
 * - Generic: Unknown errors
 */

import { isRouteErrorResponse } from '@remix-run/react';
import { AlertTriangle, Home, RefreshCw, Store, Search, LogIn, UserPlus, LogOut } from 'lucide-react';

interface GeneralErrorProps {
  error: unknown;
  /** If true, includes full HTML document wrapper (for root.tsx) */
  isRootError?: boolean;
}

/**
 * Determines the error type and extracts relevant information
 */
function getErrorDetails(error: unknown): {
  status: number;
  title: string;
  message: string;
  type: 'not-found' | 'server-error' | 'unknown';
} {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      // Check if it's specifically a store not found error
      const isStoreNotFound = 
        typeof error.data === 'string' && 
        error.data.toLowerCase().includes('store');
      
      return {
        status: 404,
        title: isStoreNotFound ? 'Store Not Found' : 'Page Not Found',
        message: isStoreNotFound 
          ? 'The store you are looking for does not exist or may have been removed.'
          : 'The page you requested could not be found.',
        type: 'not-found',
      };
    }
    
    if (error.status >= 500) {
      return {
        status: error.status,
        title: 'Service Temporarily Unavailable',
        message: 'We are experiencing technical difficulties. Our team has been notified and is working on a fix.',
        type: 'server-error',
      };
    }
    
    return {
      status: error.status,
      title: error.statusText || 'Something Went Wrong',
      message: typeof error.data === 'string' ? error.data : 'An unexpected error occurred.',
      type: 'unknown',
    };
  }
  
  if (error instanceof Error) {
    return {
      status: 500,
      title: 'Unexpected Error',
      message: 'Something went wrong on our end. Please try again.',
      type: 'server-error',
    };
  }
  
  return {
    status: 500,
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again later.',
    type: 'unknown',
  };
}

/**
 * Error content component (without document wrapper)
 */
export function ErrorContent({ error }: { error: unknown }) {
  const { status, title, message, type } = getErrorDetails(error);
  
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with status-based color */}
          <div 
            className={`px-6 py-8 text-center ${
              type === 'not-found' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : type === 'server-error'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                : 'bg-gradient-to-r from-gray-600 to-gray-700'
            }`}
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              {type === 'not-found' ? (
                <Search className="w-8 h-8 text-white" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-white" />
              )}
            </div>
            
            {/* Status Code */}
            <p className="text-white/80 text-sm font-medium tracking-wider uppercase mb-1">
              Error {status}
            </p>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-white">
              {title}
            </h1>
          </div>
          
          {/* Body */}
          <div className="px-6 py-8 text-center">
            <p className="text-gray-600 mb-8 leading-relaxed">
              {message}
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              {type === 'server-error' && (
                <button
                  onClick={handleReload}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
              
              <a
                href="/"
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors ${
                  type === 'server-error'
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer Message */}
        <p className="text-center text-gray-500 text-sm mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}

/**
 * Store Not Found specific component
 */
export function StoreNotFoundError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-6 border border-gray-700">
          <Store className="w-12 h-12 text-gray-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Store Does Not Exist
        </h1>
        
        {/* Message */}
        <p className="text-gray-400 mb-8 leading-relaxed">
          The store you're looking for doesn't exist or may have been removed. 
          Please check the URL and try again.
        </p>
        
        {/* CTA */}
        {/* CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all active:scale-95 w-full sm:w-auto min-w-[160px]"
          >
            <Home className="w-4 h-4" />
            Browse Stores
          </a>
          
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-all active:scale-95 w-full sm:w-auto min-w-[160px]"
          >
            <LogIn className="w-4 h-4" />
            Login
          </a>

          <a
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all active:scale-95 w-full sm:w-auto min-w-[160px]"
          >
            <UserPlus className="w-4 h-4" />
            Register
          </a>

          <a
            href="/auth/logout"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-rose-500/50 text-rose-400 text-sm font-semibold rounded-lg hover:bg-rose-500/10 transition-all active:scale-95 w-full sm:w-auto min-w-[160px]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Maintenance Mode / Server Error component
 */
export function MaintenanceError() {
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-yellow-400 rounded-full opacity-25"></div>
            <AlertTriangle className="relative w-12 h-12 text-yellow-400" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Store Currently Unavailable
        </h1>
        
        {/* Message */}
        <p className="text-gray-300 mb-8 leading-relaxed">
          We're performing some maintenance to serve you better. 
          Please check back in a few moments.
        </p>
        
        {/* CTA */}
        <button
          onClick={handleReload}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        
        {/* Secondary Link */}
        <p className="text-gray-400 text-sm mt-6">
          Need help?{' '}
          <a href="mailto:contact@ozzyl.com" className="text-white underline hover:no-underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Main GeneralError component
 * Detects error type and renders appropriate UI
 */
export function GeneralError({ error, isRootError = false }: GeneralErrorProps) {
  const { type, status } = getErrorDetails(error);
  
  // Determine which component to render
  let content: React.ReactNode;
  
  if (type === 'not-found' && status === 404) {
    // Check if it's specifically a store not found
    if (isRouteErrorResponse(error) && 
        typeof error.data === 'string' && 
        error.data.toLowerCase().includes('store')) {
      content = <StoreNotFoundError />;
    } else {
      content = <ErrorContent error={error} />;
    }
  } else if (type === 'server-error') {
    content = <MaintenanceError />;
  } else {
    content = <ErrorContent error={error} />;
  }
  
  // For root errors, wrap in full HTML document
  if (isRootError) {
    return (
      <html lang="en" className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{type === 'not-found' ? 'Not Found' : 'Error'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
            rel="stylesheet" 
          />
          {/* Inline critical Tailwind styles for error page */}
          <style dangerouslySetInnerHTML={{ __html: `
            *, ::before, ::after { box-sizing: border-box; }
            html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
            body { margin: 0; line-height: inherit; }
            .min-h-screen { min-height: 100vh; }
            .flex { display: flex; }
            .inline-flex { display: inline-flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .p-4 { padding: 1rem; }
            .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-6 { margin-top: 1.5rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .w-full { width: 100%; }
            .max-w-md { max-width: 28rem; }
            .min-w-\\[160px\\] { min-width: 160px; }
            .w-4 { width: 1rem; }
            .h-4 { height: 1rem; }
            .w-8 { width: 2rem; }
            .h-8 { height: 2rem; }
            .w-12 { width: 3rem; }
            .h-12 { height: 3rem; }
            .w-16 { width: 4rem; }
            .h-16 { height: 4rem; }
            .w-24 { width: 6rem; }
            .h-24 { height: 6rem; }
            .text-center { text-align: center; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .leading-relaxed { line-height: 1.625; }
            .text-white { color: rgb(255 255 255); }
            .text-gray-300 { color: rgb(209 213 219); }
            .text-gray-400 { color: rgb(156 163 175); }
            .text-gray-500 { color: rgb(107 114 128); }
            .text-gray-600 { color: rgb(75 85 99); }
            .text-gray-700 { color: rgb(55 65 81); }
            .text-gray-900 { color: rgb(17 24 39); }
            .text-yellow-400 { color: rgb(250 204 21); }
            .text-rose-400 { color: rgb(248 113 113); }
            .bg-white { background-color: rgb(255 255 255); }
            .bg-white\\/10 { background-color: rgb(255 255 255 / 0.1); }
            .hover\\:bg-white\\/20:hover { background-color: rgb(255 255 255 / 0.2); }
            .bg-gray-800 { background-color: rgb(31 41 55); }
            .bg-gray-900 { background-color: rgb(17 24 39); }
            .bg-emerald-600 { background-color: rgb(5 150 105); }
            .hover\\:bg-emerald-700:hover { background-color: rgb(4 120 87); }
            .border-rose-500\\/50 { border-color: rgb(244 63 94 / 0.5); }
            .hover\\:bg-rose-500\\/10:hover { background-color: rgb(244 63 94 / 0.1); }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-full { border-radius: 9999px; }
            .rounded-2xl { border-radius: 1rem; }
            .border { border-width: 1px; }
            .border-gray-300 { border-color: rgb(209 213 219); }
            .border-white\\/20 { border-color: rgb(255 255 255 / 0.2); }
            .border-gray-700 { border-color: rgb(55 65 81); }
            .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
            .overflow-hidden { overflow: hidden; }
            .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
            .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .active\\:scale-95:active { transform: scale(0.95); }
            .underline { text-decoration-line: underline; }
            .flex-wrap { flex-wrap: wrap; }
            .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
            .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
            .from-gray-50 { --tw-gradient-from: #f9fafb; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .to-gray-100 { --tw-gradient-to: #f3f4f6; }
            .from-gray-900 { --tw-gradient-from: #111827; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .to-gray-800 { --tw-gradient-to: #1f2937; }
            .from-amber-500 { --tw-gradient-from: #f59e0b; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .to-orange-500 { --tw-gradient-to: #f97316; }
            .from-rose-500 { --tw-gradient-from: #f43f5e; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .to-pink-500 { --tw-gradient-to: #ec4899; }
            .from-indigo-900 { --tw-gradient-from: #312e81; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .via-purple-900 { --tw-gradient-via: #581c87; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to); }
            .to-pink-800 { --tw-gradient-to: #9d174d; }
            .from-gray-600 { --tw-gradient-from: #4b5563; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .to-gray-700 { --tw-gradient-to: #374151; }
            .backdrop-blur-sm { backdrop-filter: blur(4px); }
            .opacity-25 { opacity: 0.25; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .inset-0 { inset: 0; }
            @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
            .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
            button { cursor: pointer; border: none; }
            a { color: inherit; text-decoration: inherit; }
          `}} />
        </head>
        <body style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {content}
        </body>
      </html>
    );
  }
  
  return <>{content}</>;
}

export default GeneralError;
