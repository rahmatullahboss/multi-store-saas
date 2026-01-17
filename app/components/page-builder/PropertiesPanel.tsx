/**
 * Page Builder v2 - Properties Panel
 * 
 * Dynamic form for editing section props based on section type.
 */

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { X, Plus, Trash2, Loader2, Link2 } from 'lucide-react';
import ButtonConnectorModal, { type ButtonConnection } from './ButtonConnectorModal';
import { countConnectedButtons, applyButtonConnections } from '~/lib/page-builder/buttonConnectionUtils';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';
import { BuilderImageUpload } from './BuilderImageUpload';
import { ColorPickerField } from './ColorPickerField';
import { FONT_FAMILIES } from '~/lib/page-builder/schemas';

// Lazy load Monaco Editor (client-side only)
const LazyMonacoEditor = lazy(() => import('./CodeEditor'));

function MonacoEditor({ value, onChange, language }: { value: string; onChange: (v: string) => void; language: string }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-gray-400 text-xs">
        <Loader2 className="animate-spin mr-2 h-4 w-4" />
        Loading editor...
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-gray-400 text-xs">
        <Loader2 className="animate-spin mr-2 h-4 w-4" />
        Loading VS Code Engine...
      </div>
    }>
      <LazyMonacoEditor
        value={value}
        onChange={(v) => onChange(v || '')}
        language={language}
      />
    </Suspense>
  );
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  bundlePricing?: Array<{ qty: number; price: number; label: string; savings?: number }>;
}

interface PropertiesPanelProps {
  section: BuilderSection;
  onUpdate: (props: Record<string, unknown>) => void;
  onClose: () => void;
  products?: Product[];
  onProductChange?: (product: Product | null) => void;
}

export function PropertiesPanel({ section, onUpdate, onClose, products = [], onProductChange }: PropertiesPanelProps) {
  const [localProps, setLocalProps] = useState<Record<string, unknown>>(section.props);
  const meta = getSectionMeta(section.type);
  
  // Reset local props when section changes
  useEffect(() => {
    setLocalProps(section.props);
  }, [section.id, section.props]);
  
  // Debounced update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localProps) !== JSON.stringify(section.props)) {
        onUpdate(localProps);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localProps, section.props, onUpdate]);
  
  // Update a single prop
  const updateProp = (key: string, value: unknown) => {
    setLocalProps(prev => ({ ...prev, [key]: value }));
  };
  
  // Update an array item
  const updateArrayItem = (key: string, index: number, value: unknown) => {
    const arr = (localProps[key] as unknown[]) || [];
    const newArr = [...arr];
    newArr[index] = value;
    updateProp(key, newArr);
  };
  
  // Add array item
  const addArrayItem = (key: string, template: unknown) => {
    const arr = (localProps[key] as unknown[]) || [];
    updateProp(key, [...arr, template]);
  };
  
  // Remove array item
  const removeArrayItem = (key: string, index: number) => {
    const arr = (localProps[key] as unknown[]) || [];
    updateProp(key, arr.filter((_, i) => i !== index));
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{meta?.name || section.type}</h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Dynamic Form */}
      <div className="space-y-4">
        {renderPropsForm(section.type, localProps, updateProp, updateArrayItem, addArrayItem, removeArrayItem, products, onProductChange)}
      </div>
      
      {/* Section Styling Panel */}
      <SectionStylePanel props={localProps} updateProp={updateProp} />
    </div>
  );
}

