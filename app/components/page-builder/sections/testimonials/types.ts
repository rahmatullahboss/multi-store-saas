/**
 * Testimonials Section Types
 */

export type TestimonialsVariant = 
  | 'default'
  | 'cards'
  | 'chat-bubbles'
  | 'carousel'
  | 'masonry'
  | 'social-proof'
  | 'minimal';

export interface Testimonial {
  name: string;
  location?: string;
  text: string;
  rating?: number;
  avatar?: string;
}

export interface TestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
  variant?: TestimonialsVariant;
}
