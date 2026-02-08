/**
 * Neubrutalist Problem Solution - Bold, raw aesthetic
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { ProblemSolutionVariantProps } from './types';

export function NeubrutalistProblemSolution({ 
  title, problemTitle, problems, solutionTitle, solutions, solution, theme: _theme, styleProps 
}: ProblemSolutionVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6" 
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#FFFBEB',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily || '"Space Grotesk", sans-serif',
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-3xl md:text-4xl font-black text-center mb-12 uppercase"
            style={{ 
              color: headingColor || '#000000', 
              textShadow: '4px 4px 0 #FFE500',
              ...headingStyle,
            }}
          >
            {title}
          </h2>
        )}
        
        {/* Problems */}
        <div className="mb-10">
          {problemTitle && (
            <h3 
              className="text-xl font-black mb-6 uppercase"
              style={{ color: '#DC2626' }}
            >
              ❌ {problemTitle}
            </h3>
          )}
          <div className="space-y-4">
            {problems.map((problem, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-4"
                style={{ 
                  backgroundColor: '#FF6B6B',
                  border: '4px solid #000000',
                  boxShadow: '6px 6px 0 #000000',
                }}
              >
                <span className="text-2xl">😤</span>
                <p className="font-bold text-black">
                  {typeof problem === 'string' ? problem : (problem as { text: string }).text}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Arrow */}
        <div 
          className="text-center text-5xl mb-10 font-black"
          style={{ color: '#000000' }}
        >
          ⬇️
        </div>
        
        {/* Solution */}
        <div 
          className="p-8 text-center"
          style={{ 
            backgroundColor: '#4ECDC4',
            border: '4px solid #000000',
            boxShadow: '8px 8px 0 #000000',
          }}
        >
          <h3 className="text-2xl font-black mb-4 uppercase text-black">{solutionTitle}</h3>
          {solutions.length > 0 ? (
            <div className="space-y-2">
              {solutions.map((s, i) => (
                <p key={i} className="text-lg font-bold text-black">✅ {s}</p>
              ))}
            </div>
          ) : (
            <p className="text-lg font-bold text-black">{solution}</p>
          )}
        </div>
      </div>
    </section>
  );
}
