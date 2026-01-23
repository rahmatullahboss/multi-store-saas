
import type { SectionSettings } from './registry';

interface CollectionHeaderSectionProps {
  settings: SectionSettings;
  collection?: {
    title: string;
    description?: string;
    image?: string;
  };
  theme: any;
}

export function CollectionHeaderSection({ settings, collection, theme }: CollectionHeaderSectionProps) {
  const title = collection?.title || settings.heading || 'Collection';
  const description = collection?.description || settings.subheading;
  
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[settings.alignment || 'center'];

  const primaryColor = settings.textColor || theme.primary || '#000000';
  const backgroundColor = settings.backgroundColor || 'transparent';
  const paddingTop = settings.paddingTop === 'large' ? 'pt-20' : settings.paddingTop === 'medium' ? 'pt-12' : settings.paddingTop === 'small' ? 'pt-8' : 'pt-0';
  const paddingBottom = settings.paddingBottom === 'large' ? 'pb-20' : settings.paddingBottom === 'medium' ? 'pb-12' : settings.paddingBottom === 'small' ? 'pb-8' : 'pb-0';

  return (
    <section 
      className={`w-full ${paddingTop} ${paddingBottom}`}
      style={{ backgroundColor }}
    >
      <div className={`max-w-7xl mx-auto px-4 flex flex-col ${alignmentClass}`}>
        <h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          style={{ color: primaryColor }}
        >
          {title}
        </h1>
        
        {description && (
          <div 
            className="prose prose-lg max-w-3xl"
            style={{ color: theme.muted || '#6b7280' }}
          >
            <p>{description}</p>
          </div>
        )}
      </div>
    </section>
  );
}
