import { ReactNode } from 'react';
// import { useTranslation } from '~/contexts/LanguageContext';

interface OnboardingLayoutProps {
  children: ReactNode;
  featureComponent?: ReactNode;
}

export function OnboardingLayout({ children, featureComponent }: OnboardingLayoutProps) {
  // const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Side (Desktop) / Top Side (Mobile) - Features */}
      <div className="w-full md:w-1/2 lg:w-[45%] bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 md:p-12 flex flex-col justify-between shrink-0">
        {/* Logo Area */}
        <div className="mb-8 md:mb-0">
           <img src="/brand/logo-green.webp" alt="Ozzyl" className="h-8 md:h-10 w-auto" />
        </div>

        {/* Feature Content */}
        <div className="flex-1 flex flex-col justify-center">
            {featureComponent}
        </div>
        
        {/* Desktop Footer (Copyright etc) - Hidden on mobile if needed */}
        <div className="hidden md:block text-sm text-gray-400 mt-8">
            © {new Date().getFullYear()} Ozzyl. All rights reserved.
        </div>
      </div>

      {/* Right Side (Desktop) / Bottom Side (Mobile) - Form Content */}
      <div className="w-full md:w-1/2 lg:w-[55%] bg-white flex flex-col">
        <div className="w-full max-w-2xl mx-auto p-6 md:p-10 flex-1 flex flex-col justify-center">
            {children}
        </div>
      </div>
    </div>
  );
}
