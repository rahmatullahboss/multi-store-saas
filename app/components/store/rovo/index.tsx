import type { StoreTemplateProps } from '~/templates/store-registry';
import { RovoHeader } from './RovoHeader';
import { RovoFooter } from './RovoFooter';
import { RovoLayout } from './RovoLayout';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';

export function RovoTemplate(props: StoreTemplateProps) {
  // Use config or defaults
  const sections = props.config?.sections || [];

  return (
    <RovoLayout {...props}>
      <RovoHeader 
        storeName={props.storeName} 
        logo={props.logo} 
        categories={props.categories}
        currentCategory={props.currentCategory}
        socialLinks={props.socialLinks}
      />
      
      <main className="min-h-screen">
        {sections.length > 0 ? (
          // Render configured sections
          sections.map((section: any, index: number) => (
            <SectionRenderer 
              key={section.id || index} 
              section={section} 
              products={props.products}
              categories={props.categories}
              storeId={props.storeId}
            />
          ))
        ) : (
          // Default empty state or placeholder
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold">Welcome to {props.storeName}</h2>
            <p className="text-gray-500 mt-2">Configure your sections in the editor.</p>
          </div>
        )}
      </main>

      <RovoFooter 
        storeName={props.storeName}
        logo={props.logo}
        businessInfo={props.businessInfo}
        socialLinks={props.socialLinks}
        categories={props.categories}
      />
    </RovoLayout>
  );
}
