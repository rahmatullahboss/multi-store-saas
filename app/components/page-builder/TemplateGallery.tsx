/**
 * Page Builder v2 - Template Gallery
 * 
 * Modal for selecting a template when creating a new page.
 */

import { useState } from 'react';
import { X, FileText, Zap, Package, Briefcase, Layout } from 'lucide-react';
import type { TemplatePreset, TemplateCategory } from '~/lib/page-builder/templates';

interface TemplateGalleryProps {
  templates: TemplatePreset[];
  onSelect: (templateId: string, slug: string, title: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_META: Record<TemplateCategory, { name: string; icon: React.ReactNode }> = {
  sales: { name: 'সেলস', icon: <Zap className="w-4 h-4" /> },
  product: { name: 'প্রোডাক্ট', icon: <Package className="w-4 h-4" /> },
  service: { name: 'সার্ভিস', icon: <Briefcase className="w-4 h-4" /> },
  minimal: { name: 'মিনিমাল', icon: <Layout className="w-4 h-4" /> },
};

export function TemplateGallery({ 
  templates, 
  onSelect, 
  onClose,
  isSubmitting = false,
}: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<'select' | 'details'>('select');

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  // Get unique categories
  const categories = [...new Set(templates.map(t => t.category))];

  // Handle template selection
  const handleTemplateClick = (template: TemplatePreset) => {
    setSelectedTemplate(template.id);
    setTitle(template.name);
    // Generate slug from template name
    setSlug(template.id + '-' + Date.now().toString(36));
    setStep('details');
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate && slug) {
      onSelect(selectedTemplate, slug, title);
    }
  };

  // Generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Simple Bangla to English slug conversion
    const slugified = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0980-\u09FF-]/g, '')
      .slice(0, 50);
    setSlug(slugified || 'new-page-' + Date.now().toString(36));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">
              {step === 'select' ? 'টেমপ্লেট নির্বাচন করুন' : 'পেজ সেটআপ'}
            </h2>
            <p className="text-sm text-indigo-100">
              {step === 'select' 
                ? 'আপনার ল্যান্ডিং পেজের জন্য একটি টেমপ্লেট বেছে নিন'
                : 'আপনার পেজের নাম এবং URL দিন'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'select' ? (
          <>
            {/* Category Filter */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                সব দেখুন
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {CATEGORY_META[cat].icon}
                  {CATEGORY_META[cat].name}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`group relative bg-white border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:border-indigo-400 text-left ${
                      selectedTemplate === template.id 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      {template.id === 'blank' ? (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <span className="text-sm text-gray-400">খালি পেজ</span>
                        </div>
                      ) : (
                        <div className="w-full h-full p-4 flex flex-col gap-1">
                          {/* Mini preview of sections */}
                          {template.sections.slice(0, 4).map((s, i) => (
                            <div 
                              key={i}
                              className="flex-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded opacity-60"
                              style={{ 
                                minHeight: i === 0 ? '40%' : '15%',
                              }}
                            />
                          ))}
                          {template.sections.length > 4 && (
                            <div className="text-xs text-gray-400 text-center">
                              +{template.sections.length - 4} আরও সেকশন
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {CATEGORY_META[template.category].icon}
                        <span className="text-xs text-gray-400 uppercase">
                          {CATEGORY_META[template.category].name}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {template.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        {template.sections.length} টি সেকশন
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        এটি নির্বাচন করুন
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Step 2: Page Details Form */
          <form onSubmit={handleSubmit} className="flex-1 p-6">
            <div className="max-w-md mx-auto space-y-6">
              {/* Selected template preview */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <FileText className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">নির্বাচিত টেমপ্লেট</div>
                  <div className="font-semibold text-gray-900">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="ml-auto text-sm text-indigo-600 hover:text-indigo-700"
                >
                  পরিবর্তন করুন
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পেজের নাম
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="যেমন: সামার সেল অফার"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm">
                    /offers/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="flash-sale"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  শুধুমাত্র ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন (-) ব্যবহার করুন
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  পেছনে যান
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !slug || !title}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'তৈরি হচ্ছে...' : 'পেজ তৈরি করুন'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
