/**
 * CTA/Order Form Section Preview
 * 
 * Now uses the modular order-form system with completely different designs per variant.
 * This file is a simple wrapper that delegates to OrderFormSection.
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { OrderFormSection } from './order-form';

// Product data passed from page loader
interface ProductInfo {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description?: string | null;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

// Selected product for multi-product pages
interface SelectedProductInfo {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
}

interface CTASectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
  // Required for order submission on live pages
  storeId?: number;
  productId?: number;
  product?: ProductInfo | null;
  // Multiple products for dropdown in multi-product pages
  selectedProducts?: SelectedProductInfo[];
  // Real data from DB for urgency/social proof (no fake numbers!)
  realData?: {
    stockCount: number | null;
    recentOrderCount: number;
  };
}

export function CTASectionPreview({ props, theme, storeId, productId, product, selectedProducts, realData }: CTASectionPreviewProps) {
  return (
    <OrderFormSection 
      props={props}
      theme={theme}
      storeId={storeId}
      productId={productId}
      product={product}
      selectedProducts={selectedProducts}
      realData={realData}
    />
  );
}
