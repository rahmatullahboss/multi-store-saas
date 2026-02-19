/**
 * SEO Panel Component for Landing Builder
 * 
 * Provides meta title, description, and OG image settings for landing pages.
 */

import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  Upload,
  Loader2,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';

interface SEOPanelProps {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  storeName: string;
  subdomain: string;
  customDomain?: string | null;
  onSeoTitleChange?: (value: string) => void;
  onSeoDescriptionChange?: (value: string) => void;
  onOgImageChange?: (value: string) => void;
}

export default function SEOPanel({
  seoTitle = '',
  seoDescription = '',
  ogImage = '',
  storeName,
  subdomain,
  customDomain,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onOgImageChange,
}: SEOPanelProps) {
  const { t } = useTranslation();
  
  // Local state for preview
  const [localTitle, setLocalTitle] = useState(seoTitle || storeName);
  const [localDescription, setLocalDescription] = useState(seoDescription);
  const [_localOgImage, setLocalOgImage] = useState(ogImage);
  const [ogImagePreview, setOgImagePreview] = useState(ogImage);
  
  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploading = imageFetcher.state !== 'idle';
  
  // Handle image upload success
  useEffect(() => {
    if (imageFetcher.data?.success && imageFetcher.data?.url) {
      setLocalOgImage(imageFetcher.data.url);
      setOgImagePreview(imageFetcher.data.url);
      onOgImageChange?.(imageFetcher.data.url);
    }
  }, [imageFetcher.data, onOgImageChange]);
  
  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    onSeoTitleChange?.(value);
  };
  
  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value);
    onSeoDescriptionChange?.(value);
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setOgImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress and upload
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 630,
        quality: 0.85,
        format,
      });
      fileToUpload = new File([compressedBlob], `og-image.${format}`, { type: `image/${format}` });
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'og-images');

    imageFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const storeUrl = customDomain || `${subdomain}.ozzyl.com`;

  return (
    <div className="space-y-4">
      {/* Google Preview */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
          {t('seoSearchPreview') || 'Google Preview'}
        </p>
        <p className="text-xs text-emerald-700 truncate">{storeUrl}</p>
        <h3 className="text-sm text-blue-800 hover:underline cursor-pointer truncate font-medium">
          {localTitle || storeName}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">
          {localDescription || t('seoAddDescription') || 'Add a description to improve SEO...'}
        </p>
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t('metaTitle') || 'Meta Title'}
        </label>
        <input
          type="text"
          value={localTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          maxLength={60}
          placeholder={storeName}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">{localTitle.length}/60</p>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t('metaDescription') || 'Meta Description'}
        </label>
        <textarea
          value={localDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={2}
          maxLength={160}
          placeholder={String(t('seoDescPlaceholder') || 'Describe your product/store for search engines...')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{localDescription.length}/160</p>
      </div>

      {/* OG Image */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t('socialMediaImage') || 'Social Media Image'}
        </label>
        <div className="flex items-start gap-3">
          {/* Preview */}
          <div className="flex-shrink-0">
            {ogImagePreview ? (
              <div className="relative">
                <img
                  src={ogImagePreview}
                  alt="OG Preview"
                  className="w-24 h-14 object-cover rounded border border-gray-200"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-24 h-14 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                <Globe className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('uploading') || 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  {t('uploadImage') || 'Upload'}
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-500 mt-1">1200x630px recommended</p>
            {imageFetcher.data?.error && (
              <p className="text-red-500 text-xs mt-1">{imageFetcher.data.error}</p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {/* SEO Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        <h4 className="font-medium text-amber-900 flex items-center gap-1.5 mb-1.5 text-xs">
          <AlertCircle className="w-3 h-3" />
          {t('seoTips') || 'SEO Tips'}
        </h4>
        <ul className="text-[10px] text-amber-800 space-y-0.5">
          <li>• {t('seoTip1') || 'Keep title under 60 characters'}</li>
          <li>• {t('seoTip2') || 'Include main keyword in title'}</li>
          <li>• {t('seoTip3') || 'Description should be 120-160 chars'}</li>
        </ul>
      </div>
    </div>
  );
}
