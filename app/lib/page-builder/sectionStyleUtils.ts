/**
 * Section Styling Utilities
 * 
 * Helper functions to apply per-section styling in preview components.
 */

import { FONT_FAMILIES, PADDING_Y_VALUES } from './schemas';

export interface SectionStyleProps {
  backgroundColor?: string;
  backgroundGradient?: string;
  textColor?: string;
  headingColor?: string;
  fontFamily?: string;
  paddingY?: string;
}

/**
 * Generate CSS styles object for a section based on props.
 * Falls back to theme/defaults if not set.
 */
export function getSectionStyle(
  props: SectionStyleProps,
  themeDefaults?: Partial<SectionStyleProps>
): React.CSSProperties {
  const merged = { ...themeDefaults, ...props };
  
  const style: React.CSSProperties = {};
  
  // Background - gradient takes priority over solid color
  if (merged.backgroundGradient) {
    style.background = merged.backgroundGradient;
  } else if (merged.backgroundColor) {
    style.backgroundColor = merged.backgroundColor;
  }
  
  // Text color
  if (merged.textColor) {
    style.color = merged.textColor;
  }
  
  // Font family
  if (merged.fontFamily && merged.fontFamily !== 'default') {
    style.fontFamily = FONT_FAMILIES[merged.fontFamily] || 'inherit';
  }
  
  // Padding
  if (merged.paddingY && merged.paddingY !== 'md') {
    const paddingValue = PADDING_Y_VALUES[merged.paddingY] || '2rem';
    style.paddingTop = paddingValue;
    style.paddingBottom = paddingValue;
  }
  
  return style;
}

/**
 * Generate heading style based on props.
 */
export function getHeadingStyle(props: SectionStyleProps): React.CSSProperties {
  const style: React.CSSProperties = {};
  
  if (props.headingColor) {
    style.color = props.headingColor;
  } else if (props.textColor) {
    style.color = props.textColor;
  }
  
  return style;
}
