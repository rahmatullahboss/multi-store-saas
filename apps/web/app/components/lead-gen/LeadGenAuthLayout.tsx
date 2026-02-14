/**
 * Lead Gen Auth Layout
 * 
 * Reusable layout for login/register pages that matches homepage header/footer design.
 */

import { Link } from '@remix-run/react';

interface LeadGenAuthLayoutProps {
  children: React.ReactNode;
  storeName: string;
  logo?: string;
  primaryColor: string;
  showRegisterLink?: boolean;
  showLoginLink?: boolean;
}

export function LeadGenAuthLayout({
  children,
  storeName,
  logo,
  primaryColor,
  showRegisterLink = true,
  showLoginLink = true,
}: LeadGenAuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - Same as Homepage */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            {logo ? (
              <img className="h-10 w-auto" src={logo} alt={storeName} />
            ) : (
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                {storeName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showLoginLink && (
              <Link
                to="/lead-gen/auth/login"
                className="px-4 py-2 font-medium hover:opacity-80 transition"
                style={{ color: primaryColor }}
              >
                Login
              </Link>
            )}
            {showRegisterLink && (
              <Link
                to="/lead-gen/auth/register"
                className="px-5 py-2.5 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                style={{ backgroundColor: primaryColor }}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>

      {/* Footer - Same as Homepage */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                {storeName}
              </h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for quality education abroad.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/lead-gen/auth/register" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">Get in touch for free consultation</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2026 {storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
