/**
 * Store Image Upload Component
 * 
 * Reusable image upload with browser-side compression.
 * Uses existing /api/upload-image endpoint and compressImage utility.
 */

import { useState, useCallback, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';

interface StoreImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
  aspectRatio?: 'square' | 'banner' | 'logo';
  maxWidth?: number;
  maxHeight?: number;
}

export function StoreImageUpload({
  value,
  onChange,
  folder = 'store',
  label = 'Upload Image',
  hint,
  aspectRatio = 'square',
  maxWidth = 1200,
  maxHeight = 1200,
}: StoreImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();

  // Aspect ratio styles
  const aspectStyles = {
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
    logo: 'aspect-square max-w-[120px]',
  };

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Compress image before upload
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality: 0.85,
        format,
      });

      console.log(`Image compressed: ${file.size} → ${compressedBlob.size} bytes (${Math.round((1 - compressedBlob.size / file.size) * 100)}% reduction)`);

      // Upload to R2
      const formData = new FormData();
      formData.append('file', new File([compressedBlob], `upload.${format}`, { type: `image/${format}` }));
      formData.append('folder', folder);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: { success?: boolean; url?: string; error?: string } = {};
      if (contentType.includes('application/json')) {
        data = (await response.json()) as { success?: boolean; url?: string; error?: string };
      } else {
        const text = await response.text();
        const statusText = response.status ? `HTTP ${response.status}` : 'Upload failed';
        data = { error: `${statusText}: ${text.slice(0, 120)}` };
      }

      if (response.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || `Upload failed (HTTP ${response.status})`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [folder, maxWidth, maxHeight, onChange]);

  // Handle drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFile]);

  // Remove image
  const handleRemove = useCallback(() => {
    onChange('');
    setError(null);
  }, [onChange]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {value ? (
        // Preview mode
        <div className={`relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${aspectStyles[aspectRatio]}`}>
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload mode
        <div
          className={`relative rounded-lg border-2 border-dashed transition cursor-pointer ${
            dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
          } ${aspectStyles[aspectRatio]}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
