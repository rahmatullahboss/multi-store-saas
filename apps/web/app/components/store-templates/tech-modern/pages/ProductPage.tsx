import { sanitizeHtml } from '~/utils/sanitize';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@remix-run/react';
import { ShoppingCart, Star, ShieldCheck, Truck, Cpu, ChevronRight } from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { formatPrice } from '~/lib/formatting';

interface TechProductProps {
  product: SerializedProduct & {
    specifications?: Record<string, string>;
    shippingInfo?: string | null;
    returnPolicy?: string | null;
    reviews?: { average: number; count: number };
  };
  currency: string;
  relatedProducts?: SerializedProduct[];
  isPreview?: boolean;
  onNavigateProduct?: (productId: number) => void;
  onNavigate?: (path: string) => void;
}

export function TechModernProductPage({
  product,
  currency,
  relatedProducts = [],
  isPreview = false,
  onNavigateProduct,
  onNavigate,
}: TechProductProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>(
    'description'
  );
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  // Helper for navigation
  const handleNav = (path: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const specifications = product.specifications || {};
  const hasSpecifications = Object.keys(specifications).length > 0;
  const hasShipping = Boolean(
    (product.shippingInfo && product.shippingInfo.trim().length > 0) ||
      (product.returnPolicy && product.returnPolicy.trim().length > 0)
  );
  const hasReviews = Boolean(product.reviews && product.reviews.count > 0);

  const tabs = useMemo(() => {
    const next: Array<{
      id: 'description' | 'specifications' | 'shipping' | 'reviews';
      label: string;
    }> = [{ id: 'description', label: 'Description' }];
    if (hasSpecifications) next.push({ id: 'specifications', label: 'Specifications' });
    if (hasShipping) next.push({ id: 'shipping', label: 'Shipping & Returns' });
    if (hasReviews) next.push({ id: 'reviews', label: `Reviews (${product.reviews?.count || 0})` });
    return next;
  }, [hasSpecifications, hasShipping, hasReviews, product.reviews?.count]);

  // Keep active tab valid when tabs change (e.g. when data becomes absent).
  useEffect(() => {
    if (tabs.length === 0) return;
    if (!tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, tabs]);

  const images = product.imageUrl ? [product.imageUrl] : [];
  const isInStock = product.inventory == null ? true : product.inventory > 0;
  const rating = product.reviews?.average;
  const reviewCount = product.reviews?.count;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-12">
      {/* Breadcrumb - Technical Style */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-8 text-xs font-medium text-gray-500 uppercase tracking-wide">
        {onNavigate ? (
          <button onClick={(e) => handleNav('/', e)} className="hover:text-blue-600">
            Home
          </button>
        ) : (
          <PreviewSafeLink to="/" className="hover:text-blue-600" isPreview={isPreview}>
            Home
          </PreviewSafeLink>
        )}
        <span className="mx-2">/</span>
        {onNavigate ? (
          <button onClick={(e) => handleNav('/products', e)} className="hover:text-blue-600">
            Products
          </button>
        ) : (
          <PreviewSafeLink to="/products" className="hover:text-blue-600" isPreview={isPreview}>
            Products
          </PreviewSafeLink>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-gray-200">
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-4 overflow-hidden border border-gray-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Cpu className="w-24 h-24 text-gray-300" />
              )}
            </div>
            {/* Thumbnails would go here */}
          </div>

          {/* Middle: Info */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {typeof rating === 'number' && typeof reviewCount === 'number' && (
                  <>
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-blue-700 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      {rating.toFixed(1)}
                    </div>
                    <span className="text-sm text-gray-500">{reviewCount} Reviews</span>
                    <span className="text-gray-300">|</span>
                  </>
                )}
                <span className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                  {isInStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">+ VAT included where applicable</p>
            </div>

            {/* Specs Table (only when real data exists) */}
            {hasSpecifications && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <tbody>
                    {Object.entries(specifications).map(([label, value]) => (
                      <tr key={label} className="border-b last:border-0 border-gray-100">
                        <td className="py-2 px-4 bg-gray-50 font-medium text-gray-600 w-1/3">
                          {label}
                        </td>
                        <td className="py-2 px-4 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Features List */}
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> 1 Year Official Warranty
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" /> Fast Delivery (2-3 Days)
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" /> 100% Authentic Product
              </li>
            </ul>
          </div>

          {/* Right: Buy Actions (Sticky on Desktop) */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Purchase Options</h3>

              <div className="space-y-3">
                <AddToCartButton
                  productId={product.id}
                  storeId={product.storeId}
                  productPrice={product.price}
                  productName={product.title}
                  isPreview={isPreview}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </AddToCartButton>

                <AddToCartButton
                  productId={product.id}
                  storeId={product.storeId}
                  productPrice={product.price}
                  productName={product.title}
                  isPreview={isPreview}
                  mode="buy_now"
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Buy Now
                </AddToCartButton>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Safe Payment</p>
                <div className="flex gap-2">
                  {/* Payment Icons Placeholders */}
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs (real data only; no demo placeholders) */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex flex-wrap gap-2 px-4 pt-4 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-700 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description || '') }} />
                ) : (
                  <p>No description available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && hasSpecifications && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <tbody>
                    {Object.entries(specifications).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-0 border-gray-100">
                        <td className="py-3 pr-4 font-semibold text-gray-700 w-1/3">{key}</td>
                        <td className="py-3 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && hasShipping && (
              <div className="space-y-6 text-gray-600">
                {product.shippingInfo && product.shippingInfo.trim().length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Shipping</h3>
                    <p className="whitespace-pre-line">{product.shippingInfo}</p>
                  </div>
                )}
                {product.returnPolicy && product.returnPolicy.trim().length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Returns</h3>
                    <p className="whitespace-pre-line">{product.returnPolicy}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && hasReviews && (
              <div className="text-gray-600">
                <p>
                  Average rating: <span className="font-semibold text-gray-900">{rating?.toFixed(1)}</span> / 5
                </p>
                <p>Total reviews: <span className="font-semibold text-gray-900">{reviewCount}</span></p>
                <p className="mt-3 text-sm text-gray-500">
                  Detailed review list UI is available in the shared product page; Tech Modern currently shows summary only.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
