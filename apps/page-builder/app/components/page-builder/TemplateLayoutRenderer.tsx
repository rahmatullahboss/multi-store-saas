import { ReactNode } from 'react';

interface TemplateLayoutRendererProps {
  templateId: string;
  children: ReactNode;
}

/**
 * Renders template-specific global layouts, backgrounds, and styles.
 * This allows each template to have a dramatically different feel even if they share section components.
 */
export function TemplateLayoutRenderer({ templateId, children }: TemplateLayoutRendererProps) {
  switch (templateId) {
    case 'flash-sale':
      return (
        <div className="flash-sale-layout min-h-screen bg-[#7F1D1D] text-white selection:bg-yellow-400 selection:text-red-900 font-sans">
            {/* Sticky/Fixed elements for Flash Sale can go here */}
             <style>{`
                .flash-sale-layout {
                  --theme-primary: #DC2626;
                  --theme-accent: #FBBF24;
                }
            `}</style>
            {children}
        </div>
      );
      
    case 'luxe':
        return (
            <div className="luxe-layout min-h-screen bg-white text-slate-900 font-serif selection:bg-slate-200">
                <style>{`
                    /* Elegant serif fonts for Luxe */
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
                    .luxe-layout h1, .luxe-layout h2, .luxe-layout h3 {
                        font-family: 'Playfair Display', serif;
                    }
                `}</style>
                {children}
            </div>
        );
        
    case 'awwwards-2025':
        return (
            <div className="awwwards-layout min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500 selection:text-white font-sans antialiased overflow-x-hidden">
                {/* Global Ambient Background Effects */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full opacity-40 mix-blend-screen animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full opacity-30 mix-blend-screen" />
                    <div className="absolute top-[40%] left-[50%] w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full opacity-20 -translate-x-1/2" />
                </div>
                
                {/* Noise texture overlay */}
                <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay" 
                     style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/200%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
                />

                <style>{`
                    @keyframes pulse-slow {
                        0%, 100% { opacity: 0.4; }
                        50% { opacity: 0.2; }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                `}</style>
                
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        );
        
    case 'organic':
        return (
             <div className="organic-layout min-h-screen bg-[#F0FDF4] text-[#14532D] font-sans selection:bg-green-200">
                <div className="fixed inset-0 pointer-events-none z-0 opacity-40" 
                     style={{ 
                         backgroundImage: `radial-gradient(#16A34A 0.5px, transparent 0.5px), radial-gradient(#16A34A 0.5px, #F0FDF4 0.5px)`,
                         backgroundSize: '20px 20px',
                         backgroundPosition: '0 0, 10px 10px'
                     }} 
                />
                 <div className="relative z-10">
                    {children}
                </div>
            </div>
        );
        
    case 'modern-dark':
         return (
            <div className="modern-dark-layout min-h-screen bg-[#1A1A2E] text-white selection:bg-[#E94560] selection:text-white font-sans">
                {children}
            </div>
         );

    default:
      // Default: Clean slate
      return <div className="default-layout min-h-screen bg-white">{children}</div>;
  }
}
