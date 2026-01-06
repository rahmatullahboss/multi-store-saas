/**
 * SearchInput - Debounced search input for filtering lists
 * Shopify-inspired design with clear button and loading state
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  value: externalValue,
  onChange,
  debounceMs = 300,
  loading = false,
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue || '');

  // Sync with external value
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
