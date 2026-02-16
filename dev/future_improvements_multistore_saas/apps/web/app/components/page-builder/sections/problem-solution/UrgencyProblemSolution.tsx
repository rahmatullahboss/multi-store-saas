/**
 * Urgency Problem Solution - Dark FOMO style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { ProblemSolutionVariantProps } from './types';

export function UrgencyProblemSolution({ 
  title, problemTitle, problems, solutionTitle, solutions, solution, theme: _theme, styleProps 
}: ProblemSolutionVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative" 
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#0F0F0F',
        background: sectionStyle.background || 'linear-gradient(180deg, #0F0F0F 0%, #1A0000 50%, #0F0F0F 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Warning stripes */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: 'repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 20px, #000000 20px, #000000 40px)' }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {title && (
          <h2 
            className="text-3xl font-black text-center mb-4 uppercase"
            style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <p className="text-center text-red-500 mb-10 font-bold animate-pulse">
          ⚠️ এই সমস্যাগুলো আপনার জীবনকে কঠিন করছে ⚠️
        </p>
        
        {/* Problems */}
        <div className="mb-10">
          {problemTitle && (
            <h3 className="text-lg font-bold mb-6 text-red-400 uppercase">{problemTitle}</h3>
          )}
          <div className="space-y-4">
            {problems.map((problem, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg relative overflow-hidden group"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: '#EF4444' }}
                />
                <span className="text-2xl">💢</span>
                <p className="text-red-300 font-medium">
                  {typeof problem === 'string' ? problem : (problem as { text: string }).text}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Arrow */}
        <div className="text-center text-5xl mb-10 animate-bounce">
          <span className="text-green-500">⬇️</span>
        </div>
        
        {/* Solution */}
        <div 
          className="p-8 rounded-xl text-center relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #065F46, #047857)',
            border: '2px solid #10B981',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className="absolute top-2 right-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded animate-pulse">
            সমাধান!
          </div>
          <h3 className="text-2xl font-black mb-4 text-white uppercase">{solutionTitle}</h3>
          {solutions.length > 0 ? (
            <div className="space-y-3">
              {solutions.map((s, i) => (
                <p key={i} className="text-lg text-emerald-100">✅ {s}</p>
              ))}
            </div>
          ) : (
            <p className="text-lg text-emerald-100">{solution}</p>
          )}
        </div>
      </div>
    </section>
  );
}
