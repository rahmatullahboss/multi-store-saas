/**
 * ImageEditor Component
 * 
 * Image URL input with preview for Quick Builder.
 * Supports URL input and file upload.
 */

import { useState, memo, useCallback } from 'react';
import { useFetcher } from '@remix-run/react';
import { Upload, X, Link, Image as ImageIcon } from 'lucide-react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';

interface ImageEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  labelBn?: string;
  language?: 'en' | 'bn';
  aspectRatio?: string;
  maxWidth?: number;
  maxHeight?: number;
}

function ImageEditorBase({
  value,
  onChange,
  label,
  labelBn,
  language = 'en',
  maxWidth = 800,
  maxHeight = 600,
}: ImageEditorProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  
  const displayLabel = language === 'bn' ? (labelBn || label) : label;

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      // Compress image before upload
      let fileToUpload: File | Blob = file;
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality: 0.8,
        format,
      });
      fileToUpload = new File([compressedBlob], `image.${format}`, { type: `image/${format}` });
      console.log(`Image compressed: ${file.size} -> ${compressedBlob.size} bytes`);
      
      // Upload to R2
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', 'images');

      imageFetcher.submit(formData, {
        method: 'post',
        action: '/api/upload-image',
        encType: 'multipart/form-data',
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      setIsUploading(false);
    }
  }, [imageFetcher, maxWidth, maxHeight]);

  // Handle upload response
  if (imageFetcher.data?.success && imageFetcher.data?.url && isUploading) {
    onChange(imageFetcher.data.url);
    setIsUploading(false);
  }

  return (
    <div className="space-y-2">
      {displayLabel && (
        <label className="block text-xs font-medium text-gray-700">
          {displayLabel}
        </label>
      )}

      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition ${
            mode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link className="w-3 h-3" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition ${
            mode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
      </div>

      {/* URL Input */}
      {mode === 'url' && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      )}

      {/* Upload Input */}
      {mode === 'upload' && (
        <label className="block w-full py-6 border-2 border-dashed border-gray-200 rounded-lg text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="text-emerald-600">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="text-gray-500">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span className="text-sm">
                {language === 'bn' ? 'ছবি আপলোড করুন' : 'Click to upload'}
              </span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}

export const ImageEditor = memo(ImageEditorBase);
