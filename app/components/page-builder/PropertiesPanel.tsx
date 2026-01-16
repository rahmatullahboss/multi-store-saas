/**
 * Page Builder v2 - Properties Panel
 * 
 * Dynamic form for editing section props based on section type.
 */

import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

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
}

export function PropertiesPanel({ section, onUpdate, onClose, products = [] }: PropertiesPanelProps) {
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
        {renderPropsForm(section.type, localProps, updateProp, updateArrayItem, addArrayItem, removeArrayItem, products)}
      </div>
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
  products: Product[] = []
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
      
      // Handler for product selection - auto-fills pricing
      const handleProductSelect = (productId: number | null) => {
        if (productId === null) {
          updateProp('productId', null);
          return;
        }
        const product = products.find(p => p.id === productId);
        if (product) {
          updateProp('productId', product.id);
          updateProp('productPrice', product.price);
          updateProp('discountedPrice', product.price); // Can adjust for discount later
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
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste image URL..."
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      />
      {value && (
        <img 
          src={value} 
          alt="Preview" 
          className="mt-2 w-full h-20 object-cover rounded border"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
    </div>
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

