/**
 * Page Builder - Compact Image Upload Component
 * 
 * A smaller version of StoreImageUpload for use in the properties panel.
 * Features:
 * - Drag & drop support
 * - Client-side compression via compressImage utility
 * - Upload to R2 via /api/upload-image
 * - Compact UI for inline form fields
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';

interface BuilderImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function BuilderImageUpload({
  value,
  onChange,
  label = 'Image',
  maxWidth = 1200,
  maxHeight = 1200,
}: BuilderImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection and upload
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only images allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Max file size is 10MB');
      return;
    }

    setIsUploading(true);
    setProgress(10);
    setError(null);

    try {
      // Compress image before upload
      setProgress(30);
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality: 0.85,
        format,
      });

      setProgress(60);

      // Upload to R2
      const formData = new FormData();
      formData.append('file', new File([compressedBlob], `upload.${format}`, { type: `image/${format}` }));
      formData.append('folder', 'builder');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      setProgress(90);

      const data = await response.json() as { success?: boolean; url?: string; error?: string };

      if (data.success && data.url) {
        onChange(data.url);
        setProgress(100);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [maxWidth, maxHeight, onChange]);

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
    e.target.value = '';
  }, [handleFile]);

  // Remove image and delete from R2 if it was uploaded there
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleRemove = useCallback(async () => {
    // Only delete from R2 if it's an R2 URL (contains r2.dev or our R2 domain)
    const isR2Url = value && (value.includes('r2.dev') || value.includes('/builder/'));
    
    if (isR2Url) {
      setIsDeleting(true);
      try {
        const formData = new FormData();
        formData.append('imageUrl', value);
        
        const response = await fetch('/api/delete-image', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json() as { success?: boolean; error?: string };
        if (data.success) {
          console.log('[R2] Deleted image:', value);
        } else {
          console.warn('[R2] Failed to delete:', data.error);
        }
      } catch (err) {
        console.error('[R2] Delete error:', err);
      } finally {
        setIsDeleting(false);
      }
    }
    
    onChange('');
    setError(null);
  }, [value, onChange]);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      
      {value ? (
        // Preview mode - compact
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-24">
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
            disabled={isDeleting}
            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-full shadow transition"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </button>
        </div>
      ) : (
        // Upload mode - compact
        <div
          className={`relative rounded-lg border-2 border-dashed transition cursor-pointer h-20 ${
            dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
          }`}
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
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin mb-1" />
                <p className="text-xs text-gray-500">Uploading... {progress}%</p>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Click or drag</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Also allow URL paste */}
      {!value && !isUploading && (
        <input
          type="text"
          placeholder="Or paste image URL..."
          className="mt-2 w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          onBlur={(e) => {
            if (e.target.value.startsWith('http')) {
              onChange(e.target.value);
              e.target.value = '';
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.startsWith('http')) {
                onChange(input.value);
                input.value = '';
              }
            }
          }}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
