/**
 * CTA Section Types
 */

export type CTAVariant = 
  | 'default'
  | 'glassmorphism'
  | 'neubrutalism'
  | 'trust-first'
  | 'story-driven'
  | 'urgency'
  | 'social-proof'
  | 'minimal'
  | 'premium';

export interface CTAWrapperProps {
  children: React.ReactNode;
  headline?: string;
  subheadline?: string;
}
