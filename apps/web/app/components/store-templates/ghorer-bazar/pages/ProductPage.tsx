import { sanitizeHtml } from '~/utils/sanitize';
import { useState } from 'react';
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, CheckCircle } from 'lucide-react';
import { GHORER_BAZAR_THEME } from '../theme';
import type { Product } from '@db/schema';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { formatPrice } from '~/lib/formatting';

interface ProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  isPreview?: boolean;
}

export function GhorerBazarProductPage({
  product,
  currency,
  relatedProducts = [],
  isPreview = false,
}: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  // Parse images
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images as string);
      if (Array.isArray(parsed)) images.push(...parsed);
    } catch {
      // ignore
    }
  }
  const [selectedImage, setSelectedImage] = useState(0);

  const discount =
    product.compareAtPrice && product.compareAtPrice > (product.price ?? 0)
      ? Math.round((1 - (product.price ?? 0) / product.compareAtPrice) * 100)
      : 0;

  return (
    <div
      className="min-h-screen bg-[#f9f9f9]"
      style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 flex items-center gap-2 text-gray-500">
          <PreviewSafeLink to="/" className="hover:text-[#fc8934]" isPreview={isPreview}>
            হোম
          </PreviewSafeLink>
          <span>/</span>
          {product.category && (
            <>
              <PreviewSafeLink
                to={`/?category=${product.category}`}
                className="hover:text-[#fc8934]"
                isPreview={isPreview}
              >
                {product.category}
              </PreviewSafeLink>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 font-medium">{product.title}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Image Section */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 mb-4">
                {images[selectedImage] && (
                  <img
                    src={images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-[#e53935] text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}% ছাড়
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-md border-2 overflow-hidden ${
                        selectedImage === i ? 'border-[#fc8934]' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                  স্টক এ আছে
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-500">Code: {product.sku || 'N/A'}</span>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-bold text-[#fc8934]">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-sm text-[#e53935] font-medium">
                    আপনি {formatPrice((product.compareAtPrice ?? 0) - (product.price ?? 0))} সাশ্রয়
                    করছেন
                  </p>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 rounded-l-lg transition"
                  >
                    <Minus size={18} className="text-gray-600" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 rounded-r-lg transition"
                  >
                    <Plus size={18} className="text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 flex gap-3">
                  <AddToCartButton
                    productId={product.id}
                    storeId={product.storeId}
                    productPrice={product.price ?? 0}
                    productName={product.title}
                    isPreview={isPreview}
                    className="flex-1 bg-[#fc8934] hover:bg-[#e67e22] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    কার্টে যোগ করুন
                  </AddToCartButton>

                  <AddToCartButton
                    productId={product.id}
                    storeId={product.storeId}
                    productPrice={product.price ?? 0}
                    productName={product.title}
                    isPreview={isPreview}
                    mode="buy_now"
                    className="flex-1 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    অর্ডার করুন
                  </AddToCartButton>
                </div>
              </div>

              {/* Features/Trust */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#fc8934]">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">দ্রুত ডেলিভারি</p>
                    <p className="text-xs text-gray-500">পুরো বাংলাদেশে</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#fc8934]">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">অরিজিনাল পণ্য</p>
                    <p className="text-xs text-gray-500">১০০% গ্যারান্টি</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#fc8934] rounded-full"></span>
                  পণ্যর বিবরণ
                </h3>
                <div
                  className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description || 'কোনো বিবরণ নেই') }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">অন্যান্য পণ্য দেখুন</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map((p) => (
                <PreviewSafeLink
                  key={p.id}
                  to={`/products/${p.id}`}
                  isPreview={isPreview}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group border border-gray-100"
                >
                  <div className="aspect-square relative bg-gray-50">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    )}
                    {/* Floating Add Button */}
                    <div className="absolute bottom-2 right-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <AddToCartButton
                        productId={p.id}
                        storeId={p.storeId}
                        productPrice={p.price ?? 0}
                        productName={p.title}
                        isPreview={isPreview}
                        className="bg-[#fc8934] text-white p-2 rounded-full shadow-lg hover:bg-[#e67e22]"
                      >
                        <Plus size={20} />
                      </AddToCartButton>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-10 group-hover:text-[#fc8934] transition">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#fc8934]">{formatPrice(p.price)}</span>
                      {p.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </PreviewSafeLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
