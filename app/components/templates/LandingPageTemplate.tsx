/**
 * Landing Page Template Dispatcher
 * 
 * This component acts as a high-level wrapper and dispatcher for all isolated landing page templates.
 * it selects the appropriate template component based on the configuration and handles
 * global overlays like custom HTML sections.
 */

import { getTemplateComponent } from '~/templates/registry';
import type { TemplateProps } from '~/templates/registry';
import { CustomSectionRenderer } from './CustomSectionRenderer';

export function LandingPageTemplate(props: TemplateProps) {
  const { config, customSections = [] } = props;
  
  // Safely get the component for the selected template
  let TemplateComponent;
  try {
    TemplateComponent = getTemplateComponent(config.templateId);
  } catch (error) {
    // Fallback if template component could not be found
    console.error(`Template component for ID "${config.templateId}" not found.`, error);
    return (
      <div className="p-20 text-center bg-red-50 text-red-900 border-4 border-dashed border-red-200 rounded-3xl">
        <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Engine Error</h2>
        <p className="font-bold">Template composition failed. Please check your configuration ID: <span className="underline italic">{config.templateId}</span></p>
      </div>
    );
  }

  return (
    <>
      {/* Custom HTML Sections - Rendered before the main content */}
      <CustomSectionRenderer customSections={customSections} position="before-hero" />
      
      {/* The actual isolated template component */}
      <TemplateComponent {...props} />
      
      {/* Custom HTML Sections - Rendered before the footer */}
      <CustomSectionRenderer customSections={customSections} position="before-footer" />
    </>
  );
}

export default LandingPageTemplate;
