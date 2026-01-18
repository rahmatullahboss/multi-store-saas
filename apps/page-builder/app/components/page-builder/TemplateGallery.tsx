/**
 * Page Builder v2 - Template Gallery
 * 
 * Modal for selecting a template when creating a new page.
 * Features:
 * - Template preview before selection
 * - Category filtering
 * - Beautiful template cards with hover effects
 */

import { useState } from 'react';
import { X, FileText, Zap, Package, Crown, Layout, Eye, Check, ChevronLeft, Sparkles } from 'lucide-react';
import type { TemplatePreset, TemplateCategory } from '~/lib/page-builder/templates';
import { TemplatePreviewRenderer } from './TemplatePreviewRenderer';

interface TemplateGalleryProps {
  templates: TemplatePreset[];
  onSelect: (templateId: string, slug: string, title: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_META: Record<TemplateCategory | 'all', { name: string; icon: React.ReactNode }> = {
  all: { name: 'সব', icon: <Layout className="w-4 h-4" /> },
  sales: { name: 'সেলস', icon: <Zap className="w-4 h-4" /> },
  product: { name: 'প্রোডাক্ট', icon: <Package className="w-4 h-4" /> },
  premium: { name: 'প্রিমিয়াম', icon: <Crown className="w-4 h-4" /> },
  minimal: { name: 'মিনিমাল', icon: <Layout className="w-4 h-4" /> },
  service: { name: 'সার্ভিস', icon: <FileText className="w-4 h-4" /> },
};

export function TemplateGallery({ 
  templates, 
  onSelect, 
  onClose,
  isSubmitting = false,
}: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePreset | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<'select' | 'preview' | 'details'>('select');

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...new Set(templates.map(t => t.category))] as (TemplateCategory | 'all')[];

  // Handle template selection (go to details)
  const handleTemplateSelect = (template: TemplatePreset) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    // Generate slug from template name
    setSlug(template.id + '-' + Date.now().toString(36));
    setStep('details');
  };

