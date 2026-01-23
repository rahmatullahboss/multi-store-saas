import type { StoreTemplateProps } from '~/templates/store-registry';
import { SokolHeader } from './sections/Header';
import { SokolFooter } from './sections/Footer';
import { SokolLayout } from './sections/Layout';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { SOKOL_DEFAULT_SECTIONS, SOKOL_DUMMY_PRODUCTS, SOKOL_DUMMY_CATEGORIES } from './theme';

export function SokolTemplate(props: StoreTemplateProps) {
  // Use config sections if available, otherwise use default sections
  const sections = props.config?.sections?.length 
    ? props.config.sections 
    : SOKOL_DEFAULT_SECTIONS;

  // Use provided products/categories or fallback to dummy data for preview
  const products = props.products?.length ? props.products : SOKOL_DUMMY_PRODUCTS;
  const categories = props.categories?.filter((c): c is string => c !== null);
  const displayCategories = categories?.length ? categories : SOKOL_DUMMY_CATEGORIES;

  return (
    <SokolLayout {...props}>
      <SokolHeader 
        storeName={props.storeName} 
        logo={props.logo} 
        categories={displayCategories}
        currentCategory={props.currentCategory || null}
        socialLinks={props.socialLinks}
        isPreview={props.isPreview}
      />
      
      <main className="min-h-screen">
        <SectionRenderer 
          sections={sections} 
          products={products}
          categories={displayCategories}
          storeId={props.storeId}
          currency={props.currency}
        />
      </main>

      <SokolFooter 
        storeName={props.storeName}
        logo={props.logo}
        businessInfo={props.businessInfo}
        socialLinks={props.socialLinks}
        categories={displayCategories}
      />
    </SokolLayout>
  );
}
