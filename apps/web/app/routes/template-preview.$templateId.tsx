/**
 * Template Builder - Live Preview Route
 * 
 * /template-preview/:templateId
 * 
 * Renders template sections in an iframe for the template builder.
 * Uses the same section components as the storefront for accurate preview.
 * Listens for postMessage updates for real-time editing.
 */

import { json } from '~/lib/rr7-compat';
import { useLoaderData } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { 
  themeTemplates, 
  templateSectionsDraft, 
  themeSettingsDraft,
  themes,
  products,
} from '@db/schema';
import { requireAuth } from '~/lib/auth.server';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateSection {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

interface ThemeSettings {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  headerStyle?: string;
  footerStyle?: string;
  borderRadius?: string;
}

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { templateId } = params;
  
  if (!templateId) {
    throw new Response('Missing template ID', { status: 400 });
  }
  
  // Auth check (preview is only for logged-in users editing)
  const { store } = await requireAuth(request, context);
  
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const db = context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);
  
  // Get template
  const [template] = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(and(
      eq(themeTemplates.id, templateId),
      eq(themeTemplates.shopId, store.id)
    ));
  
  if (!template) {
    throw new Response('Template not found', { status: 404 });
  }
  
  // Get draft sections
  const sectionsRaw = await drizzleDb
    .select()
    .from(templateSectionsDraft)
    .where(eq(templateSectionsDraft.templateId, templateId))
    .orderBy(asc(templateSectionsDraft.sortOrder));
  
  // Convert to SectionRenderer format (type -> settings)
  const sections: TemplateSection[] = sectionsRaw
    .filter(s => s.enabled)
    .map(s => ({
      id: s.id,
      type: s.type,
      settings: JSON.parse(s.propsJson || '{}'),
    }));
  
  // Get theme settings
  const [settingsRow] = await drizzleDb
    .select()
    .from(themeSettingsDraft)
    .where(eq(themeSettingsDraft.themeId, template.themeId));
  
  let themeSettings: ThemeSettings = {};
  try {
    themeSettings = settingsRow?.settingsJson ? JSON.parse(settingsRow.settingsJson) : {};
  } catch {
    themeSettings = {};
  }
  
  // Get theme info
  const [theme] = await drizzleDb
    .select()
    .from(themes)
    .where(eq(themes.id, template.themeId));
  
  // Get sample data for preview based on template type
  type SampleProduct = {
    id: number;
    title: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    imageUrl: string | null;
    description: string | null;
  };
  let sampleProducts: SampleProduct[] = [];
  let sampleCategories: string[] = [];
  let sampleProduct: SampleProduct | null = null;
  
  // Fetch products for product-related sections
  const rawProducts = await drizzleDb
    .select()
    .from(products)
    .where(eq(products.storeId, store.id))
    .limit(12);
  
  sampleProducts = rawProducts.map(p => {
    let images: string[] = [];
    try {
      images = p.images ? JSON.parse(p.images as string) : [];
    } catch {
      images = p.imageUrl ? [p.imageUrl] : [];
    }
    
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images,
      imageUrl: p.imageUrl,
      description: p.description,
    };
  });
  
  // Use first product as sample for product template
  if (template.templateKey === 'product' && sampleProducts.length > 0) {
    sampleProduct = sampleProducts[0];
  }
  
  // Categories can be derived from products or use a placeholder
  sampleCategories = ['Electronics', 'Clothing', 'Home & Garden'];
  
  return json({
    template: {
      id: template.id,
      templateKey: template.templateKey,
      title: template.title,
    },
    sections,
    themeSettings,
    themeName: theme?.name || 'Default Theme',
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      logo: store.logo,
      currency: 'BDT',
    },
    // Sample data for preview
    products: sampleProducts,
    categories: sampleCategories,
    product: sampleProduct,
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TemplatePreviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [liveSections, setLiveSections] = useState(loaderData.sections);
  const [liveSettings, setLiveSettings] = useState(loaderData.themeSettings);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  // Listen for live updates from parent window (template builder)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Section updates from template builder
      if (event.data?.type === 'TEMPLATE_UPDATE' && event.data.sections) {
        // Convert from builder format (props) to renderer format (settings)
        interface BuilderSection {
          id: string;
          type: string;
          props?: Record<string, unknown>;
          settings?: Record<string, unknown>;
        }
        const convertedSections = event.data.sections.map((s: BuilderSection) => ({
          id: s.id,
          type: s.type,
          settings: s.props || s.settings || {},
        }));
        setLiveSections(convertedSections);
      }
      
      // Theme settings updates
      if (event.data?.type === 'THEME_SETTINGS_UPDATE' && event.data.themeSettings) {
        setLiveSettings(prev => ({
          ...prev,
          ...event.data.themeSettings,
        }));
      }
      
      // Section selection (for highlighting)
      if (event.data?.type === 'SELECT_SECTION') {
        setSelectedSectionId(event.data.sectionId || null);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Update from loader when navigating/refreshing
  useEffect(() => {
    setLiveSections(loaderData.sections);
  }, [loaderData.sections]);
  
  useEffect(() => {
    setLiveSettings(loaderData.themeSettings);
  }, [loaderData.themeSettings]);
  
  // Build theme object for section components
  const theme = useMemo(() => ({
    primaryColor: liveSettings.primaryColor || '#000000',
    accentColor: liveSettings.accentColor || '#6366F1',
    backgroundColor: liveSettings.backgroundColor || '#FFFFFF',
    textColor: liveSettings.textColor || '#1F2937',
    headingFont: liveSettings.headingFont || 'Inter',
    bodyFont: liveSettings.bodyFont || 'Inter',
    headerStyle: liveSettings.headerStyle || 'solid',
    footerStyle: liveSettings.footerStyle || 'minimal',
    borderRadius: liveSettings.borderRadius || '8px',
  }), [liveSettings]);
  
  // CSS variables for theme
  const themeStyle: React.CSSProperties = {
    '--theme-primary': theme.primaryColor,
    '--theme-accent': theme.accentColor,
    '--theme-background': theme.backgroundColor,
    '--theme-text': theme.textColor,
    '--theme-heading-font': theme.headingFont,
    '--theme-body-font': theme.bodyFont,
    '--theme-radius': theme.borderRadius,
  } as React.CSSProperties;
  
  // Handle section click to notify parent
  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    // Notify parent window
    window.parent.postMessage({
      type: 'SECTION_SELECTED',
      sectionId,
    }, '*');
  };
  
  return (
    <div 
      className="min-h-screen"
      style={{
        ...themeStyle,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: `${theme.bodyFont}, sans-serif`,
      }}
    >
      {/* Render sections with click-to-select */}
      {liveSections.map((section) => (
        <div
          key={section.id}
          onClick={() => handleSectionClick(section.id)}
          className={`
            relative cursor-pointer transition-all
            ${selectedSectionId === section.id 
              ? 'ring-2 ring-indigo-500 ring-inset' 
              : 'hover:ring-2 hover:ring-indigo-300 hover:ring-inset'
            }
          `}
        >
          {/* Section label on hover/select */}
          <div 
            className={`
              absolute top-2 left-2 z-20 px-2 py-1 text-xs font-medium rounded
              transition-opacity pointer-events-none
              ${selectedSectionId === section.id 
                ? 'bg-indigo-500 text-white opacity-100' 
                : 'bg-gray-800/80 text-white opacity-0 hover:opacity-100'
              }
            `}
          >
            {SECTION_REGISTRY[section.type]?.name || section.type}
          </div>
          
          {/* Render actual section component */}
          <SectionRenderer
            sections={[section]}
            theme={theme}
            storeId={loaderData.store.id}
            products={loaderData.products}
            categories={loaderData.categories}
            product={loaderData.product}
            storeName={loaderData.store.name}
            currency={loaderData.store.currency}
            logo={loaderData.store.logo || undefined}
          />
        </div>
      ))}
      
      {/* Empty state */}
      {liveSections.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px] text-gray-400">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-500">No sections yet</p>
            <p className="text-sm text-gray-400 mt-1">Add sections from the sidebar to start building</p>
          </div>
        </div>
      )}
      
      {/* Preview mode indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Preview Mode
        </div>
      </div>
    </div>
  );
}
