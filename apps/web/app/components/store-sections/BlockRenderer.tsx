/**
 * BlockRenderer - Renders blocks inside sections
 *
 * This component renders block content based on block type.
 * Sections can use this to render their blocks in a consistent way.
 */

import React from 'react';
import { type Block, BLOCK_REGISTRY, getBlockDefinition } from '~/lib/block-registry';

interface BlockRendererProps {
  blocks: Block[];
  className?: string;
  // Theme colors for styling
  theme?: {
    primary?: string;
    accent?: string;
    text?: string;
    background?: string;
  };
}

/**
 * Render a single block based on its type
 */
function renderBlock(block: Block, theme?: BlockRendererProps['theme']) {
  const { type, settings } = block;

  switch (type) {
    case 'button':
      return (
        <a
          href={(settings.link as string) || '#'}
          target={settings.openInNewTab ? '_blank' : undefined}
          rel={settings.openInNewTab ? 'noopener noreferrer' : undefined}
          className={`
            inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all
            ${settings.size === 'sm' ? 'px-4 py-2 text-sm' : ''}
            ${settings.size === 'lg' ? 'px-8 py-4 text-lg' : ''}
            ${settings.style === 'primary' ? 'bg-primary text-white hover:opacity-90' : ''}
            ${settings.style === 'secondary' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
            ${settings.style === 'outline' ? 'border-2 border-current hover:bg-gray-100' : ''}
            ${settings.style === 'ghost' ? 'hover:bg-gray-100' : ''}
          `}
          style={settings.style === 'primary' ? { backgroundColor: theme?.primary } : undefined}
        >
          {(settings.text as string) || 'Click Me'}
        </a>
      );

    case 'text':
      return (
        <div
          className={`prose max-w-none ${settings.alignment === 'center' ? 'text-center' : ''} ${settings.alignment === 'right' ? 'text-right' : ''}`}
          dangerouslySetInnerHTML={{ __html: (settings.content as string) || '' }}
        />
      );

    case 'image': {
      const imageContent = (
        <figure>
          <img
            src={settings.image as string}
            alt={(settings.alt as string) || ''}
            className="w-full h-auto rounded-lg"
          />
          {typeof settings.caption === 'string' && settings.caption && (
            <figcaption className="mt-2 text-sm text-gray-500 text-center">
              {settings.caption}
            </figcaption>
          )}
        </figure>
      );

      if (settings.link) {
        return (
          <a href={settings.link as string} className="block">
            {imageContent}
          </a>
        );
      }
      return imageContent;
    }

    case 'slide':
      return (
        <div className="relative">
          {typeof settings.image === 'string' && settings.image && (
            <img
              src={settings.image}
              alt={typeof settings.heading === 'string' ? settings.heading : 'Slide'}
              className="w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: ((settings.overlayOpacity as number) || 40) / 100 }}
          />
          <div
            className={`absolute inset-0 flex flex-col justify-center p-8 ${settings.textPosition === 'center' ? 'items-center text-center' : ''} ${settings.textPosition === 'right' ? 'items-end text-right' : 'items-start'}`}
          >
            {typeof settings.heading === 'string' && settings.heading && (
              <h2 className="text-4xl font-bold text-white mb-2">{settings.heading}</h2>
            )}
            {typeof settings.subheading === 'string' && settings.subheading && (
              <p className="text-xl text-white/90 mb-4">{settings.subheading}</p>
            )}
            {typeof settings.buttonText === 'string' && settings.buttonText && (
              <a
                href={typeof settings.buttonLink === 'string' ? settings.buttonLink : '#'}
                className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                {settings.buttonText}
              </a>
            )}
          </div>
        </div>
      );

    case 'feature':
      return (
        <div className="text-center p-6">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme?.primary ? `${theme.primary}20` : '#f3f4f6' }}
          >
            <span className="text-2xl" style={{ color: theme?.primary }}>
              {/* Icon placeholder - could use lucide-react icons */}★
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{(settings.title as string) || 'Feature'}</h3>
          {typeof settings.description === 'string' && settings.description && (
            <p className="text-gray-600 text-sm">{settings.description}</p>
          )}
          {typeof settings.link === 'string' && settings.link && (
            <a
              href={settings.link}
              className="mt-3 inline-block text-sm font-medium hover:underline"
              style={{ color: theme?.primary }}
            >
              Learn more →
            </a>
          )}
        </div>
      );

    case 'testimonial':
      return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Rating */}
          {typeof settings.rating === 'number' && settings.rating > 0 && (
            <div className="flex gap-1 mb-3">
              {Array.from({ length: settings.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ★
                </span>
              ))}
            </div>
          )}
          {/* Quote */}
          <p className="text-gray-700 italic mb-4">"{String(settings.quote || '')}"</p>
          {/* Author */}
          <div className="flex items-center gap-3">
            {typeof settings.avatar === 'string' && settings.avatar && (
              <img
                src={settings.avatar}
                alt={String(settings.author || '')}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{String(settings.author || '')}</p>
              {typeof settings.role === 'string' && settings.role && (
                <p className="text-sm text-gray-500">{settings.role}</p>
              )}
            </div>
          </div>
        </div>
      );

    case 'faq':
      return (
        <details className="group border-b border-gray-200 py-4">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <span className="font-medium text-gray-900">{settings.question as string}</span>
            <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-3 text-gray-600">{settings.answer as string}</p>
        </details>
      );

    default:
      console.warn(`Unknown block type: ${type}`);
      return null;
  }
}

/**
 * BlockRenderer component - renders an array of blocks
 */
export function BlockRenderer({ blocks, className, theme }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {blocks.map((block) => (
        <div key={block.id} className="block-item">
          {renderBlock(block, theme)}
        </div>
      ))}
    </div>
  );
}

/**
 * Export individual block renderer for custom layouts
 */
export { renderBlock };
