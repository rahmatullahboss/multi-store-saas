import { type StoreTemplateTheme } from '~/templates/store-registry';

export const SOKOL_THEME: StoreTemplateTheme = {
  primary: '#0D0D0D',      // Deep Black
  accent: '#E11D48',       // Rose-600 - Bold accent
  background: '#FAFAFA',   // Off-white
  text: '#0D0D0D',
  muted: '#6B7280',
  cardBg: '#FFFFFF',
  headerBg: 'rgba(255, 255, 255, 0.98)',
  footerBg: '#0D0D0D',
  footerText: '#F5F5F5',
};

// Default sections with dummy products for Sokol theme
export const SOKOL_DEFAULT_SECTIONS = [
  {
    id: 'sokol-hero-1',
    type: 'hero',
    settings: {
      heading: 'Premium Collection',
      subheading: 'Discover handpicked products for modern living',
      primaryAction: { label: 'Shop Now', url: '/#products' },
      secondaryAction: { label: 'Explore Categories', url: '/collections' },
      alignment: 'center',
      layout: 'standard',
      paddingTop: 'none',
      paddingBottom: 'none',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    }
  },
  {
    id: 'sokol-features-1',
    type: 'features',
    settings: {
      heading: 'Why Choose Us',
      backgroundColor: '#FAFAFA',
      features: [
        { icon: '🚚', title: 'Free Shipping', description: 'On orders over ৳2000' },
        { icon: '🔒', title: 'Secure Payment', description: '100% secure checkout' },
        { icon: '💯', title: 'Quality Guarantee', description: 'Premium products only' },
        { icon: '🔄', title: 'Easy Returns', description: '7-day return policy' },
      ],
      paddingTop: 'large',
      paddingBottom: 'large',
    }
  },
  {
    id: 'sokol-categories-1',
    type: 'category-list',
    settings: {
      heading: 'Shop by Category',
      subheading: 'Find what you love',
      layout: 'grid',
      limit: 6,
      paddingTop: 'large',
      paddingBottom: 'large',
    }
  },
  {
    id: 'sokol-products-1',
    type: 'product-grid',
    settings: {
      heading: 'Featured Products',
      subheading: 'Our top picks for you',
      productCount: 8,
      paddingTop: 'large',
      paddingBottom: 'large',
      addToCartText: 'Add to Cart',
      showWishlist: true,
    }
  },
  {
    id: 'sokol-banner-1',
    type: 'banner',
    settings: {
      heading: 'Special Offer',
      subheading: 'Up to 50% off on selected items',
      primaryAction: { label: 'Shop Sale', url: '/collections/sale' },
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
      paddingTop: 'large',
      paddingBottom: 'large',
    }
  },
  {
    id: 'sokol-scroll-1',
    type: 'product-scroll',
    settings: {
      heading: 'New Arrivals',
      limit: 10,
      mode: 'default',
      paddingTop: 'large',
      paddingBottom: 'large',
    }
  },
  {
    id: 'sokol-newsletter-1',
    type: 'newsletter',
    settings: {
      heading: 'Join Our Newsletter',
      subheading: 'Subscribe for exclusive offers and updates',
      alignment: 'center',
      paddingTop: 'large',
      paddingBottom: 'large',
      buttonText: 'Subscribe',
      placeholderText: 'Enter your email',
      successMessage: 'Thanks for subscribing!',
    }
  },
];

// Dummy products for preview mode
export const SOKOL_DUMMY_PRODUCTS = [
  {
    id: 1,
    storeId: 1,
    title: 'Classic White Sneakers',
    description: 'Premium leather sneakers for everyday comfort',
    price: 2499,
    compareAtPrice: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    category: 'Footwear',
  },
  {
    id: 2,
    storeId: 1,
    title: 'Minimal Watch',
    description: 'Elegant minimalist watch with leather strap',
    price: 3999,
    compareAtPrice: 5499,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    category: 'Accessories',
  },
  {
    id: 3,
    storeId: 1,
    title: 'Premium Backpack',
    description: 'Water-resistant backpack for daily use',
    price: 1899,
    compareAtPrice: 2599,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    category: 'Bags',
  },
  {
    id: 4,
    storeId: 1,
    title: 'Wireless Earbuds',
    description: 'High-quality audio with noise cancellation',
    price: 4999,
    compareAtPrice: 6999,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    category: 'Electronics',
  },
  {
    id: 5,
    storeId: 1,
    title: 'Cotton T-Shirt',
    description: 'Soft premium cotton essential t-shirt',
    price: 899,
    compareAtPrice: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    category: 'Clothing',
  },
  {
    id: 6,
    storeId: 1,
    title: 'Sunglasses',
    description: 'UV400 protection polarized sunglasses',
    price: 1599,
    compareAtPrice: 2199,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    category: 'Accessories',
  },
  {
    id: 7,
    storeId: 1,
    title: 'Running Shoes',
    description: 'Lightweight running shoes with cushioned sole',
    price: 3299,
    compareAtPrice: 4499,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    category: 'Footwear',
  },
  {
    id: 8,
    storeId: 1,
    title: 'Leather Wallet',
    description: 'Genuine leather bi-fold wallet',
    price: 1299,
    compareAtPrice: 1799,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    category: 'Accessories',
  },
];

export const SOKOL_DUMMY_CATEGORIES = [
  'Footwear',
  'Accessories',
  'Bags',
  'Electronics',
  'Clothing',
];
