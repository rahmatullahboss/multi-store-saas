/**
 * Default Problem Solution - Original dark gradient style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { ProblemSolutionVariantProps } from './types';

export function DefaultProblemSolution({ 
  title, problemTitle, problems, solutionTitle, solutions, solution, theme, styleProps 
}: ProblemSolutionVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  const isLight = theme?.style === 'professional' || theme?.style === 'nature' || theme?.style === 'minimal';
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const getBgStyle = () => {
    if (backgroundColor || backgroundGradient) {
      return { backgroundColor: sectionStyle.backgroundColor, background: sectionStyle.background };
    }
    if (theme?.style === 'urgent') {
      return { background: 'linear-gradient(to bottom, #450A0A, #7F1D1D)' };
    }
    if (isDark) {
      return { background: 'linear-gradient(to bottom, #111827, #1F2937)' };
    }
    if (isLight) {
      return { background: 'linear-gradient(to bottom, #F9FAFB, #F3F4F6)' };
    }
    return { background: 'linear-gradient(to bottom, #111827, #1F2937)' };
  };
  
  const finalTextColor = isDark || !isLight ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark || !isLight ? 'rgba(255,255,255,0.8)' : (theme?.mutedTextColor || '#6B7280');
  const primaryColor = theme?.primaryColor || '#10B981';
  const accentColor = theme?.accentColor || '#059669';
  
  const problemBg = theme?.style === 'urgent' ? 'rgba(220,38,38,0.3)' : isLight ? 'rgba(220,38,38,0.1)' : 'rgba(239,68,68,0.2)';
  const problemBorder = theme?.style === 'urgent' ? 'rgba(220,38,38,0.5)' : isLight ? 'rgba(220,38,38,0.2)' : 'rgba(239,68,68,0.3)';
  const problemText = isLight ? '#991B1B' : '#FCA5A5';

  return (
    <section 
      className="py-12 px-4" 
      style={{
        ...getBgStyle(),
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-10"
            style={{ color: finalTextColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <div className="space-y-4 mb-10">
          {problemTitle && (
            <h3 className="font-semibold mb-4" style={{ color: mutedColor }}>{problemTitle}</h3>
          )}
          {problems.map((problem, i) => (
            <div 
              key={i}
              className="flex items-center gap-4 rounded-lg p-4"
              style={{ backgroundColor: problemBg, border: `1px solid ${problemBorder}` }}
            >
              <span className="text-xl">😞</span>
              <p style={{ color: isLight ? problemText : '#FCA5A5' }}>
                {typeof problem === 'string' ? problem : (problem as { text: string }).text}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center text-4xl mb-6">⬇️</div>
        
        <div 
          className="rounded-xl p-6 text-center text-white"
          style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
        >
          <h3 className="text-xl font-bold mb-2">{solutionTitle}</h3>
          {solutions.length > 0 ? (
            <div className="space-y-2">
              {solutions.map((s, i) => (
                <p key={i} className="text-lg">✓ {s}</p>
              ))}
            </div>
          ) : (
            <p className="text-lg">{solution}</p>
          )}
        </div>
      </div>
    </section>
  );
}
