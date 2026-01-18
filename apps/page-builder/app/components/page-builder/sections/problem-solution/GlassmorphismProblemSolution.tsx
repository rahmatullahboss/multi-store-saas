/**
 * Glassmorphism Problem Solution - Frosted glass style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { ProblemSolutionVariantProps } from './types';

export function GlassmorphismProblemSolution({ 
  title, problemTitle, problems, solutionTitle, solutions, solution, theme, styleProps 
}: ProblemSolutionVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative overflow-hidden" 
      style={{
        background: sectionStyle.background || 'linear-gradient(135deg, #1a1a3e 0%, #0F0F23 50%, #1a1a3e 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #EF4444, transparent)', top: '10%', left: '10%' }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #10B981, transparent)', bottom: '10%', right: '10%', animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {title && (
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        {/* Problems */}
        <div className="mb-8">
          {problemTitle && (
            <h3 className="text-lg font-semibold mb-6 text-white/80 text-center">{problemTitle}</h3>
          )}
          <div className="space-y-4">
            {problems.map((problem, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-5 rounded-2xl"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <span className="text-2xl">😞</span>
                <p className="text-red-300">{typeof problem === 'string' ? problem : (problem as any).text}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Arrow */}
        <div className="text-center text-5xl mb-8 animate-bounce">↓</div>
        
        {/* Solution */}
        <div 
          className="p-8 rounded-3xl text-center"
          style={{ 
            background: 'rgba(16, 185, 129, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
          }}
        >
          <h3 className="text-2xl font-bold mb-4 text-emerald-400">{solutionTitle}</h3>
          {solutions.length > 0 ? (
            <div className="space-y-3">
              {solutions.map((s, i) => (
                <p key={i} className="text-lg text-white/90">✓ {s}</p>
              ))}
            </div>
          ) : (
            <p className="text-lg text-white/90">{solution}</p>
          )}
        </div>
      </div>
    </section>
  );
}
