/**
 * AIGenerateButton Component
 *
 * A button that generates AI content for page builder fields.
 * Shows a sparkle icon and loading state during generation.
 */

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import {
  useAIContentGenerator,
  type AIContentType,
  type AIGenerationContext,
} from '~/hooks/useAIContentGenerator';

interface AIGenerateButtonProps {
  /** Type of content to generate */
  type: AIContentType;
  /** Context for generation (product info, current content, etc.) */
  context?: AIGenerationContext;
  /** Callback when content is generated */
  onGenerate: (content: string) => void;
  /** Optional: For structured types (FAQ, testimonial), provide specific field */
  field?: 'question' | 'answer' | 'name' | 'testimonial' | 'title' | 'description' | 'emoji';
  /** Button size */
  size?: 'sm' | 'md';
  /** Show as icon only */
  iconOnly?: boolean;
  /** Custom class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function AIGenerateButton({
  type,
  context = {},
  onGenerate,
  field,
  size = 'sm',
  iconOnly = false,
  className = '',
  disabled = false,
}: AIGenerateButtonProps) {
  const { generate, isGenerating } = useAIContentGenerator();
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleClick = async () => {
    const result = await generate(type, context);

    if (result) {
      setHasGenerated(true);

      // Get the appropriate field from the result
      let content: string | undefined;

      if (field && result[field as keyof typeof result]) {
        content = result[field as keyof typeof result] as string;
      } else if (result.content) {
        content = result.content;
      } else {
        // For structured types without a specific field, concatenate
        if (type === 'feature') {
          content = `${result.emoji} ${result.title}: ${result.description}`;
        } else if (type === 'faq') {
          content = result.question || result.answer;
        } else if (type === 'testimonial') {
          content = result.testimonial;
        }
      }

      if (content) {
        onGenerate(content);
      }
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const Icon = hasGenerated ? RefreshCw : Sparkles;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isGenerating}
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium
        transition-all duration-200
        ${
          isGenerating
            ? 'bg-purple-100 text-purple-600 cursor-wait'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
      title={isGenerating ? 'তৈরি হচ্ছে...' : 'AI দিয়ে তৈরি করুন'}
    >
      {isGenerating ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : (
        <Icon size={size === 'sm' ? 14 : 16} />
      )}
      {!iconOnly && (
        <span>{isGenerating ? 'তৈরি হচ্ছে...' : hasGenerated ? 'আবার তৈরি' : 'AI'}</span>
      )}
    </button>
  );
}

/**
 * Inline AI button for text inputs
 * Shows just an icon that sits next to input fields
 */
interface AIInlineButtonProps {
  type: AIContentType;
  context?: AIGenerationContext;
  onGenerate: (content: string) => void;
  field?: string;
}

export function AIInlineButton({ type, context, onGenerate, field }: AIInlineButtonProps) {
  return (
    <AIGenerateButton
      type={type}
      context={context}
      onGenerate={onGenerate}
      field={field as AIGenerateButtonProps['field']}
      size="sm"
      iconOnly
      className="absolute right-2 top-1/2 -translate-y-1/2"
    />
  );
}

export default AIGenerateButton;
