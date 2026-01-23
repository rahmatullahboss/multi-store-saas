/**
 * Searchable Select Component
 * 
 * A type-ahead autocomplete dropdown with keyboard navigation.
 * Perfect for long lists like districts/upazilas.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  id: string;
  name: string;
  nameEn?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  // Styling
  inputBg?: string;
  inputBorder?: string;
  inputText?: string;
  primaryColor?: string;
  mutedColor?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'সার্চ করুন...',
  label,
  required = false,
  disabled = false,
  inputBg = '#FFFFFF',
  inputBorder = '#E5E7EB',
  inputText = '#111827',
  primaryColor = '#6366F1',
  mutedColor = '#6B7280',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected option for display
  const selectedOption = options.find(opt => opt.id === value);

  // Filter options based on query
  const filteredOptions = query === ''
    ? options
    : options.filter((opt) => {
        const searchText = `${opt.name} ${opt.nameEn || ''}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted="true"]');
      highlighted?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback((optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setQuery('');
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: mutedColor }}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Input Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`w-full px-4 py-3.5 rounded-xl font-medium outline-none transition-all cursor-pointer flex items-center justify-between gap-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{ 
          backgroundColor: inputBg, 
          border: `2px solid ${value ? primaryColor : inputBorder}`,
          color: inputText,
        }}
      >
        <span className={selectedOption ? '' : 'opacity-50'}>
          {selectedOption ? `${selectedOption.name} (${selectedOption.nameEn})` : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              style={{ color: mutedColor }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown 
            size={18} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: mutedColor }}
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-1 rounded-xl shadow-2xl overflow-hidden"
          style={{ 
            backgroundColor: inputBg,
            border: `2px solid ${primaryColor}`,
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b" style={{ borderColor: inputBorder }}>
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: mutedColor }}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="টাইপ করে সার্চ করুন..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ 
                  backgroundColor: inputBg,
                  border: `1px solid ${inputBorder}`,
                  color: inputText,
                }}
              />
            </div>
          </div>

          {/* Options List */}
          <div 
            ref={listRef}
            className="max-h-60 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: mutedColor }}>
                কোনো ফলাফল পাওয়া যায়নি
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.id}
                  data-highlighted={index === highlightedIndex}
                  onClick={() => handleSelect(option.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                    index === highlightedIndex ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  } ${option.id === value ? 'font-semibold' : ''}`}
                  style={{
                    color: inputText,
                    backgroundColor: index === highlightedIndex ? `${primaryColor}10` : undefined,
                  }}
                >
                  <span>{option.name}</span>
                  <span className="text-xs opacity-60">{option.nameEn}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