// Render form fields based on section type
function renderPropsForm(
  type: string,
  props: Record<string, unknown>,
  updateProp: (key: string, value: unknown) => void,
  updateArrayItem: (key: string, index: number, value: unknown) => void,
  addArrayItem: (key: string, template: unknown) => void,
  removeArrayItem: (key: string, index: number) => void,
  products: Product[] = [],
  onProductChange?: (product: Product | null) => void
) {
  switch (type) {
    case 'hero':
      return (
        <>
          <TextField 
            label="Headline" 
            value={props.headline as string || ''} 
            onChange={(v) => updateProp('headline', v)} 
          />
          <TextField 
            label="Subheadline" 
            value={props.subheadline as string || ''} 
            onChange={(v) => updateProp('subheadline', v)} 
          />
          <TextField 
            label="CTA Button Text" 
            value={props.ctaText as string || ''} 
            onChange={(v) => updateProp('ctaText', v)} 
          />
          <TextField 
            label="Badge Text" 
            value={props.badgeText as string || ''} 
            onChange={(v) => updateProp('badgeText', v)} 
          />
          <ImageField 
            label="Background Image" 
            value={props.backgroundImage as string || ''} 
            onChange={(v) => updateProp('backgroundImage', v)} 
          />
        </>
      );
    
    case 'features':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="Features"
            items={(props.features as Array<{ icon: string; title: string; description: string }>) || []}
            onAdd={() => addArrayItem('features', { icon: '✓', title: '', description: '' })}
            onRemove={(i) => removeArrayItem('features', i)}
            renderItem={(item, index) => (
              <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                <TextField 
                  label="Icon" 
                  value={item.icon || ''} 
                  onChange={(v) => updateArrayItem('features', index, { ...item, icon: v })} 
                />
                <TextField 
                  label="Title" 
                  value={item.title || ''} 
                  onChange={(v) => updateArrayItem('features', index, { ...item, title: v })} 
                />
                <TextField 
                  label="Description" 
                  value={item.description || ''} 
                  onChange={(v) => updateArrayItem('features', index, { ...item, description: v })} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'faq':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="FAQ Items"
            items={(props.items as Array<{ question: string; answer: string }>) || []}
            onAdd={() => addArrayItem('items', { question: '', answer: '' })}
            onRemove={(i) => removeArrayItem('items', i)}
            renderItem={(item, index) => (
              <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                <TextField 
                  label="Question" 
                  value={item.question || ''} 
                  onChange={(v) => updateArrayItem('items', index, { ...item, question: v })} 
                />
                <TextAreaField 
                  label="Answer" 
                  value={item.answer || ''} 
                  onChange={(v) => updateArrayItem('items', index, { ...item, answer: v })} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'testimonials':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="Testimonials"
            items={(props.testimonials as Array<{ name: string; text?: string; imageUrl?: string }>) || []}
            onAdd={() => addArrayItem('testimonials', { name: '', text: '', imageUrl: '' })}
            onRemove={(i) => removeArrayItem('testimonials', i)}
            renderItem={(item, index) => (
              <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                <TextField 
                  label="Name" 
                  value={item.name || ''} 
                  onChange={(v) => updateArrayItem('testimonials', index, { ...item, name: v })} 
                />
                <TextAreaField 
                  label="Review" 
                  value={item.text || ''} 
                  onChange={(v) => updateArrayItem('testimonials', index, { ...item, text: v })} 
                />
                <ImageField 
                  label="Photo" 
                  value={item.imageUrl || ''} 
                  onChange={(v) => updateArrayItem('testimonials', index, { ...item, imageUrl: v })} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'trust-badges':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="Badges"
            items={(props.badges as Array<{ icon: string; text: string }>) || []}
            onAdd={() => addArrayItem('badges', { icon: '✓', text: '' })}
            onRemove={(i) => removeArrayItem('badges', i)}
            renderItem={(item, index) => (
              <div key={index} className="flex gap-2 p-2 bg-gray-50 rounded">
                <TextField 
                  label="Icon" 
                  value={item.icon || ''} 
                  onChange={(v) => updateArrayItem('badges', index, { ...item, icon: v })} 
                  className="w-20"
                />
                <TextField 
                  label="Text" 
                  value={item.text || ''} 
                  onChange={(v) => updateArrayItem('badges', index, { ...item, text: v })} 
                  className="flex-1"
                />
              </div>
            )}
          />
        </>
      );
    
    case 'cta':
      const variants = (props.variants as Array<{ id: string; name: string; price?: number }>) || [];
      const selectedProductId = props.productId as number | undefined;
      const selectedProduct = products.find(p => p.id === selectedProductId);
      
      // Auto-select first product if none selected and products available
      if (!selectedProductId && products.length > 0) {
        const firstProduct = products[0];
        // Trigger auto-selection with a small delay to let state update
        setTimeout(() => {
          updateProp('productId', firstProduct.id);
          updateProp('productPrice', firstProduct.price);
          updateProp('discountedPrice', firstProduct.price);
          if (firstProduct.bundlePricing && firstProduct.bundlePricing.length > 0) {
            const variantsData = firstProduct.bundlePricing.map((tier, idx) => ({
              id: String(idx + 1),
              name: tier.label,
              price: tier.price,
            }));
            updateProp('variants', variantsData);
          }
          onProductChange?.(firstProduct);
        }, 100);
      }
      
      // Handler for product selection - auto-fills pricing and variants
      const handleProductSelect = (productId: number | null) => {
        if (productId === null) {
          updateProp('productId', null);
          onProductChange?.(null); // Notify for real-time preview
          return;
        }
        const product = products.find(p => p.id === productId);
        if (product) {
          updateProp('productId', product.id);
          updateProp('productPrice', product.price);
          updateProp('discountedPrice', product.price); // Can adjust for discount later
          
          // Convert bundlePricing to variants format for CTASectionPreview
          if (product.bundlePricing && product.bundlePricing.length > 0) {
            const variants = product.bundlePricing.map((tier, idx) => ({
              id: String(idx + 1),
              name: tier.label,
              price: tier.price,
            }));
            updateProp('variants', variants);
          } else {
            // No bundle pricing - hide variant selector by setting empty array
            updateProp('variants', []);
          }
          
          // Notify for real-time preview
          onProductChange?.(product);
        }
      };
      
      return (
        <>
          {/* Product Selection */}
          {products.length > 0 && (
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🛍️ প্রোডাক্ট সিলেক্ট</h5>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Store থেকে প্রোডাক্ট বাছুন</label>
                <select
                  value={selectedProductId || ''}
                  onChange={(e) => handleProductSelect(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- প্রোডাক্ট সিলেক্ট করুন --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ৳{p.price}
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                    ✓ {selectedProduct.name} সিলেক্ট করা হয়েছে (৳{selectedProduct.price})
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Template Variation Selector */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎨 টেমপ্লেট স্টাইল</h5>
            <select
              value={(props.template as string) || 'minimal'}
              onChange={(e) => updateProp('template', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="minimal">Minimal (সাধারণ)</option>
              <option value="premium">Premium (প্রিমিয়াম)</option>
              <option value="urgent">Urgent (জরুরি/Flash Sale)</option>
              <option value="singleColumn">Single Column (মোবাইল অপ্টিমাইজড)</option>
              <option value="withImage">With Product Image (ছবি সহ)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">অর্ডার ফর্মের ডিজাইন নির্বাচন করুন</p>
          </div>
          
          {/* Basic Info */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">হেডলাইন</h5>
            <TextField 
              label="Headline" 
              value={props.headline as string || ''} 
              onChange={(v) => updateProp('headline', v)} 
            />
            <div className="mt-2">
              <TextField 
                label="Subheadline" 
                value={props.subheadline as string || ''} 
                onChange={(v) => updateProp('subheadline', v)} 
              />
            </div>
            <div className="mt-2">
              <TextField 
                label="Button Text" 
                value={props.buttonText as string || ''} 
                onChange={(v) => updateProp('buttonText', v)} 
              />
            </div>
          </div>
          
          {/* Pricing */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">💰 মূল্য সেটিংস</h5>
            {selectedProduct ? (
              <>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">মূল্য:</span>
                    <span className="font-bold text-indigo-700">৳{selectedProduct.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * প্রোডাক্ট সেটিংস থেকে দাম পরিবর্তন করুন
                  </p>
                </div>
                
                {/* Bundle Tiers Display */}
                {selectedProduct.bundlePricing && selectedProduct.bundlePricing.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">📦 কম্বো অপশন:</p>
                    <div className="space-y-1">
                      {selectedProduct.bundlePricing.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <span className="font-medium text-amber-800">{tier.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-900">৳{tier.price}</span>
                            {tier.savings && tier.savings > 0 && (
                              <span className="text-green-600 text-[10px] bg-green-100 px-1 rounded">
                                সেভ ৳{tier.savings}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-xs text-amber-700">
                  ⚠️ উপরে থেকে প্রোডাক্ট সিলেক্ট করুন
                </p>
              </div>
            )}
          </div>
          
          {/* Delivery Charges */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🚚 ডেলিভারি চার্জ</h5>
            <div className="grid grid-cols-2 gap-2">
              <NumberField 
                label="ঢাকার ভিতরে (৳)" 
                value={props.insideDhakaCharge as number || 60} 
                onChange={(v) => updateProp('insideDhakaCharge', v)} 
              />
              <NumberField 
                label="ঢাকার বাইরে (৳)" 
                value={props.outsideDhakaCharge as number || 120} 
                onChange={(v) => updateProp('outsideDhakaCharge', v)} 
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Combo pricing প্রোডাক্ট সেটিংস থেকে configure করুন
            </p>
          </div>
          
          {/* BD Address System */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📍 ঠিকানা সিস্টেম</h5>
            
            {/* Shipping Zone Mode */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">শিপিং জোন মোড</label>
              <select
                value={(props.shippingZoneMode as string) || 'auto'}
                onChange={(e) => updateProp('shippingZoneMode', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="auto">🔄 Auto (জেলা থেকে ক্যালকুলেট)</option>
                <option value="manual">✋ Manual (ঢাকা/বাইরে বাটন)</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {(props.shippingZoneMode as string) === 'manual' 
                  ? 'কাস্টমার ঢাকা/বাইরে বাটন সিলেক্ট করবে'
                  : 'জেলা সিলেক্ট করলে অটো শিপিং চার্জ বসবে'
                }
              </p>
            </div>
            
            {/* Show District/Upazila Toggles - Only visible in auto mode */}
            {(props.shippingZoneMode as string) !== 'manual' && (
              <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg">
                <ToggleField
                  label="জেলা ফিল্ড দেখাবে"
                  value={props.showDistrictField as boolean ?? true}
                  onChange={(v) => updateProp('showDistrictField', v)}
                />
                <ToggleField
                  label="উপজেলা/থানা ফিল্ড দেখাবে"
                  value={props.showUpazilaField as boolean ?? true}
                  onChange={(v) => updateProp('showUpazilaField', v)}
                />
              </div>
            )}
            
            {/* Address Labels */}
            <div className="space-y-2 mt-3">
              <TextField 
                label="জেলা লেবেল" 
                value={props.districtLabel as string || 'জেলা'} 
                onChange={(v) => updateProp('districtLabel', v)} 
              />
              <TextField 
                label="উপজেলা লেবেল" 
                value={props.upazilaLabel as string || 'উপজেলা/থানা'} 
                onChange={(v) => updateProp('upazilaLabel', v)} 
              />
              <TextField 
                label="ঠিকানা লেবেল" 
                value={props.addressLabel as string || 'বিস্তারিত ঠিকানা'} 
                onChange={(v) => updateProp('addressLabel', v)} 
              />
            </div>
          </div>
          
          {/* Simplified Field Builder */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📝 ফর্ম ফিল্ড সেটিংস</h5>
            
            {/* Core Fields (always visible) */}
            <div className="p-3 bg-gray-50 rounded-lg mb-3">
              <p className="text-xs text-gray-500 mb-2">✓ ডিফল্ট ফিল্ড (সবসময় দেখাবে)</p>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">নাম</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">ফোন</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">জেলা</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">ঠিকানা</span>
              </div>
            </div>
            
            {/* Optional Fields Toggle */}
            <div className="space-y-2">
              <ToggleField
                label="📧 ইমেইল ফিল্ড দেখাবে"
                value={props.showEmailField as boolean ?? false}
                onChange={(v) => updateProp('showEmailField', v)}
              />
              <ToggleField
                label="📱 বিকল্প ফোন দেখাবে"
                value={props.showAltPhoneField as boolean ?? false}
                onChange={(v) => updateProp('showAltPhoneField', v)}
              />
              <ToggleField
                label="📝 অর্ডার নোট দেখাবে"
                value={props.showNoteField as boolean ?? true}
                onChange={(v) => updateProp('showNoteField', v)}
              />
            </div>
            
            {/* Custom Labels (expandable) */}
            <details className="mt-3">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                ⚙️ ফিল্ড লেবেল কাস্টমাইজ
              </summary>
              <div className="space-y-2 mt-2 pl-2 border-l-2 border-gray-200">
                <TextField 
                  label="নাম Placeholder" 
                  value={props.namePlaceholder as string || 'আপনার নাম লিখুন'} 
                  onChange={(v) => updateProp('namePlaceholder', v)} 
                />
                {(props.showEmailField as boolean) && (
                  <TextField 
                    label="ইমেইল Placeholder" 
                    value={props.emailPlaceholder as string || 'আপনার ইমেইল (ঐচ্ছিক)'} 
                    onChange={(v) => updateProp('emailPlaceholder', v)} 
                  />
                )}
                {(props.showAltPhoneField as boolean) && (
                  <TextField 
                    label="বিকল্প ফোন Placeholder" 
                    value={props.altPhonePlaceholder as string || 'বিকল্প মোবাইল নম্বর'} 
                    onChange={(v) => updateProp('altPhonePlaceholder', v)} 
                  />
                )}
                {(props.showNoteField as boolean ?? true) && (
                  <>
                    <TextField 
                      label="নোট লেবেল" 
                      value={props.noteLabel as string || 'অর্ডার নোট'} 
                      onChange={(v) => updateProp('noteLabel', v)} 
                    />
                    <TextField 
                      label="নোট Placeholder" 
                      value={props.notePlaceholder as string || 'অতিরিক্ত তথ্য/নির্দেশনা (ঐচ্ছিক)'} 
                      onChange={(v) => updateProp('notePlaceholder', v)} 
                    />
                  </>
                )}
              </div>
            </details>
          </div>
          {/* Labels */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏷️ লেবেল কাস্টমাইজ</h5>
            <div className="space-y-2">
              <TextField 
                label="ঢাকার ভিতরে লেবেল" 
                value={props.insideDhakaLabel as string || 'ঢাকার ভিতরে'} 
                onChange={(v) => updateProp('insideDhakaLabel', v)} 
              />
              <TextField 
                label="ঢাকার বাইরে লেবেল" 
                value={props.outsideDhakaLabel as string || 'ঢাকার বাইরে'} 
                onChange={(v) => updateProp('outsideDhakaLabel', v)} 
              />
              <TextField 
                label="সর্বমোট লেবেল" 
                value={props.totalLabel as string || 'সর্বমোট'} 
                onChange={(v) => updateProp('totalLabel', v)} 
              />
            </div>
          </div>
          
          {/* Trust Badges */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🛡️ ট্রাস্ট ব্যাজ</h5>
            <ToggleField
              label="Show Trust Badges"
              value={props.showTrustBadges as boolean ?? true}
              onChange={(v) => updateProp('showTrustBadges', v)}
            />
            {(props.showTrustBadges ?? true) && (
              <div className="space-y-2 mt-2">
                <TextField 
                  label="COD Label" 
                  value={props.codLabel as string || 'ক্যাশ অন ডেলিভারি'} 
                  onChange={(v) => updateProp('codLabel', v)} 
                />
                <TextField 
                  label="Secure Label" 
                  value={props.secureLabel as string || '১০০% সিকিউর অর্ডার'} 
                  onChange={(v) => updateProp('secureLabel', v)} 
                />
              </div>
            )}
          </div>
        </>
      );
    
    case 'video':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <TextField 
            label="Video URL (YouTube/Vimeo)" 
            value={props.videoUrl as string || ''} 
            onChange={(v) => updateProp('videoUrl', v)} 
          />
          <ImageField 
            label="Thumbnail" 
            value={props.thumbnailUrl as string || ''} 
            onChange={(v) => updateProp('thumbnailUrl', v)} 
          />
        </>
      );
    
    case 'guarantee':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <TextAreaField 
            label="Guarantee Text" 
            value={props.text as string || ''} 
            onChange={(v) => updateProp('text', v)} 
          />
          <TextField 
            label="Badge Label" 
            value={props.badgeLabel as string || ''} 
            onChange={(v) => updateProp('badgeLabel', v)} 
          />
        </>
      );
    
    case 'gallery':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="Images"
            items={(props.images as string[]) || []}
            onAdd={() => addArrayItem('images', '')}
            onRemove={(i) => removeArrayItem('images', i)}
            renderItem={(item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <ImageField 
                  label={`Image ${index + 1}`} 
                  value={item || ''} 
                  onChange={(v) => updateArrayItem('images', index, v)} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'benefits':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="Benefits"
            items={(props.benefits as Array<{ icon: string; title: string; description: string }>) || []}
            onAdd={() => addArrayItem('benefits', { icon: '💎', title: '', description: '' })}
            onRemove={(i) => removeArrayItem('benefits', i)}
            renderItem={(item, index) => (
              <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                <TextField 
                  label="Icon" 
                  value={item.icon || ''} 
                  onChange={(v) => updateArrayItem('benefits', index, { ...item, icon: v })} 
                />
                <TextField 
                  label="Title" 
                  value={item.title || ''} 
                  onChange={(v) => updateArrayItem('benefits', index, { ...item, title: v })} 
                />
                <TextField 
                  label="Description" 
                  value={item.description || ''} 
                  onChange={(v) => updateArrayItem('benefits', index, { ...item, description: v })} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'comparison':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Before</h5>
            <ImageField 
              label="Before Image" 
              value={props.beforeImage as string || ''} 
              onChange={(v) => updateProp('beforeImage', v)} 
            />
            <TextField 
              label="Before Label" 
              value={props.beforeLabel as string || 'আগে'} 
              onChange={(v) => updateProp('beforeLabel', v)} 
            />
          </div>
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">After</h5>
            <ImageField 
              label="After Image" 
              value={props.afterImage as string || ''} 
              onChange={(v) => updateProp('afterImage', v)} 
            />
            <TextField 
              label="After Label" 
              value={props.afterLabel as string || 'পরে'} 
              onChange={(v) => updateProp('afterLabel', v)} 
            />
          </div>
          <TextAreaField 
            label="Description" 
            value={props.description as string || ''} 
            onChange={(v) => updateProp('description', v)} 
          />
        </>
      );
    
    case 'delivery':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <TextAreaField 
            label="Description" 
            value={props.description as string || ''} 
            onChange={(v) => updateProp('description', v)} 
          />
          <ArrayField
            label="Delivery Areas"
            items={(props.areas as string[]) || []}
            onAdd={() => addArrayItem('areas', '')}
            onRemove={(i) => removeArrayItem('areas', i)}
            renderItem={(item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <TextField 
                  label={`Area ${index + 1}`} 
                  value={item || ''} 
                  onChange={(v) => updateArrayItem('areas', index, v)} 
                />
              </div>
            )}
          />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <NumberField 
              label="ঢাকার ভিতরে (৳)" 
              value={props.insideDhakaPrice as number || 60} 
              onChange={(v) => updateProp('insideDhakaPrice', v)} 
            />
            <NumberField 
              label="ঢাকার বাইরে (৳)" 
              value={props.outsideDhakaPrice as number || 120} 
              onChange={(v) => updateProp('outsideDhakaPrice', v)} 
            />
          </div>
        </>
      );
    
    case 'problem-solution':
      return (
        <>
          <div className="border-b border-gray-100 pb-3 mb-3">
            <TextField 
              label="Problems Title" 
              value={props.beforeTitle as string || 'সমস্যা'} 
              onChange={(v) => updateProp('beforeTitle', v)} 
            />
            <ArrayField
              label="Problems"
              items={(props.problems as string[]) || []}
              onAdd={() => addArrayItem('problems', '')}
              onRemove={(i) => removeArrayItem('problems', i)}
              renderItem={(item, index) => (
                <div key={index} className="p-2 bg-red-50 rounded">
                  <TextField 
                    label={`Problem ${index + 1}`} 
                    value={item || ''} 
                    onChange={(v) => updateArrayItem('problems', index, v)} 
                  />
                </div>
              )}
            />
          </div>
          <div>
            <TextField 
              label="Solutions Title" 
              value={props.afterTitle as string || 'সমাধান'} 
              onChange={(v) => updateProp('afterTitle', v)} 
            />
            <ArrayField
              label="Solutions"
              items={(props.solutions as string[]) || []}
              onAdd={() => addArrayItem('solutions', '')}
              onRemove={(i) => removeArrayItem('solutions', i)}
              renderItem={(item, index) => (
                <div key={index} className="p-2 bg-green-50 rounded">
                  <TextField 
                    label={`Solution ${index + 1}`} 
                    value={item || ''} 
                    onChange={(v) => updateArrayItem('solutions', index, v)} 
                  />
                </div>
              )}
            />
          </div>
        </>
      );
    
    case 'pricing':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <TextField 
            label="Button Text" 
            value={props.buttonText as string || 'অর্ডার করুন'} 
            onChange={(v) => updateProp('buttonText', v)} 
          />
          <ArrayField
            label="Features"
            items={(props.features as string[]) || []}
            onAdd={() => addArrayItem('features', '')}
            onRemove={(i) => removeArrayItem('features', i)}
            renderItem={(item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <TextField 
                  label={`Feature ${index + 1}`} 
                  value={item || ''} 
                  onChange={(v) => updateArrayItem('features', index, v)} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'how-to-order':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ArrayField
            label="Steps"
            items={(props.steps as Array<{ title: string; description: string }>) || []}
            onAdd={() => addArrayItem('steps', { title: '', description: '' })}
            onRemove={(i) => removeArrayItem('steps', i)}
            renderItem={(item, index) => (
              <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">Step {index + 1}</span>
                </div>
                <TextField 
                  label="Title" 
                  value={item.title || ''} 
                  onChange={(v) => updateArrayItem('steps', index, { ...item, title: v })} 
                />
                <TextField 
                  label="Description" 
                  value={item.description || ''} 
                  onChange={(v) => updateArrayItem('steps', index, { ...item, description: v })} 
                />
              </div>
            )}
          />
        </>
      );
    
    case 'showcase':
      return (
        <>
          <TextField 
            label="Title" 
            value={props.title as string || ''} 
            onChange={(v) => updateProp('title', v)} 
          />
          <ImageField 
            label="Product Image" 
            value={props.image as string || ''} 
            onChange={(v) => updateProp('image', v)} 
          />
          <ArrayField
            label="Features"
            items={(props.features as string[]) || []}
            onAdd={() => addArrayItem('features', '')}
            onRemove={(i) => removeArrayItem('features', i)}
            renderItem={(item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <TextField 
                  label={`Feature ${index + 1}`} 
                  value={item || ''} 
                  onChange={(v) => updateArrayItem('features', index, v)} 
                />
            </div>
            )}
          />
        </>
      );
    
    case 'custom-html':
      const htmlContent = props.htmlContent as string || '';
      const connectedCount = countConnectedButtons(htmlContent);
      
      return (
        <CustomHtmlPanel
          props={props}
          updateProp={updateProp}
          connectedCount={connectedCount}
          products={products}
        />
      );
    
    case 'order-button':
      return (
        <>
          {/* Text Settings */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📝 টেক্সট</h5>
            <TextField 
              label="Button Text" 
              value={props.text as string || 'এখনই অর্ডার করুন'} 
              onChange={(v) => updateProp('text', v)} 
            />
            <TextField 
              label="Subtext (Optional)" 
              value={props.subtext as string || ''} 
              onChange={(v) => updateProp('subtext', v)} 
            />
          </div>
          
          {/* Color Settings - THE FIX */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎨 রঙ</h5>
            <ColorPickerField 
              label="Button Background Color" 
              value={props.bgColor as string || '#6366F1'} 
              onChange={(v) => updateProp('bgColor', v)} 
              showGradients={true}
            />
            <ColorPickerField 
              label="Text Color" 
              value={props.textColor as string || '#FFFFFF'} 
              onChange={(v) => updateProp('textColor', v)} 
            />
          </div>
          
          {/* Size & Layout */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📐 সাইজ ও লেআউট</h5>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Size</label>
              <select
                value={props.size as string || 'lg'}
                onChange={(e) => updateProp('size', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Alignment</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateProp('alignment', align)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      (props.alignment || 'center') === align 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {align === 'left' ? '◀' : align === 'center' ? '◉' : '▶'}
                  </button>
                ))}
              </div>
            </div>
            <ToggleField 
              label="Full Width" 
              value={props.fullWidth as boolean || false} 
              onChange={(v) => updateProp('fullWidth', v)} 
            />
          </div>
          
          {/* Style */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">✨ স্টাইল</h5>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Border Radius</label>
              <select
                value={props.borderRadius as string || 'lg'}
                onChange={(e) => updateProp('borderRadius', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Full (Pill)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Animation</label>
              <select
                value={props.animation as string || 'pulse'}
                onChange={(e) => updateProp('animation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="none">None</option>
                <option value="pulse">Pulse</option>
                <option value="bounce">Bounce</option>
                <option value="shake">Shake on Hover</option>
              </select>
            </div>
          </div>
          
          {/* Icon Settings */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🛒 আইকন</h5>
            <ToggleField 
              label="Show Shopping Cart Icon" 
              value={props.showIcon as boolean ?? true} 
              onChange={(v) => updateProp('showIcon', v)} 
            />
            {(props.showIcon ?? true) && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Icon Position</label>
                <div className="flex gap-2">
                  {['left', 'right'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => updateProp('iconPosition', pos)}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                        (props.iconPosition || 'right') === pos 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pos === 'left' ? '⬅ Left' : 'Right ➡'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Container Padding */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📏 Container</h5>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Vertical Padding</label>
              <select
                value={props.containerPadding as string || 'md'}
                onChange={(e) => updateProp('containerPadding', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>
        </>
      );
    
    case 'header':
      return (
        <>
          {/* Branding */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏷️ ব্র্যান্ডিং</h5>
            <ImageField 
              label="Logo Image" 
              value={props.logoUrl as string || ''} 
              onChange={(v) => updateProp('logoUrl', v)} 
            />
            <TextField 
              label="Logo Text (if no image)" 
              value={props.logoText as string || ''} 
              onChange={(v) => updateProp('logoText', v)} 
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Logo Size</label>
              <select
                value={props.logoSize as string || 'md'}
                onChange={(e) => updateProp('logoSize', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🔗 নেভিগেশন</h5>
            <ToggleField 
              label="Show Navigation Links" 
              value={props.showNavLinks as boolean ?? true} 
              onChange={(v) => updateProp('showNavLinks', v)} 
            />
            {(props.showNavLinks ?? true) && (
              <div className="mt-3">
                <ArrayField
                  label="Nav Links"
                  items={(props.navLinks as Array<{ label: string; url: string }>) || []}
                  onAdd={() => addArrayItem('navLinks', { label: 'নতুন লিংক', url: '#' })}
                  onRemove={(i) => removeArrayItem('navLinks', i)}
                  renderItem={(item, index) => (
                    <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                      <TextField 
                        label="Label" 
                        value={item.label || ''} 
                        onChange={(v) => updateArrayItem('navLinks', index, { ...item, label: v })} 
                      />
                      <TextField 
                        label="URL" 
                        value={item.url || ''} 
                        onChange={(v) => updateArrayItem('navLinks', index, { ...item, url: v })} 
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
          
          {/* CTA Button */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🔘 CTA বাটন</h5>
            <ToggleField 
              label="Show CTA Button" 
              value={props.showCta as boolean ?? true} 
              onChange={(v) => updateProp('showCta', v)} 
            />
            {(props.showCta ?? true) && (
              <div className="mt-3 space-y-2">
                <TextField 
                  label="Button Text" 
                  value={props.ctaText as string || 'অর্ডার করুন'} 
                  onChange={(v) => updateProp('ctaText', v)} 
                />
                <TextField 
                  label="Button Link" 
                  value={props.ctaLink as string || '#order'} 
                  onChange={(v) => updateProp('ctaLink', v)} 
                />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Button Style</label>
                  <select
                    value={props.ctaStyle as string || 'solid'}
                    onChange={(e) => updateProp('ctaStyle', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
                  >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Styling */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎨 স্টাইল</h5>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Variant</label>
              <select
                value={props.variant as string || 'simple'}
                onChange={(e) => updateProp('variant', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="simple">Simple (Logo Left)</option>
                <option value="centered">Centered (Logo Center)</option>
                <option value="minimal">Minimal (Logo + CTA only)</option>
              </select>
            </div>
            <ColorPickerField 
              label="Background Color" 
              value={props.bgColor as string || '#FFFFFF'} 
              onChange={(v) => updateProp('bgColor', v)} 
            />
            <ColorPickerField 
              label="Text Color" 
              value={props.textColor as string || '#18181B'} 
              onChange={(v) => updateProp('textColor', v)} 
            />
            <ColorPickerField 
              label="CTA Button Color" 
              value={props.ctaBgColor as string || '#6366F1'} 
              onChange={(v) => updateProp('ctaBgColor', v)} 
            />
            <ColorPickerField 
              label="CTA Text Color" 
              value={props.ctaTextColor as string || '#FFFFFF'} 
              onChange={(v) => updateProp('ctaTextColor', v)} 
            />
          </div>
          
          {/* Behavior */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">⚙️ আচরণ</h5>
            <ToggleField 
              label="Sticky Header" 
              value={props.isSticky as boolean ?? true} 
              onChange={(v) => updateProp('isSticky', v)} 
            />
          </div>
        </>
      );
    
    case 'countdown':
      return (
        <>
          {/* Timer Settings */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">⏰ টাইমার সেটিংস</h5>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
              <input
                type="date"
                value={props.endDate as string || ''}
                onChange={(e) => updateProp('endDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Time</label>
              <input
                type="time"
                value={props.endTime as string || '23:59'}
                onChange={(e) => updateProp('endTime', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              💡 Date সেট না করলে ডেমো কাউন্টডাউন দেখাবে
            </p>
          </div>
          
          {/* Content */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📝 কনটেন্ট</h5>
            <TextField 
              label="Title" 
              value={props.title as string || '⏰ অফার শেষ হচ্ছে!'} 
              onChange={(v) => updateProp('title', v)} 
            />
            <TextField 
              label="Subtitle (Optional)" 
              value={props.subtitle as string || ''} 
              onChange={(v) => updateProp('subtitle', v)} 
            />
            <TextField 
              label="Expired Message" 
              value={props.expiredMessage as string || 'অফার শেষ হয়ে গেছে!'} 
              onChange={(v) => updateProp('expiredMessage', v)} 
            />
          </div>
          
          {/* Display Options */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🔢 ডিসপ্লে অপশন</h5>
            <div className="grid grid-cols-2 gap-2">
              <ToggleField 
                label="Show Days" 
                value={props.showDays as boolean ?? true} 
                onChange={(v) => updateProp('showDays', v)} 
              />
              <ToggleField 
                label="Show Hours" 
                value={props.showHours as boolean ?? true} 
                onChange={(v) => updateProp('showHours', v)} 
              />
              <ToggleField 
                label="Show Minutes" 
                value={props.showMinutes as boolean ?? true} 
                onChange={(v) => updateProp('showMinutes', v)} 
              />
              <ToggleField 
                label="Show Seconds" 
                value={props.showSeconds as boolean ?? true} 
                onChange={(v) => updateProp('showSeconds', v)} 
              />
            </div>
          </div>
          
          {/* Labels */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏷️ লেবেল</h5>
            <div className="grid grid-cols-2 gap-2">
              <TextField 
                label="Days" 
                value={props.daysLabel as string || 'দিন'} 
                onChange={(v) => updateProp('daysLabel', v)} 
              />
              <TextField 
                label="Hours" 
                value={props.hoursLabel as string || 'ঘন্টা'} 
                onChange={(v) => updateProp('hoursLabel', v)} 
              />
              <TextField 
                label="Minutes" 
                value={props.minutesLabel as string || 'মিনিট'} 
                onChange={(v) => updateProp('minutesLabel', v)} 
              />
              <TextField 
                label="Seconds" 
                value={props.secondsLabel as string || 'সেকেন্ড'} 
                onChange={(v) => updateProp('secondsLabel', v)} 
              />
            </div>
          </div>
          
          {/* Styling */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎨 স্টাইল</h5>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Variant</label>
              <select
                value={props.variant as string || 'banner'}
                onChange={(e) => updateProp('variant', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="banner">Banner (Full Width)</option>
                <option value="card">Card (Centered)</option>
                <option value="urgent">Urgent (Flash Sale)</option>
                <option value="minimal">Minimal (Inline)</option>
              </select>
            </div>
            <ColorPickerField 
              label="Background Color" 
              value={props.bgColor as string || '#DC2626'} 
              onChange={(v) => updateProp('bgColor', v)} 
            />
            <ColorPickerField 
              label="Text Color" 
              value={props.textColor as string || '#FFFFFF'} 
              onChange={(v) => updateProp('textColor', v)} 
            />
          </div>
          
          {/* Animation */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">✨ অ্যানিমেশন</h5>
            <ToggleField 
              label="Pulse Animation" 
              value={props.pulseAnimation as boolean ?? true} 
              onChange={(v) => updateProp('pulseAnimation', v)} 
            />
            <ToggleField 
              label="Shake on Low Time (<1 hour)" 
              value={props.shakeOnLowTime as boolean ?? true} 
              onChange={(v) => updateProp('shakeOnLowTime', v)} 
            />
          </div>
        </>
      );
    
    case 'stats':
      return (
        <>
          {/* Title */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📝 শিরোনাম</h5>
            <TextField 
              label="Title (Optional)" 
              value={props.title as string || ''} 
              onChange={(v) => updateProp('title', v)} 
            />
            <TextField 
              label="Subtitle (Optional)" 
              value={props.subtitle as string || ''} 
              onChange={(v) => updateProp('subtitle', v)} 
            />
          </div>
          
          {/* Stats Items */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📊 পরিসংখ্যান</h5>
            <ArrayField
              label="Stats Items"
              items={(props.stats as Array<{ value: number; suffix: string; prefix: string; label: string; icon: string }>) || []}
              onAdd={() => addArrayItem('stats', { value: 0, suffix: '+', prefix: '', label: 'নতুন স্ট্যাট', icon: '📈' })}
              onRemove={(i) => removeArrayItem('stats', i)}
              renderItem={(item, index) => (
                <div key={index} className="space-y-2 p-2 bg-gray-50 rounded">
                  <div className="grid grid-cols-3 gap-2">
                    <TextField 
                      label="Icon" 
                      value={item.icon || ''} 
                      onChange={(v) => updateArrayItem('stats', index, { ...item, icon: v })} 
                    />
                    <NumberField 
                      label="Value" 
                      value={item.value || 0} 
                      onChange={(v) => updateArrayItem('stats', index, { ...item, value: v })} 
                    />
                    <TextField 
                      label="Suffix" 
                      value={item.suffix || ''} 
                      onChange={(v) => updateArrayItem('stats', index, { ...item, suffix: v })} 
                    />
                  </div>
                  <TextField 
                    label="Label" 
                    value={item.label || ''} 
                    onChange={(v) => updateArrayItem('stats', index, { ...item, label: v })} 
                  />
                </div>
              )}
            />
          </div>
          
          {/* Display Options */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎛️ ডিসপ্লে</h5>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Columns</label>
              <select
                value={props.columns as string || '4'}
                onChange={(e) => updateProp('columns', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Value Size</label>
              <select
                value={props.valueFontSize as string || 'xl'}
                onChange={(e) => updateProp('valueFontSize', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="2xl">2X Large</option>
              </select>
            </div>
            <ToggleField 
              label="Show Icons" 
              value={props.showIcons as boolean ?? true} 
              onChange={(v) => updateProp('showIcons', v)} 
            />
            <ToggleField 
              label="Animate on Scroll" 
              value={props.animateOnScroll as boolean ?? true} 
              onChange={(v) => updateProp('animateOnScroll', v)} 
            />
          </div>
          
          {/* Styling */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎨 স্টাইল</h5>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Variant</label>
              <select
                value={props.variant as string || 'simple'}
                onChange={(e) => updateProp('variant', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="simple">Simple</option>
                <option value="cards">Cards</option>
                <option value="highlight">Highlight</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <ColorPickerField 
              label="Background Color" 
              value={props.bgColor as string || '#F9FAFB'} 
              onChange={(v) => updateProp('bgColor', v)} 
            />
            <ColorPickerField 
              label="Text Color" 
              value={props.textColor as string || '#111827'} 
              onChange={(v) => updateProp('textColor', v)} 
            />
            <ColorPickerField 
              label="Accent Color" 
              value={props.accentColor as string || '#6366F1'} 
              onChange={(v) => updateProp('accentColor', v)} 
            />
          </div>
        </>
      );
    
    case 'contact':
      return (
        <>
          {/* Title */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📝 শিরোনাম</h5>
            <TextField 
              label="Title" 
              value={props.title as string || 'যোগাযোগ করুন'} 
              onChange={(v) => updateProp('title', v)} 
            />
            <TextField 
              label="Subtitle" 
              value={props.subtitle as string || ''} 
              onChange={(v) => updateProp('subtitle', v)} 
            />
          </div>
          
          {/* Contact Information */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📞 যোগাযোগ তথ্য</h5>
            <ToggleField 
              label="Show Contact Info" 
              value={props.showContactInfo as boolean ?? true} 
              onChange={(v) => updateProp('showContactInfo', v)} 
            />
            {(props.showContactInfo ?? true) && (
              <div className="mt-3 space-y-2">
                <TextField 
                  label="Phone" 
                  value={props.phone as string || ''} 
                  onChange={(v) => updateProp('phone', v)} 
                />
                <TextField 
                  label="WhatsApp" 
                  value={props.whatsapp as string || ''} 
                  onChange={(v) => updateProp('whatsapp', v)} 
                />
                <TextField 
                  label="Email" 
                  value={props.email as string || ''} 
                  onChange={(v) => updateProp('email', v)} 
                />
                <TextField 
                  label="Address" 
                  value={props.address as string || ''} 
                  onChange={(v) => updateProp('address', v)} 
                />
              </div>
            )}
          </div>
          
          {/* Business Hours */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🕐 অফিস সময়</h5>
            <ToggleField 
              label="Show Business Hours" 
              value={props.showHours as boolean ?? true} 
              onChange={(v) => updateProp('showHours', v)} 
            />
            {(props.showHours ?? true) && (
              <div className="mt-3 space-y-2">
                <TextField 
                  label="Hours Title" 
                  value={props.hoursTitle as string || 'অফিস সময়'} 
                  onChange={(v) => updateProp('hoursTitle', v)} 
                />
                <TextField 
                  label="Hours" 
                  value={props.hours as string || ''} 
                  onChange={(v) => updateProp('hours', v)} 
                />
              </div>
            )}
          </div>
          
          {/* Form Settings */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📋 ফর্ম</h5>
            <ToggleField 
              label="Show Contact Form" 
              value={props.showForm as boolean ?? true} 
              onChange={(v) => updateProp('showForm', v)} 
            />
            {(props.showForm ?? true) && (
              <div className="mt-3 space-y-2">
                <TextField 
                  label="Form Title" 
                  value={props.formTitle as string || 'মেসেজ পাঠান'} 
                  onChange={(v) => updateProp('formTitle', v)} 
                />
                <TextField 
                  label="Submit Button" 
                  value={props.submitButtonText as string || 'পাঠান'} 
                  onChange={(v) => updateProp('submitButtonText', v)} 
                />
              </div>
            )}
          </div>
          
          {/* Social Links */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🔗 সোশ্যাল লিংক</h5>
            <ToggleField 
              label="Show Social Links" 
              value={props.showSocialLinks as boolean ?? true} 
              onChange={(v) => updateProp('showSocialLinks', v)} 
            />
            {(props.showSocialLinks ?? true) && (
              <div className="mt-3 space-y-2">
                <TextField 
                  label="Facebook URL" 
                  value={props.facebookUrl as string || ''} 
                  onChange={(v) => updateProp('facebookUrl', v)} 
                />
                <TextField 
                  label="Instagram URL" 
                  value={props.instagramUrl as string || ''} 
                  onChange={(v) => updateProp('instagramUrl', v)} 
                />
                <TextField 
                  label="WhatsApp URL" 
                  value={props.whatsappUrl as string || ''} 
                  onChange={(v) => updateProp('whatsappUrl', v)} 
                />
              </div>
            )}
          </div>
          
          {/* Styling */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎨 স্টাইল</h5>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Layout Variant</label>
              <select
                value={props.variant as string || 'split'}
                onChange={(e) => updateProp('variant', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
              >
                <option value="split">Split (Info + Form)</option>
                <option value="stacked">Stacked</option>
                <option value="form-only">Form Only</option>
                <option value="info-only">Info Only</option>
              </select>
            </div>
            <ColorPickerField 
              label="Background Color" 
              value={props.bgColor as string || '#F9FAFB'} 
              onChange={(v) => updateProp('bgColor', v)} 
            />
            <ColorPickerField 
              label="Accent Color" 
              value={props.accentColor as string || '#6366F1'} 
              onChange={(v) => updateProp('accentColor', v)} 
            />
          </div>
        </>
      );
    
    default:
      return (
        <div className="text-sm text-gray-500">
          Editor for "{type}" coming soon...
        </div>
      );
  }
}

// Reusable form components
function TextField({ 
  label, 
  value, 
  onChange, 
  className = '' 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}

function TextAreaField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
      />
    </div>
  );
}

function ImageField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
}) {
  // Use BuilderImageUpload for drag-drop + R2 upload support
  return (
    <BuilderImageUpload 
      label={label}
      value={value}
      onChange={onChange}
    />
  );
}

function ArrayField<T>({
  label,
  items,
  onAdd,
  onRemove,
  renderItem,
}: {
  label: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <button
          onClick={onAdd}
          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
          title="Add"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="relative">
            {renderItem(item, index)}
            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500"
              title="Remove"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberField({ 
  label, 
  value, 
  onChange,
  min = 0,
  step = 1,
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        step={step}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}

function ToggleField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: boolean; 
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          value ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

// Custom HTML Panel with Connect Buttons Feature
interface CustomHtmlPanelProps {
  props: Record<string, unknown>;
  updateProp: (key: string, value: unknown) => void;
  connectedCount: number;
  products: Array<{ id: number; name: string; price: number; imageUrl: string | null }>;
}

function CustomHtmlPanel({ props, updateProp, connectedCount, products }: CustomHtmlPanelProps) {
  const [showConnector, setShowConnector] = useState(false);
  const htmlContent = props.htmlContent as string || '';
  
  return (
    <>
      <TextField 
        label="Section Name (Internal)" 
        value={props.title as string || ''} 
        onChange={(v) => updateProp('title', v)} 
      />
      
      {/* Connect Buttons Feature */}
      <div className="mt-3 border border-indigo-200 rounded-xl p-3 bg-gradient-to-br from-indigo-50 to-purple-50">
        <button 
          onClick={() => setShowConnector(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md font-medium text-sm"
        >
          <Link2 size={16} />
          বাটন কানেক্ট করুন
          {connectedCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {connectedCount}টি কানেক্টেড
            </span>
          )}
        </button>
        <p className="text-[11px] text-gray-600 mt-2 text-center">
          HTML এর "Order Now" বাটনগুলোকে নিচের Order Form এ connect করুন
        </p>
      </div>
      
      {/* HTML Code Editor */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          HTML + CSS Code
        </label>
        <div className="h-[280px] rounded-lg overflow-hidden border border-gray-200">
          <MonacoEditor
            value={htmlContent}
            onChange={(v) => updateProp('htmlContent', v || '')}
            language="html"
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          💡 HTML, CSS, &lt;style&gt; tag সব একসাথে পেস্ট করতে পারবেন
        </p>
      </div>
      
      <TextField 
        label="Extra Tailwind Classes" 
        value={props.containerClass as string || ''} 
        onChange={(v) => updateProp('containerClass', v)} 
      />
      {/* Button Connector Modal */}
      <ButtonConnectorModal
        isOpen={showConnector}
        onClose={() => setShowConnector(false)}
        htmlContent={htmlContent}
        onApply={(connections) => {
          // Apply connection attributes to HTML
          const updatedHtml = applyButtonConnections(htmlContent, connections);
          updateProp('htmlContent', updatedHtml);
          setShowConnector(false);
        }}
      />
    </>
  );
}

// Section Styling Panel - common for all sections
interface SectionStylePanelProps {
  props: Record<string, unknown>;
  updateProp: (key: string, value: unknown) => void;
}

// Theme presets for quick styling
const STYLE_PRESETS = [
  { 
    id: 'default', 
    name: '⬜ ডিফল্ট',
    bg: '', 
    text: '', 
    heading: '' 
  },
  { 
    id: 'dark', 
    name: '🌙 Dark',
    bg: '#18181B', 
    text: '#FFFFFF', 
    heading: '#FFFFFF' 
  },
  { 
    id: 'light', 
    name: '☀️ Light',
    bg: '#F9FAFB', 
    text: '#111827', 
    heading: '#111827' 
  },
  { 
    id: 'brand', 
    name: '💜 Brand',
    bg: '#6366F1', 
    text: '#FFFFFF', 
    heading: '#FFFFFF' 
  },
  { 
    id: 'success', 
    name: '💚 Green',
    bg: '#10B981', 
    text: '#FFFFFF', 
    heading: '#FFFFFF' 
  },
  { 
    id: 'danger', 
    name: '❤️ Red',
    bg: '#DC2626', 
    text: '#FFFFFF', 
    heading: '#FBBF24' 
  },
];

function SectionStylePanel({ props, updateProp }: SectionStylePanelProps) {
  const fontOptions = [
    { value: 'default', label: 'ডিফল্ট' },
    // Bengali Fonts
    { value: 'hind-siliguri', label: 'Hind Siliguri (বাংলা)' },
    { value: 'noto-sans-bengali', label: 'Noto Sans Bengali' },
    { value: 'galada', label: 'Galada (স্টাইলিশ)' },
    { value: 'tiro-bangla', label: 'Tiro Bangla (সেরিফ)' },
    { value: 'mina', label: 'Mina' },
    { value: 'atma', label: 'Atma (প্লেফুল)' },
    // English Fonts
    { value: 'poppins', label: 'Poppins' },
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'lato', label: 'Lato' },
    { value: 'montserrat', label: 'Montserrat' },
    { value: 'oswald', label: 'Oswald (Bold)' },
    { value: 'playfair-display', label: 'Playfair Display (Serif)' },
    { value: 'open-sans', label: 'Open Sans' },
  ];

  const paddingOptions = [
    { value: 'none', label: 'কোনো প্যাডিং নেই' },
    { value: 'sm', label: 'ছোট (1rem)' },
    { value: 'md', label: 'মাঝারি (2rem)' },
    { value: 'lg', label: 'বড় (4rem)' },
    { value: 'xl', label: 'অনেক বড় (6rem)' },
  ];

  const borderRadiusOptions = [
    { value: 'none', label: 'কোনো রাউন্ড নেই' },
    { value: 'sm', label: 'ছোট' },
    { value: 'md', label: 'মাঝারি' },
    { value: 'lg', label: 'বড়' },
    { value: 'xl', label: 'অনেক বড়' },
    { value: 'full', label: 'সম্পূর্ণ গোল' },
  ];

  const boxShadowOptions = [
    { value: 'none', label: 'কোনো শ্যাডো নেই' },
    { value: 'sm', label: 'হালকা' },
    { value: 'md', label: 'মাঝারি' },
    { value: 'lg', label: 'বড়' },
    { value: 'xl', label: 'অনেক বড়' },
  ];

  const animationOptions = [
    { value: 'none', label: 'কোনো অ্যানিমেশন নেই' },
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'fadeInUp', label: 'Fade In Up ⬆' },
    { value: 'fadeInDown', label: 'Fade In Down ⬇' },
    { value: 'slideInLeft', label: 'Slide In Left ⬅' },
    { value: 'slideInRight', label: 'Slide In Right ➡' },
    { value: 'zoomIn', label: 'Zoom In 🔍' },
  ];

  const patternOptions = [
    { value: 'none', label: 'কোনো প্যাটার্ন নেই' },
    { value: 'dots', label: '• Dots' },
    { value: 'grid', label: '▦ Grid' },
    { value: 'waves', label: '〰 Waves' },
    { value: 'diagonal', label: '⟋ Diagonal Lines' },
  ];

  // Apply preset
  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    updateProp('backgroundColor', preset.bg);
    updateProp('textColor', preset.text);
    updateProp('headingColor', preset.heading);
  };

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
        🎨 স্টাইল সেটিংস
      </h5>
      
      {/* Quick Theme Presets */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2 py-1 text-xs rounded-md border transition-colors hover:border-indigo-400"
              style={{ 
                backgroundColor: preset.bg || '#F3F4F6',
                color: preset.text || '#374151',
                borderColor: props.backgroundColor === preset.bg ? '#6366F1' : 'transparent',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Background Color */}
      <ColorPickerField
        label="Background Color"
        value={props.backgroundColor as string || ''}
        onChange={(v) => updateProp('backgroundColor', v)}
        showGradients={true}
      />
      
      {/* Background Pattern */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Background Pattern
        </label>
        <select
          value={props.backgroundPattern as string || 'none'}
          onChange={(e) => updateProp('backgroundPattern', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {patternOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {/* Text Color */}
      <ColorPickerField
        label="Text Color"
        value={props.textColor as string || ''}
        onChange={(v) => updateProp('textColor', v)}
        showGradients={false}
      />
      
      {/* Heading Color */}
      <ColorPickerField
        label="Heading Color"
        value={props.headingColor as string || ''}
        onChange={(v) => updateProp('headingColor', v)}
        showGradients={false}
      />
      
      {/* Font Family */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Font Family
        </label>
        <select
          value={props.fontFamily as string || 'default'}
          onChange={(e) => updateProp('fontFamily', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {fontOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {/* Vertical Padding */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Vertical Padding
        </label>
        <select
          value={props.paddingY as string || 'md'}
          onChange={(e) => updateProp('paddingY', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {paddingOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {/* Border Radius */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Border Radius
        </label>
        <select
          value={props.borderRadius as string || 'none'}
          onChange={(e) => updateProp('borderRadius', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {borderRadiusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {/* Box Shadow */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Box Shadow
        </label>
        <select
          value={props.boxShadow as string || 'none'}
          onChange={(e) => updateProp('boxShadow', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {boxShadowOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {/* Animation */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Entrance Animation
        </label>
        <select
          value={props.animationEntrance as string || 'none'}
          onChange={(e) => updateProp('animationEntrance', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {animationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
