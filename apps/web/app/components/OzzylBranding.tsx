/**
 * Powered by Ozzyl Branding Component
 * 
 * Non-removable footer branding for all public pages.
 * This establishes brand presence across the platform.
 */

export function OzzylBranding() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-center text-xs text-gray-500">
          Powered by{' '}
          <a 
            href="https://ozzyl.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Ozzyl
          </a>
          {' '}• বাংলাদেশের #১ ই-কমার্স প্ল্যাটফর্ম
        </p>
      </div>
    </footer>
  );
}

/**
 * Minimal version for tight spaces
 */
export function OzzylBrandingMini() {
  return (
    <div className="text-center py-2">
      <span className="text-[10px] text-gray-400">
        Powered by{' '}
        <a 
          href="https://ozzyl.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-600"
        >
          Ozzyl
        </a>
      </span>
    </div>
  );
}
