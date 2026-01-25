/**
 * useAIContentGenerator Hook
 *
 * React hook for generating AI content in the page builder.
 * Uses OpenRouter via the /api/ai/generate-content endpoint.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Content types that can be generated
export type AIContentType =
  | 'headline'
  | 'subheadline'
  | 'description'
  | 'cta'
  | 'feature'
  | 'faq'
  | 'testimonial'
  | 'benefit'
  | 'trust'
  | 'urgency';

// Context for generation
export interface AIGenerationContext {
  productName?: string;
  productDescription?: string;
  productPrice?: number;
  sectionType?: string;
  currentContent?: string;
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
  language?: 'bn' | 'en';
}

// Generation result
export interface AIGenerationResult {
  content?: string;
  // Structured results for specific types
  emoji?: string;
  title?: string;
  description?: string;
  question?: string;
  answer?: string;
  name?: string;
  testimonial?: string;
}

interface UseAIContentGeneratorOptions {
  onSuccess?: (result: AIGenerationResult) => void;
  onError?: (error: string) => void;
}

export function useAIContentGenerator(options: UseAIContentGeneratorOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<AIGenerationResult | null>(null);

  const generate = useCallback(
    async (
      type: AIContentType,
      context: AIGenerationContext = {}
    ): Promise<AIGenerationResult | null> => {
      setIsGenerating(true);

      try {
        const response = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, context }),
        });

        const data = (await response.json()) as {
          error?: string;
          result?: AIGenerationResult;
        };

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Generation failed');
        }

        const result = data.result as AIGenerationResult;
        setLastResult(result);

        toast.success('AI কন্টেন্ট তৈরি হয়েছে', {
          icon: '✨',
          duration: 2000,
        });

        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'AI generation failed';

        toast.error('AI কন্টেন্ট তৈরি করতে সমস্যা হয়েছে', {
          description: errorMessage,
        });

        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  // Shorthand methods for common content types
  const generateHeadline = useCallback(
    (context?: AIGenerationContext) => generate('headline', context),
    [generate]
  );

  const generateDescription = useCallback(
    (context?: AIGenerationContext) => generate('description', context),
    [generate]
  );

  const generateCTA = useCallback(
    (context?: AIGenerationContext) => generate('cta', context),
    [generate]
  );

  const generateFAQ = useCallback(
    (context?: AIGenerationContext) => generate('faq', context),
    [generate]
  );

  const generateTestimonial = useCallback(
    (context?: AIGenerationContext) => generate('testimonial', context),
    [generate]
  );

  return {
    generate,
    isGenerating,
    lastResult,
    // Shorthand methods
    generateHeadline,
    generateDescription,
    generateCTA,
    generateFAQ,
    generateTestimonial,
  };
}

export default useAIContentGenerator;
