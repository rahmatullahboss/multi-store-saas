import { useState } from 'react';
import { Link, useParams } from '@remix-run/react';
import { ShoppingCart, Star, ShieldCheck, Truck, Cpu, ChevronRight } from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';

interface TechProductProps {
  product: SerializedProduct;
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
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  // Helper for navigation
  const handleNav = (path: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  // Mock specs if not in DB
  const specs = [
    { label: 'Brand', value: 'TechBrand' },
    { label: 'Warranty', value: '1 Year Official' },
    { label: 'Model', value: `TM-${product.id}X` },
    { label: 'Availability', value: 'In Stock' },
  ];

  const images = product.imageUrl ? [product.imageUrl] : [];

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
                <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-blue-700 text-xs font-bold">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  4.8
                </div>
                <span className="text-sm text-gray-500">124 Reviews</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {currencySymbol}
                  {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {currencySymbol}
                    {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">+ VAT included where applicable</p>
            </div>

            {/* Specs Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <tbody>
                  {specs.map((spec, idx) => (
                    <tr key={idx} className="border-b last:border-0 border-gray-100">
                      <td className="py-2 px-4 bg-gray-50 font-medium text-gray-600 w-1/3">
                        {spec.label}
                      </td>
                      <td className="py-2 px-4 text-gray-800">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

        {/* Description & Details */}
        <div className="mt-12 bg-white p-6 md:p-8 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-100">
            Product Description
          </h2>
          <div className="prose max-w-none text-gray-600">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>No description available for this product.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
