import { useState, useEffect, useRef } from 'react';
import { useFetcher, Link } from 'react-router';
import { Search, Loader2 } from 'lucide-react';
import { formatMoney } from '~/utils/money';
import { cn } from '~/utils/cn';

interface SearchResult {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  slug: string;
}

interface SearchBarProps {
  storeId: number;
  theme?: {
    primary?: string;
    background?: string;
    text?: string;
    muted?: string;
  };
}

export function SearchBar({ storeId, theme = {} }: SearchBarProps) {
  const fetcher = useFetcher<{ products: SearchResult[] }>();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetcher.load(`/api/store-search?q=${encodeURIComponent(query)}&storeId=${storeId}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, storeId]); // Remove fetcher.load from dependencies to avoid infinite loop

  const isLoading = fetcher.state === 'loading';
  const products = fetcher.data?.products || [];
  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          className={cn(
            "w-full px-4 py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2",
            "bg-white border-gray-200 focus:ring-blue-500 transition-shadow"
          )}
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            borderColor: theme.muted ? `${theme.muted}40` : undefined,
          }}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" style={{ color: theme.text }} />
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
          style={{ backgroundColor: theme.background, color: theme.text }}
        >
          {isLoading && products.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : products.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <Search className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: theme.primary }}>
                        {formatMoney(product.price)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
