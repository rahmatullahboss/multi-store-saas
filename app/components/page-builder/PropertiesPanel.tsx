/**
 * Page Builder v2 - Properties Panel
 * 
 * Dynamic form for editing section props based on section type.
 */

import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

interface PropertiesPanelProps {
  section: BuilderSection;
  onUpdate: (props: Record<string, unknown>) => void;
  onClose: () => void;
}

export function PropertiesPanel({ section, onUpdate, onClose }: PropertiesPanelProps) {
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
        {renderPropsForm(section.type, localProps, updateProp, updateArrayItem, addArrayItem, removeArrayItem)}
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
  removeArrayItem: (key: string, index: number) => void
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
            label="Button Text" 
            value={props.buttonText as string || ''} 
            onChange={(v) => updateProp('buttonText', v)} 
          />
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
