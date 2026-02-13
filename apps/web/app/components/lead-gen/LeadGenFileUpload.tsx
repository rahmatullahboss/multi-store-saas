/**
 * Lead Gen File Upload Component
 *
 * Client-side file upload with image compression:
 * - Images: compressed before upload (WebP, max 1200px, 80% quality)
 * - PDFs: uploaded directly (no compression)
 *
 * Usage:
 * <LeadGenFileUpload name="resume" label="Upload Resume" accept="image,pdf" />
 */

import { useState, useRef } from 'react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';

interface LeadGenFileUploadProps {
  name: string;
  label: string;
  accept?: 'image' | 'pdf' | 'image,pdf' | 'image,pdf';
  maxSize?: number;
  required?: boolean;
  primaryColor?: string;
  value?: string;
  onChange?: (url: string) => void;
}

export function LeadGenFileUpload({
  name,
  label,
  accept = 'image,pdf',
  maxSize = 5 * 1024 * 1024,
  required = false,
  primaryColor = '#4F46E5',
  value,
  onChange,
}: LeadGenFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = accept.split(',').map((t) => t.trim());
  const allowImages = acceptTypes.includes('image');
  const allowPdf = acceptTypes.includes('pdf');

  const getAcceptString = () => {
    const types: string[] = [];
    if (allowImages) types.push('image/jpeg', 'image/png', 'image/webp', 'image/gif');
    if (allowPdf) types.push('application/pdf');
    return types.join(',');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (isPdf && !allowPdf) {
      setError('PDF files are not allowed');
      return;
    }

    if (isImage && !allowImages) {
      setError('Image files are not allowed');
      return;
    }

    if (!isPdf && !isImage) {
      setError('Invalid file type');
      return;
    }

    try {
      setUploading(true);

      let fileToUpload: File = file;

      // Compress images before upload (NOT for PDFs)
      if (isImage) {
        const format = getOptimalFormat();
        const compressedBlob = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          format: format,
        });
        const extension = format === 'webp' ? 'webp' : 'jpg';
        fileToUpload = new File([compressedBlob], `upload.${extension}`, {
          type: `image/${format}`,
        });
        console.log(
          `🖼️ Image compressed: ${file.size} → ${fileToUpload.size} bytes (${Math.round((fileToUpload.size / file.size) * 100)}%)`
        );
      } else {
        console.log(`📄 PDF uploaded directly (no compression): ${file.size} bytes`);
      }

      // Upload to R2
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', 'leads');

      const response = await fetch('/api/lead-gen-upload', {
        method: 'POST',
        body: formData,
      });

      const data: { success?: boolean; url?: string; error?: string } = await response.json();

      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Upload failed');
      }

      setPreview(data.url);
      onChange?.(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    onChange?.('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isPdf = fileName.toLowerCase().endsWith('.pdf') || (preview && preview.endsWith('.pdf'));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={getAcceptString()}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="py-4">
              <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="py-4">
              <svg
                className="w-10 h-10 text-gray-400 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-medium" style={{ color: primaryColor }}>
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {allowImages && allowPdf
                  ? 'Images (JPEG, PNG, WebP) or PDF up to 10MB'
                  : allowImages
                    ? 'Images (JPEG, PNG, WebP) up to 5MB'
                    : 'PDF up to 10MB'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-3">
            {isPdf ? (
              <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                style={{ color: primaryColor }}
              >
                View file
              </a>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              disabled={uploading}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={preview || ''} />
    </div>
  );
}
