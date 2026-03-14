import { sanitizeHtml } from '~/utils/sanitize';
import { useState } from 'react';
import { ShoppingBag, Star, Minus, Plus, Heart, Share2, Truck, RotateCcw } from 'lucide-react';
import { RovoLayout } from '~/components/store/rovo/RovoLayout';
import { RovoHeader } from '~/components/store/rovo/RovoHeader';
import { RovoFooter } from '~/components/store/rovo/RovoFooter';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { SocialLinks } from '@db/types';
import { formatPrice } from '~/lib/formatting';

interface Product {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images?: string;
  category: string | null;
  sku?: string | null;
  inventory?: number | null;
  brand?: string | null;
}

interface RovoProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
  storeName: string;
  storeId: number;
  logo?: string | null;
  currency?: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: any;
  categories?: (string | null)[];
}

export function RovoProductDetail({
  product,
  relatedProducts = [],
  storeName,
  storeId,
  logo,
  currency = 'BDT',
  socialLinks,
  businessInfo,
  categories = [],
}: RovoProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images: string[] = product.images
    ? JSON.parse(product.images)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const filteredCategories = categories.filter((c): c is string => c !== null);

  const handleAddToCartClick = () => {
    // Trigger global cart drawer after add-to-cart action
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 300);
  };

  return (
    <RovoLayout
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      categories={filteredCategories}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      config={null}
      products={[product]}
    >
      <RovoHeader
        storeName={storeName}
        logo={logo}
        categories={filteredCategories}
        currentCategory={product.category}
        socialLinks={socialLinks}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Gallery */}
          <div className="md:sticky md:top-24 h-fit">
            <div className="relative overflow-hidden rounded-sm bg-gray-50 mb-4 group aspect-[3/4] md:aspect-square">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingBag size={64} />
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square overflow-hidden rounded-sm border-2 transition-all ${
                      selectedImage === i
                        ? 'border-black opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <nav className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
              Home / {product.category || 'Shop'} /{' '}
              <span className="text-black">{product.title}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-tight mb-2">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(No reviews yet)</span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-2xl font-bold text-red-600">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
              <p>{product.description?.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-bold uppercase tracking-wide min-w-[3rem]">Qty:</span>
                <div className="flex items-center border border-gray-300 rounded-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div onClick={handleAddToCartClick}>
                  <AddToCartButton
                    productId={product.id}
                    storeId={storeId}
                    productName={product.title}
                    productPrice={product.price}
                    currency={currency}
                    className="w-full bg-black text-white hover:bg-gray-900 h-12 uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </AddToCartButton>
                </div>

                <AddToCartButton
                  productId={product.id}
                  storeId={storeId}
                  mode="buy_now"
                  className="w-full bg-red-600 text-white hover:bg-red-700 h-12 uppercase tracking-widest font-bold"
                >
                  Buy It Now
                </AddToCartButton>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-black transition-colors">
                  <Heart className="w-4 h-4" /> Add to Wishlist
                </button>
                <button className="flex items-center gap-1 hover:text-black transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over Tk 1,500</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5" />
                <span>7-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mt-20 border-t pt-10">
          <h2 className="text-2xl font-heading font-bold uppercase mb-6 text-center">
            Product Description
          </h2>
          <div
            className="prose max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description || '') }}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-heading font-bold uppercase mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <a key={p.id} href={`/products/${p.id}`} className="group">
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                    <img
                      src={p.imageUrl || ''}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-sm uppercase">{p.title}</h3>
                  <p className="text-gray-500 text-sm">{formatPrice(p.price)}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <RovoFooter
        storeName={storeName}
        logo={logo}
        businessInfo={businessInfo}
        socialLinks={socialLinks}
        categories={filteredCategories}
      />
    </RovoLayout>
  );
}
