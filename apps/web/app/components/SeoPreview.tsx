import React from 'react';

interface SeoPreviewProps {
  title: string;
  description: string;
  slug: string;
  urlPrefix?: string;
  previewLabel?: string;
}

export function SeoPreview({
  title,
  description,
  slug,
  urlPrefix = 'yourstore.com/products/',
  previewLabel = 'Google Preview:',
}: SeoPreviewProps) {
  // Truncate logic similar to Google Search
  const displayTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
  const displayDescription = description.length > 160 ? description.substring(0, 160) + '...' : description;
  const displayUrl = `${urlPrefix}${slug}`;

  // Character count color coding
  const titleCount = title.length;
  const descriptionCount = description.length;

  const getCountColor = (count: number, max: number) => {
    if (count === 0) return 'text-gray-500';
    if (count > max) return 'text-red-500';
    if (count > max - 10) return 'text-yellow-600'; // Warning when close to limit
    return 'text-green-600'; // Good
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-xs text-gray-500 mb-3">{previewLabel}</p>

      {/* The Google Search Snippet */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 max-w-2xl">
        {/* URL */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500 font-bold">
            W
          </div>
          <div>
            <span className="text-sm text-gray-900 font-medium break-all">
              {urlPrefix.replace(/\/$/, '')} <span className="text-gray-500 font-normal">› products › {slug}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer truncate font-medium leading-tight mb-1">
          {displayTitle || 'Product Title | Store Name'}
        </h4>

        {/* Description */}
        <p className="text-[14px] text-[#4d5156] line-clamp-2 leading-snug break-words">
          {displayDescription || 'This is how your product description will appear in search results. Make it compelling to increase click-through rates.'}
        </p>
      </div>

      {/* Character Counters */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
          <span className="text-gray-600">Title Length:</span>
          <span className={`font-medium ${getCountColor(titleCount, 60)}`}>
            {titleCount} / 60
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
          <span className="text-gray-600">Description Length:</span>
          <span className={`font-medium ${getCountColor(descriptionCount, 160)}`}>
            {descriptionCount} / 160
          </span>
        </div>
      </div>
    </div>
  );
}
