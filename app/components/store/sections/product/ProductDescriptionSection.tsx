/**
 * Product Description Section
 * 
 * Displays product description and specifications in tabs or accordion.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface ProductDescriptionSectionProps {
  sectionId: string;
  props: {
    showTabs?: boolean;
    tabs?: string[];
  };
  context: ProductContext;
}

export default function ProductDescriptionSection({ sectionId, props, context }: ProductDescriptionSectionProps) {
  const {
    showTabs = true,
    tabs = ['description', 'specifications', 'shipping'],
  } = props;

  const product = context.product as any;
  const themeColors = context.theme;
  const [activeTab, setActiveTab] = useState(tabs[0]);

  if (!product) return null;

  const tabContent: Record<string, React.ReactNode> = {
    description: (
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
      />
    ),
    specifications: (
      <div className="space-y-2">
        {product.specifications?.length > 0 ? (
          product.specifications.map((spec: { label: string; value: string }, index: number) => (
            <div key={index} className="flex border-b py-2">
              <span className="w-1/3 font-medium text-gray-600">{spec.label}</span>
              <span className="w-2/3">{spec.value}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No specifications available.</p>
        )}
      </div>
    ),
    shipping: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Delivery Options</h4>
          <ul className="space-y-2 text-gray-600">
            <li>🚚 Inside Dhaka: 1-2 business days</li>
            <li>🚛 Outside Dhaka: 3-5 business days</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Return Policy</h4>
          <p className="text-gray-600">
            7 days easy return policy. Product must be unused and in original packaging.
          </p>
        </div>
      </div>
    ),
  };

  const tabLabels: Record<string, string> = {
    description: 'Description',
    specifications: 'Specifications',
    shipping: 'Shipping & Returns',
  };

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {showTabs ? (
          <>
            {/* Tab Headers */}
            <div className="flex border-b overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? 'border-current'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    borderColor: activeTab === tab ? themeColors.accentColor : undefined,
                    color: activeTab === tab ? themeColors.accentColor : undefined,
                  }}
                >
                  {tabLabels[tab] || tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {tabContent[activeTab]}
            </div>
          </>
        ) : (
          // Accordion style
          <div className="space-y-4">
            {tabs.map((tab) => (
              <AccordionItem
                key={tab}
                title={tabLabels[tab] || tab}
                isOpen={activeTab === tab}
                onToggle={() => setActiveTab(activeTab === tab ? '' : tab)}
                themeColors={themeColors}
              >
                {tabContent[tab]}
              </AccordionItem>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
  themeColors,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  themeColors: any;
}) {
  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left font-medium"
        style={{ color: themeColors.textColor }}
      >
        {title}
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
