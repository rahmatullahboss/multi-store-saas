import type { StoreTemplateProps } from '~/templates/store-registry';
import { RovoHeader } from './sections/Header';
import { RovoFooter } from './sections/Footer';
import { RovoLayout } from './sections/Layout';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { DEFAULT_SECTIONS } from '~/components/store-sections/registry';

export function RovoTemplate(props: StoreTemplateProps) {
  const sections = props.config?.sections?.length ? props.config.sections : DEFAULT_SECTIONS;
  const filteredCategories = props.categories.filter((c): c is string => c !== null);

  return (
    <RovoLayout {...props}>
      <RovoHeader 
        storeName={props.storeName} 
        logo={props.logo} 
        categories={filteredCategories}
        currentCategory={props.currentCategory || null}
        socialLinks={props.socialLinks}
      />
      
      <main className="min-h-screen">
        {sections.length > 0 ? (
          <SectionRenderer 
            sections={sections} 
            products={props.products}
            categories={filteredCategories}
            storeId={props.storeId}
          />
        ) : (
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
        categories={filteredCategories}
      />
    </RovoLayout>
  );
}
