/**
 * SectionWrapper Component
 * 
 * Wraps each section in preview mode to provide interactive editing controls:
 * - Hover to show toolbar (Edit, Remove, Copy, Move Up/Down)
 * - Click to select and open editor panel
 * - Visual highlight for selected section
 */

import { useState, useCallback } from 'react';
import { Edit2, Trash2, Copy, ChevronUp, ChevronDown, GripVertical, Eye, EyeOff } from 'lucide-react';

interface SectionWrapperProps {
  sectionId: string;
  sectionName: string;
  sectionNameEn?: string;
  children: React.ReactNode;
  isPreview?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canDuplicate?: boolean;
  lang?: string;
}

export function SectionWrapper({
  sectionId,
  sectionName,
  sectionNameEn,
  children,
  isPreview = false,
  isSelected = false,
  isHidden = false,
  canMoveUp = true,
  canMoveDown = true,
  canDuplicate = false,
  lang = 'bn',
}: SectionWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  // If not in preview mode, just render children
  if (!isPreview) {
    return <>{children}</>;
  }

  // Handle section click - send message to parent editor
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({
      type: 'SECTION_CLICKED',
      sectionId,
    }, '*');
  }, [sectionId]);

  // Handle edit button click
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({
      type: 'SECTION_EDIT',
      sectionId,
    }, '*');
  }, [sectionId]);

  // Handle remove/hide section
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({
      type: 'SECTION_TOGGLE_VISIBILITY',
      sectionId,
      visible: false,
    }, '*');
  }, [sectionId]);

  // Handle duplicate section
  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({
      type: 'SECTION_DUPLICATE',
      sectionId,
    }, '*');
  }, [sectionId]);

  // Handle move up
  const handleMoveUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({
      type: 'SECTION_MOVE',
      sectionId,
      direction: 'up',
    }, '*');
  }, [sectionId]);

  // Handle move down
  const handleMoveDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent.postMessage({
      type: 'SECTION_MOVE',
      sectionId,
      direction: 'down',
    }, '*');
  }, [sectionId]);

  const displayName = lang === 'bn' ? sectionName : (sectionNameEn || sectionName);

  return (
    <div
      className="section-wrapper relative"
      data-section-id={sectionId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        outline: isSelected 
          ? '3px solid #10b981' 
          : isHovered 
            ? '2px dashed #6366f1' 
            : 'none',
        outlineOffset: isSelected ? '-3px' : '-2px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Section Toolbar - Shows on hover */}
      {(isHovered || isSelected) && (
        <div 
          className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-1 bg-white rounded-lg shadow-xl border border-gray-200 px-2 py-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Section Label */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700 mr-1">
            <GripVertical className="w-3 h-3 text-gray-400" />
            <span className="max-w-[100px] truncate">{displayName}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Move Up */}
          {canMoveUp && (
            <button
              onClick={handleMoveUp}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title={lang === 'bn' ? 'উপরে সরান' : 'Move Up'}
            >
              <ChevronUp className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Move Down */}
          {canMoveDown && (
            <button
              onClick={handleMoveDown}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title={lang === 'bn' ? 'নিচে সরান' : 'Move Down'}
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Edit */}
          <button
            onClick={handleEdit}
            className="p-1.5 hover:bg-emerald-100 rounded transition-colors"
            title={lang === 'bn' ? 'এডিট করুন' : 'Edit'}
          >
            <Edit2 className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Duplicate (if available) */}
          {canDuplicate && (
            <button
              onClick={handleDuplicate}
              className="p-1.5 hover:bg-blue-100 rounded transition-colors"
              title={lang === 'bn' ? 'কপি করুন' : 'Duplicate'}
            >
              <Copy className="w-4 h-4 text-blue-600" />
            </button>
          )}

          {/* Remove/Hide */}
          <button
            onClick={handleRemove}
            className="p-1.5 hover:bg-red-100 rounded transition-colors"
            title={lang === 'bn' ? 'লুকান' : 'Hide'}
          >
            <EyeOff className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Selected Indicator Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-50 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-lg">
          {lang === 'bn' ? 'সিলেক্টেড' : 'Selected'}
        </div>
      )}

      {/* Actual Section Content */}
      {children}
    </div>
  );
}

// Helper to get section name from LANDING_SECTIONS
export function getSectionDisplayName(sectionId: string, lang: string = 'bn'): { name: string; nameEn: string } {
  const SECTION_NAMES: Record<string, { name: string; nameEn: string }> = {
    'hero': { name: 'হেডার', nameEn: 'Header' },
    'trust': { name: 'বিশ্বাসযোগ্যতা', nameEn: 'Trust Badges' },
    'features': { name: 'বৈশিষ্ট্য', nameEn: 'Features' },
    'gallery': { name: 'ফটো গ্যালারি', nameEn: 'Photo Gallery' },
    'video': { name: 'ভিডিও', nameEn: 'Video' },
    'benefits': { name: 'কেন কিনবেন', nameEn: 'Why Buy Us' },
    'comparison': { name: 'তুলনা', nameEn: 'Comparison' },
    'testimonials': { name: 'টেস্টিমোনিয়াল', nameEn: 'Testimonials' },
    'social': { name: 'সোশ্যাল প্রুফ', nameEn: 'Social Proof' },
    'delivery': { name: 'ডেলিভারি', nameEn: 'Delivery Info' },
    'faq': { name: 'FAQ', nameEn: 'FAQ' },
    'guarantee': { name: 'গ্যারান্টি', nameEn: 'Guarantee' },
    'cta': { name: 'অর্ডার ফর্ম', nameEn: 'Order Form' },
    'order-form': { name: 'অর্ডার ফর্ম', nameEn: 'Order Form' },
    'pricing': { name: 'প্রাইসিং', nameEn: 'Pricing' },
    'how-to-order': { name: 'অর্ডার প্রক্রিয়া', nameEn: 'How to Order' },
    'showcase': { name: 'প্রোডাক্ট ডিটেইলস', nameEn: 'Product Details' },
    'problem-solution': { name: 'সমস্যা ও সমাধান', nameEn: 'Problem & Solution' },
  };

  return SECTION_NAMES[sectionId] || { name: sectionId, nameEn: sectionId };
}

export default SectionWrapper;