  // Handle preview
  const handlePreview = (template: TemplatePreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    setStep('preview');
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate && slug) {
      onSelect(selectedTemplate.id, slug, title);
    }
  };

  // Generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    const slugified = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0980-\u09FF-]/g, '')
      .slice(0, 50);
    setSlug(slugified || 'new-page-' + Date.now().toString(36));
  };

  // Back from preview/details to selection
  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
      setSelectedTemplate(null);
    } else if (step === 'preview') {
      setStep('select');
      setPreviewTemplate(null);
    }
  };

  // Select from preview
  const handleSelectFromPreview = () => {
    if (previewTemplate) {
      setSelectedTemplate(previewTemplate);
      setTitle(previewTemplate.name);
      setSlug(previewTemplate.id + '-' + Date.now().toString(36));
      setPreviewTemplate(null);
      setStep('details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3">
            {step !== 'select' && (
              <button
                onClick={handleBack}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {step === 'select' && 'টেমপ্লেট নির্বাচন করুন'}
                {step === 'preview' && `প্রিভিউ: ${previewTemplate?.name}`}
                {step === 'details' && 'পেজ সেটআপ'}
              </h2>
              <p className="text-sm text-indigo-100">
                {step === 'select' && 'আপনার ল্যান্ডিং পেজের জন্য একটি টেমপ্লেট বেছে নিন'}
                {step === 'preview' && 'টেমপ্লেটে কি কি সেকশন আছে দেখুন'}
                {step === 'details' && 'আপনার পেজের নাম এবং URL দিন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ====================== STEP 1: Template Selection ====================== */}
        {step === 'select' && (
          <>
            {/* Category Filter */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
              {categories.map(cat => CATEGORY_META[cat] && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="group relative bg-white border-2 rounded-xl overflow-hidden transition-all hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1"
                  >
                    {/* Thumbnail with gradient background */}
                    <div 
                      className="aspect-[4/3] relative flex items-center justify-center overflow-hidden"
                      style={{ background: template.colors.bg }}
                    >
                      {template.id === 'blank' ? (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-white/60" />
                          </div>
                          <span className="text-sm text-white/70 font-medium">খালি পেজ</span>
                        </div>
                      ) : (
                        /* Mini preview of template sections */
                        <div className="absolute inset-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3 flex flex-col gap-1 overflow-hidden">
                          {/* Mini Header */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{template.emoji}</span>
                            <div className="flex-1 h-2 rounded bg-white/30" />
                          </div>
                          {/* Mini Sections */}
                          <div className="flex-1 flex flex-col gap-1">
                            {template.sections.slice(0, 4).map((s, i) => (
                              <div 
                                key={i}
                                className="rounded opacity-70"
                                style={{ 
                                  background: 'rgba(255,255,255,0.2)',
                                  height: i === 0 ? '35%' : '15%',
                                }}
                              />
                            ))}
                          </div>
                          {/* Mini CTA */}
                          <div 
                            className="h-5 rounded flex items-center justify-center"
                            style={{ backgroundColor: template.colors.accent }}
                          >
                            <span className="text-[9px] text-white font-medium">অর্ডার করুন</span>
                          </div>
                          {/* Section count badge */}
                          {template.sections.length > 0 && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-full">
                              {template.sections.length} সেকশন
                            </div>
                          )}
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 text-white text-[10px] font-medium rounded-full backdrop-blur-sm flex items-center gap-1">
                        {template.emoji} {CATEGORY_META[template.category]?.name || template.category}
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => handlePreview(template, e)}
                          className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-gray-100 transition shadow-lg"
                        >
                          <Eye size={16} />
                          প্রিভিউ
                        </button>
                        <button
                          onClick={() => handleTemplateSelect(template)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg"
                        >
                          <Check size={16} />
                          সিলেক্ট
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{template.emoji}</span>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {template.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ====================== STEP 2: Template Preview ====================== */}
        {step === 'preview' && previewTemplate && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Template Info */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 flex flex-col">
              {/* Template Info Banner */}
              <div 
                className="rounded-xl p-4 text-white mb-4"
                style={{ background: previewTemplate.colors.bg }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{previewTemplate.emoji}</span>
                  <div>
                    <h3 className="text-lg font-bold">{previewTemplate.name}</h3>
                    <p className="text-sm text-white/80">{previewTemplate.sections.length} টি সেকশন</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{previewTemplate.description}</p>

              {/* Section List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">সেকশন তালিকা</h4>
                {previewTemplate.sections.map((section, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 text-sm"
                  >
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: previewTemplate.colors.accent }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-gray-700 capitalize">{section.type.replace(/-/g, ' ')}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={handleSelectFromPreview}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  এই টেমপ্লেট ব্যবহার করুন
                </button>
                <button
                  onClick={handleBack}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  অন্য টেমপ্লেট দেখুন
                </button>
              </div>
            </div>

            {/* Right: Visual Preview */}
            <div className="flex-1 bg-gray-100 overflow-y-auto">
              <div className="bg-white min-h-full shadow-inner">
                <TemplatePreviewRenderer template={previewTemplate} />
              </div>
            </div>
          </div>
        )}

        {/* ====================== STEP 3: Page Details Form ====================== */}
        {step === 'details' && selectedTemplate && (
          <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-6">
              {/* Selected template preview */}
              <div 
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: selectedTemplate.colors.bg }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-3xl">
                  {selectedTemplate.emoji}
                </div>
                <div className="text-white">
                  <div className="text-sm opacity-80">নির্বাচিত টেমপ্লেট</div>
                  <div className="font-semibold text-lg">{selectedTemplate.name}</div>
                  <div className="text-sm opacity-80">{selectedTemplate.sections.length} টি সেকশন</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="ml-auto px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition"
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
                    /p/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="flash-sale"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    pattern="[a-z0-9\-]+"
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      পেজ তৈরি করুন
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
