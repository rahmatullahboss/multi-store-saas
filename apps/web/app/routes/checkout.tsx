/**
 * Checkout Page
 *
 * Handles the final step of the purchase flow.
 * - Reads cart from localStorage
 * - Fetches fresh product data/prices from server
 * - Collects Customer Info
 * - Handles Shipping Logic (Inside/Outside Dhaka)
 * - Processes Payment Selection
 * - Submits to /api/create-order
 */

import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigate, Link, useSearchParams } from '@remix-run/react';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { abandonedCarts, products, orderBumps, productVariants } from '@db/schema';
import * as schema from '@db/schema';
import {
  getUnifiedStorefrontSettings,
  toLegacyFormat,
  getShippingConfigFromUnified,
} from '~/services/unified-storefront-settings.server';

interface CartItem {
  productId: number;
  quantity: number;
  variantId?: number;
}

interface CartProduct {
  id: number;
  variantId?: number;
  title: string;
  price: number;
  imageUrl: string | null;
  inventory: number;
  isPublished: boolean;
}

interface BumpProduct {
  id: number;
  title?: string;
  productTitle?: string;
  productImage?: string | null;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
}

interface Discount {
  code: string;
  amount: number;
}

interface FetcherData {
  products?: CartProduct[];
  recoveredCartItems?: CartItem[];
  discountResult?: {
    isValid: boolean;
    error?: string;
    discount?: Discount;
  };
}

interface OrderFetcherData {
  success?: boolean;
  orderId?: string;
  total?: number;
  upsellUrl?: string;
  paymentRedirectUrl?: string;
  orderNumber?: string;
  error?: string;
}

interface ManualPaymentConfig {
  [key: string]: string | number | boolean | null | undefined;
}
import { useTranslation } from '~/contexts/LanguageContext';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { PaymentMethodSelector } from '~/components/checkout/PaymentMethodSelector';
import { SearchableSelect } from '~/components/SearchableSelect';
import { DISTRICTS, UPAZILAS, getShippingZone } from '~/data/bd-locations';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Loader2, ArrowLeft, ShoppingBag, ShieldCheck, Truck, CheckCircle } from 'lucide-react';
import { getCustomer } from '~/services/customer-auth.server';
import type { CustomerAddress } from '~/services/customer-account.server';
import { resolveTemplate } from '~/lib/template-resolver.server';
import { toast } from 'sonner';
import { validateDiscount } from '~/../server/services/discount.service';
import { TicketPercent } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import {
  getAllowedCheckoutPaymentMethods,
  getDefaultPaymentMethodForPlan,
  type CheckoutPaymentMethod,
} from '~/lib/payment-policy';
import type { ThemeConfig } from '@db/types';

// Helper: Convert English numbers to Bangla
const toBanglaNumber = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num)
    .split('')
    .map((char) => {
      const digit = parseInt(char);
      return isNaN(digit) ? char : banglaDigits[digit];
    })
    .join('');
};

// Helper: Format price in Bangla
const formatBanglaPrice = (price: number, currency: string, lang: string): string => {
  if (lang === 'bn') {
    return `${currency} ${toBanglaNumber(price)}`;
  }
  return `${currency} ${price}`;
};

export const meta: MetaFunction = () => {
  return [{ title: 'Checkout - Secure Payment' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { store, storeId, cloudflare } = context;

  if (!store || !storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(cloudflare.env.DB, { schema });

  // Get unified settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId as number, {
    env: context.cloudflare.env,
  });
  const legacySettings = toLegacyFormat(unifiedSettings);
  const unifiedShippingConfig = getShippingConfigFromUnified(unifiedSettings);



  // Route guard: Check if store routes are enabled
  if (store.storeEnabled === false) {
    throw new Response('Store mode is not enabled for this shop.', { status: 404 });
  }

  // Use unified settings
  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? undefined,
    instagram: unifiedSettings.social.instagram ?? undefined,
    whatsapp: unifiedSettings.social.whatsapp ?? undefined,
    twitter: unifiedSettings.social.twitter ?? undefined,
    youtube: unifiedSettings.social.youtube ?? undefined,
    linkedin: unifiedSettings.social.linkedin ?? undefined,
  };



  const businessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };

  // Use unified shipping config
  const shippingConfig = unifiedShippingConfig;

  // Fetch manual payment config from store
  let manualPaymentConfig = {};
  try {
    if (store.manualPaymentConfig) {
      manualPaymentConfig = JSON.parse(store.manualPaymentConfig as string);
    }
  } catch (e) {
    console.error('Failed to parse manualPaymentConfig', e);
  }

  // Fetch Order Bumps
  const bumps = await db
    .select()
    .from(orderBumps)
    .where(and(eq(orderBumps.storeId, storeId as number), eq(orderBumps.isActive, true)))
    .orderBy(desc(orderBumps.displayOrder))
    .limit(3);

  // Fetch details for bump products
  let bumpProducts: BumpProduct[] = [];
  if (bumps.length > 0) {
    const bumpProductIds = bumps.map((b) => b.bumpProductId);
    const pResults = await db.select().from(products).where(inArray(products.id, bumpProductIds));

    bumpProducts = bumps
      .map((bump) => {
        const product = pResults.find((p) => p.id === bump.bumpProductId);
        if (!product) return null;
        return {
          ...bump,
          productTitle: product.title,
          productImage: product.imageUrl,
          originalPrice: product.price,
          discountedPrice: bump.discount
            ? Math.round(product.price * (1 - bump.discount / 100))
            : product.price,
          discount: bump.discount || 0,
        };
      })
      .filter(Boolean) as BumpProduct[];
  }

  // Load customer session for Google Sign-In header
  const customer = await getCustomer(request, cloudflare.env, cloudflare.env.DB);

  // Fetch customer addresses if logged in
  let customerAddresses: CustomerAddress[] = [];
  if (customer) {
    const { getCustomerAddresses } = await import('~/services/customer-account.server');
    customerAddresses = await getCustomerAddresses(customer.id, db);
  }

  // Fetch unique categories for footer
  const categoriesResult = await db
    .select({ category: products.category })
    .from(products)
    .where(and(eq(products.storeId, storeId as number), eq(products.isPublished, true)));

  const categories = [
    ...new Set(categoriesResult.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ];

  // ========== TEMPLATE RESOLUTION (New Template System) ==========
  const checkoutTemplate = await resolveTemplate(cloudflare.env.DB, storeId as number, 'checkout');

  return json({
    storeId: storeId as number,
    storeName: legacySettings.storeName || store.name,
    logo: legacySettings.logo || store.logo,
    currency: store.currency || 'BDT',
    storeTemplateId: legacySettings.storeTemplateId,
    theme: legacySettings.theme,
    socialLinks,
    businessInfo,
    themeConfig: legacySettings.themeConfig as unknown as ThemeConfig,
    shippingConfig,
    manualPaymentConfig,
    bumpProducts,
    facebookPixelId: store.facebookPixelId,
    planType: store.planType || 'free',
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          addresses: customerAddresses,
        }
      : null,
    checkoutTemplate,
    categories,
    // AI Chat props
    isCustomerAiEnabled: store.isCustomerAiEnabled ?? false,
    aiCredits: store.aiCredits ?? 0,
  });
}

// Action to fetch product details for cart items
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, cloudflare } = context;
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'recover-cart') {
    const sessionId = formData.get('sessionId')?.toString().trim();
    if (!sessionId || sessionId.length < 10) {
      return json({ recoveredCartItems: [] });
    }

    const db = drizzle(cloudflare.env.DB);
    const rows = await db
      .select({ cartItems: abandonedCarts.cartItems })
      .from(abandonedCarts)
      .where(
        and(
          eq(abandonedCarts.storeId, storeId as number),
          eq(abandonedCarts.sessionId, sessionId),
          eq(abandonedCarts.status, 'abandoned')
        )
      )
      .orderBy(desc(abandonedCarts.abandonedAt))
      .limit(1);

    if (rows.length === 0) {
      return json({ recoveredCartItems: [] });
    }

    let parsedItems: unknown[] = [];
    try {
      parsedItems = JSON.parse(rows[0].cartItems || '[]') as unknown[];
    } catch {
      parsedItems = [];
    }

    const recoveredCartItems = parsedItems.reduce<CartItem[]>((acc, item) => {
      const record = item as Record<string, unknown>;
      const productId = Number(record.productId);
      const quantity = Number(record.quantity);
      const variantIdRaw = record.variantId;
      const variantId =
        variantIdRaw === null || variantIdRaw === undefined ? undefined : Number(variantIdRaw);

      if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity <= 0) {
        return acc;
      }

      acc.push({
        productId,
        quantity,
        variantId: Number.isFinite(variantId) ? variantId : undefined,
      });
      return acc;
    }, []);

    return json({ recoveredCartItems });
  }

  if (intent === 'get-products') {
    const cartItemsJson = formData.get('cartItems')?.toString();
    let cartItems: CartItem[] = [];

    if (cartItemsJson) {
      try {
        const parsed = JSON.parse(cartItemsJson) as CartItem[];
        cartItems = Array.isArray(parsed) ? parsed : [];
      } catch {
        cartItems = [];
      }
    } else {
      // Backward compatibility for older clients
      const productIds = formData.get('productIds')?.toString().split(',').map(Number) || [];
      cartItems = productIds.map((id) => ({ productId: id, quantity: 1 }));
    }

    const normalizedItems = cartItems.filter(
      (item) => Number.isFinite(item.productId) && Number.isFinite(item.quantity)
    );
    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];

    if (productIds.length === 0) return json({ products: [] });

    const db = drizzle(cloudflare.env.DB);
    const productRows = await db
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
        imageUrl: products.imageUrl,
        inventory: products.inventory,
        isPublished: products.isPublished,
      })
      .from(products)
      .where(and(eq(products.storeId, storeId as number), inArray(products.id, productIds)));

    const variantIds = [
      ...new Set(
        normalizedItems
          .map((item) => item.variantId)
          .filter((variantId): variantId is number => Number.isFinite(variantId))
      ),
    ];

    const variantRows =
      variantIds.length > 0
        ? await db
            .select({
              id: productVariants.id,
              productId: productVariants.productId,
              option1Value: productVariants.option1Value,
              option2Value: productVariants.option2Value,
              option3Value: productVariants.option3Value,
              price: productVariants.price,
              inventory: productVariants.inventory,
              available: productVariants.available,
              isAvailable: productVariants.isAvailable,
              imageUrl: productVariants.imageUrl,
            })
            .from(productVariants)
            .where(inArray(productVariants.id, variantIds))
        : [];

    const variantMap = new Map(variantRows.map((variant) => [variant.id, variant]));
    const productMap = new Map(productRows.map((product) => [product.id, product]));

    const cartProducts: CartProduct[] = normalizedItems.reduce<CartProduct[]>((acc, item) => {
      const product = productMap.get(item.productId);
      if (!product) return acc;

      const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
      const variantTitle = variant
        ? [variant.option1Value, variant.option2Value, variant.option3Value]
            .filter(Boolean)
            .join(' / ')
        : '';
      const effectivePrice = variant?.price ?? product.price;
      const effectiveInventory = variant
        ? (variant.available ?? variant.inventory ?? 0)
        : product.inventory;
      const effectiveImage = variant?.imageUrl || product.imageUrl;
      const effectivePublished =
        product.isPublished && (variant ? variant.isAvailable !== false : true);
      const row: CartProduct = {
        id: product.id,
        title: variantTitle ? `${product.title} (${variantTitle})` : product.title,
        price: effectivePrice,
        imageUrl: effectiveImage,
        inventory: Number(effectiveInventory ?? 0),
        isPublished: Boolean(effectivePublished),
      };

      if (variant?.id) {
        row.variantId = variant.id;
      }

      acc.push(row);
      return acc;
    }, []);

    return json({ products: cartProducts });
  }

  if (intent === 'apply-coupon') {
    const code = formData.get('code')?.toString();
    const subtotal = Number(formData.get('subtotal'));

    if (!code) return json({ error: 'Code required' });

    const db = drizzle(cloudflare.env.DB);
    const result = await validateDiscount(db, storeId as number, code, subtotal);

    return json({ discountResult: result });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function Checkout() {
  const {
    storeId,
    storeName,
    logo,
    currency,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    shippingConfig,
    manualPaymentConfig,
    bumpProducts,
    themeConfig,
    planType,
    customer,
    categories,
    isCustomerAiEnabled,
    aiCredits,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const orderFetcher = useFetcher(); // Dedicated fetcher for order submission
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useTranslation();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill customer details from account
  useEffect(() => {
    if (customer) {
      if (customer.name) setName(customer.name);
      if (customer.phone) setPhone(customer.phone);

      // If customer has saved addresses, use the default one
      if (customer.addresses && customer.addresses.length > 0) {
        const defaultAddress =
          customer.addresses.find((addr: CustomerAddress) => addr.isDefault) ||
          customer.addresses[0];
        if (defaultAddress) {
          if (defaultAddress.address1) setAddress(defaultAddress.address1);
          if (defaultAddress.phone && !customer.phone) setPhone(defaultAddress.phone);

          // Try to match city to district
          if (defaultAddress.city) {
            const cityName = defaultAddress.city.toLowerCase().trim();
            const matchedDistrict = DISTRICTS.find(
              (d) => d.nameEn.toLowerCase() === cityName || d.name.toLowerCase() === cityName
            );
            if (matchedDistrict) {
              setSelectedDistrict(matchedDistrict.id);

              // Try to match upazila if province exists
              if (defaultAddress.province) {
                const upazilaName = defaultAddress.province.toLowerCase().trim();
                setTimeout(() => {
                  const matchedUpazila = UPAZILAS.find(
                    (u) =>
                      u.districtId === matchedDistrict.id &&
                      (u.nameEn.toLowerCase() === upazilaName ||
                        u.name.toLowerCase() === upazilaName)
                  );
                  if (matchedUpazila) {
                    setSelectedUpazila(matchedUpazila.id);
                  }
                }, 100);
              }
            }
          }
        }
      }
    }
  }, [customer]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Order Bumps
  const [selectedBumps, setSelectedBumps] = useState<number[]>([]);

  // Discount
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Discount | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const primaryColor = theme.primary;
  const isLuxeBoutique = storeTemplateId === 'luxe-boutique';

  // Button styles based on template
  const getButtonClass = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    if (isLuxeBoutique) {
      switch (variant) {
        case 'primary':
          return 'w-full bg-[#1a1a1a] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#c9a961] hover:text-white transition-colors shadow-lg';
        case 'secondary':
          return 'w-full border border-[#1a1a1a] px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors';
        case 'outline':
          return 'border border-gray-300 px-4 py-2 text-sm hover:border-[#1a1a1a] transition-colors';
        default:
          return 'w-full bg-[#1a1a1a] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#c9a961] hover:text-white transition-colors shadow-lg';
      }
    }
    // Default styles
    switch (variant) {
      case 'primary':
        return 'w-full mt-6 py-3.5 px-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2';
      case 'secondary':
        return 'px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50';
      case 'outline':
        return 'flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]';
      default:
        return 'w-full mt-6 py-3.5 px-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all';
    }
  };

  const allowedPaymentMethods = useMemo(
    () => getAllowedCheckoutPaymentMethods(planType),
    [planType]
  );

  const findCartProduct = useCallback(
    (item: CartItem) =>
      cartProducts.find(
        (product) =>
          product.id === item.productId && (product.variantId ?? null) === (item.variantId ?? null)
      ),
    [cartProducts]
  );

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const product = findCartProduct(item);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cartItems, findCartProduct]);

  // Helper: Get upazilas for selected district
  const availableUpazilas = useMemo(() => {
    if (!selectedDistrict) return [];
    return UPAZILAS.filter((u) => u.districtId === selectedDistrict);
  }, [selectedDistrict]);

  // Helper: Get shipping zone from district
  const calculatedShippingZone = useMemo(() => {
    if (!selectedDistrict) return 'dhaka';
    return getShippingZone(selectedDistrict);
  }, [selectedDistrict]);

  const shippingCost = useMemo(() => {
    if (!shippingConfig.enabled) return 0;
    if (shippingConfig.freeDeliveryAbove && subtotal >= shippingConfig.freeDeliveryAbove) return 0;
    if (shippingConfig.freeShippingAbove && subtotal >= shippingConfig.freeShippingAbove) return 0;
    if (!selectedDistrict) return shippingConfig.insideDhaka;
    const zone = calculatedShippingZone;
    return zone === 'dhaka' ? shippingConfig.insideDhaka : shippingConfig.outsideDhaka;
  }, [subtotal, calculatedShippingZone, selectedDistrict, shippingConfig]);

  const bumpTotal = useMemo(() => {
    return selectedBumps.reduce((sum, bumpId) => {
      const bump = bumpProducts.find((b) => b.id === bumpId);
      return sum + (bump ? bump.discountedPrice : 0);
    }, 0);
  }, [selectedBumps, bumpProducts]);

  const total = Math.max(0, subtotal + shippingCost + bumpTotal - (appliedCoupon?.amount || 0));

  // Load cart from local storage - ONCE on mount
  useEffect(() => {
    const recoverySessionId = new URLSearchParams(window.location.search).get('recovery');
    let parsed: CartItem[] = [];
    const saved = localStorage.getItem('cart');

    if (saved) {
      try {
        const raw = JSON.parse(saved) as unknown[];
        parsed = Array.isArray(raw)
          ? raw.filter(
              (item): item is CartItem =>
                typeof item === 'object' &&
                item !== null &&
                Number.isFinite(Number((item as { productId?: number }).productId)) &&
                Number.isFinite(Number((item as { quantity?: number }).quantity))
            )
          : [];
      } catch {
        parsed = [];
      }
    }

    if (parsed.length > 0) {
      setCartItems(parsed);
      fetcher.submit(
        {
          intent: 'get-products',
          cartItems: JSON.stringify(
            parsed.map((item: CartItem) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            }))
          ),
        },
        { method: 'post' }
      );
      return;
    }

    if (recoverySessionId) {
      fetcher.submit({ intent: 'recover-cart', sessionId: recoverySessionId }, { method: 'post' });
      return;
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - fetcher is stable

  // Auto-apply Discount from URL - PROTECTION: Use ref to ensure single attempt
  const attemptedUrlCoupon = useRef(false);

  useEffect(() => {
    const urlCode = searchParams.get('discount');
    // Only run if we haven't attempted yet, have a code, and have a subtotal
    if (urlCode && subtotal > 0 && !attemptedUrlCoupon.current) {
      attemptedUrlCoupon.current = true; // LOCK immediately to prevent loop

      if (!appliedCoupon && !isApplyingCoupon) {
        const normalizedUrlCode = urlCode.trim().toUpperCase();
        setCouponCode(normalizedUrlCode);
        setIsApplyingCoupon(true);
        fetcher.submit(
          { intent: 'apply-coupon', code: normalizedUrlCode, subtotal: String(subtotal) },
          { method: 'post' }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, subtotal]); // Minimized dependencies

  // Handle fetcher response for products
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as FetcherData;
      if (data.recoveredCartItems) {
        if (data.recoveredCartItems.length > 0) {
          setCartItems(data.recoveredCartItems);
          localStorage.setItem('cart', JSON.stringify(data.recoveredCartItems));
          fetcher.submit(
            {
              intent: 'get-products',
              cartItems: JSON.stringify(
                data.recoveredCartItems.map((item: CartItem) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                }))
              ),
            },
            { method: 'post' }
          );
        } else {
          setIsLoading(false);
        }
      }
      if (data.products) {
        setCartProducts(data.products);
        setIsLoading(false);
      }
      if (data.discountResult) {
        setIsApplyingCoupon(false);
        if (data.discountResult.isValid) {
          setAppliedCoupon(data.discountResult.discount || null); // FIX: handle undefined
          toast.success('Coupon applied!');
        } else {
          setAppliedCoupon(null);
          toast.error(data.discountResult.error || 'Invalid Coupon');
        }
      }
    }
  }, [fetcher, fetcher.data]);

  // Reset upazila when district changes
  useEffect(() => {
    setSelectedUpazila('');
  }, [selectedDistrict]);

  useEffect(() => {
    if (!allowedPaymentMethods.includes(paymentMethod as CheckoutPaymentMethod)) {
      setPaymentMethod(getDefaultPaymentMethodForPlan(planType));
    }
  }, [allowedPaymentMethods, paymentMethod, planType]);

  // Handle Order Submission Response
  useEffect(() => {
    if (orderFetcher.data) {
      const data = orderFetcher.data as OrderFetcherData;
      if (data.success) {
        if (data.paymentRedirectUrl) {
          window.location.href = data.paymentRedirectUrl;
          return;
        }

        // Fire Purchase Event
        // Construct items for tracking
        const trackingItems = cartItems.map((item) => {
          const product = findCartProduct(item);
          return {
            id: item.variantId ? `${item.productId}-${item.variantId}` : String(item.productId),
            name: product?.title || 'Product',
            price: product?.price || 0,
            quantity: item.quantity,
            currency: currency,
          };
        });

        // Generate stable eventId for deduplication between Pixel and CAPI
        const eventId = `purchase_${data.orderNumber || data.orderId}`;

        trackingEvents.purchase({
          orderId: data.orderId || '',
          value: data.total || 0,
          currency: currency,
          items: trackingItems,
          eventId,
        });

        // Clear cart
        localStorage.removeItem('cart');

        // Redirect
        if (data.upsellUrl) {
          navigate(data.upsellUrl);
        } else {
          navigate(`/thank-you/${data.orderNumber}`);
        }
      } else if (data.error) {
        toast.error(data.error);
      }
    }
  }, [orderFetcher.data, navigate, currency, cartItems, findCartProduct]);

  // Calculations already defined above

  const handleApplyCoupon = () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    if (!normalizedCode) return;
    setIsApplyingCoupon(true);
    setCouponCode(normalizedCode);
    fetcher.submit(
      { intent: 'apply-coupon', code: normalizedCode, subtotal: String(subtotal) },
      { method: 'post' }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validate required fields
    if (!name.trim()) {
      toast.error(lang === 'bn' ? 'আপনার নাম দিন' : 'Please enter your name');
      return;
    }

    if (!phone.trim()) {
      toast.error(lang === 'bn' ? 'ফোন নম্বর দিন' : 'Please enter your phone number');
      return;
    }

    if (!selectedDistrict) {
      toast.error(lang === 'bn' ? 'জেলা নির্বাচন করুন' : 'Please select district');
      return;
    }

    if (!selectedUpazila) {
      toast.error(lang === 'bn' ? 'উপজেলা/থানা নির্বাচন করুন' : 'Please select upazila/thana');
      return;
    }

    if (!address.trim()) {
      toast.error(lang === 'bn' ? 'বিস্তারিত ঠিকানা দিন' : 'Please enter detailed address');
      return;
    }

    if (!['cod', 'sslcommerz'].includes(paymentMethod) && (!senderNumber || !trxId)) {
      toast.error('Please enter payment details');
      return;
    }

    // Prepare payload for /api/create-order
    // Note: The API accepts a single product_id for direct order, or we might need to update API to support multiple items.
    // WAIT: api.create-order.ts currently only supports single product + quantity.
    // This is a GAP. For the MVP Cart, if multiple products are in cart, we should either:
    // A) Update api.create-order to accept items array (Ideal)
    // B) Loop and create multiple orders (Bad)
    // Checking api.create-order logic... it takes `product_id` and `quantity`.
    // It DOES NOT support array of items.
    // REVISION: For "Day 1 MVP", if the user adds multiple items, we might break.
    // However, looking at the code, typical "Landing Page" flow is single product.
    // But "Store" flow allows cart.
    // I MUST UPDATE api.create-order.ts to support `items` array OR creating key "create-order-v2".
    // For now, to unblock, if cart has > 1 DIFFERENT products, we will iterate? No, that messes up shipping.
    // Strategy: I will assume for now we just pick the first item to unblock testing, or update API.
    // ACTUALLY, checking `api.create-order.ts` again...
    // It imports `orderItems`.
    // It only inserts ONE `orderItems` entry from `product_id`.

    // CRITICAL FIX: I need to update `api.create-order.ts` to handle `items` array.
    // But I cannot do two things at once.
    // I will construct the payload assuming I will fix API in next step.

    const selectedDistrictObj = DISTRICTS.find((d) => d.id === selectedDistrict);

    const payload = {
      store_id: storeId,
      // Hack for legacy API compliance: use first item as "main" product
      product_id: cartItems[0].productId,
      quantity: cartItems[0].quantity,
      variant_id: cartItems[0].variantId, // If any

      // Real payload for updated API
      cart_items: cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        variant_id: item.variantId,
      })),

      customer_name: name,
      phone: phone,
      address: address,
      division: selectedDistrictObj ? selectedDistrictObj.divisionId : 'dhaka',
      district: selectedDistrict,
      upazila: selectedUpazila,
      notes: notes,
      payment_method: paymentMethod,
      transaction_id: trxId,
      manual_payment_details:
        paymentMethod === 'sslcommerz' ? undefined : { senderNumber, method: paymentMethod },
      bump_ids: selectedBumps,
      discount_code: appliedCoupon?.code,
    };

    orderFetcher.submit(JSON.stringify(payload), {
      method: 'POST',
      action: '/api/create-order',
      encType: 'application/json',
    });
  };

  const toggleBump = (bumpId: number) => {
    setSelectedBumps((prev) =>
      prev.includes(bumpId) ? prev.filter((id) => id !== bumpId) : [...prev, bumpId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <StorePageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        templateId={storeTemplateId}
        theme={theme}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        planType={planType}
        customer={customer}
        categories={categories}
        config={themeConfig as ThemeConfig}
        isCustomerAiEnabled={isCustomerAiEnabled}
        aiCredits={aiCredits}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cartEmpty')}</h2>
          <Link
            to="/"
            className={
              isLuxeBoutique
                ? 'uppercase tracking-widest text-xs font-bold hover:opacity-70'
                : 'hover:underline'
            }
            style={{ color: primaryColor }}
          >
            {t('continueShopping')}
          </Link>
        </div>
      </StorePageWrapper>
    );
  }

  const content = (
    <div className="max-w-6xl mx-auto px-4 py-8 md:grid md:grid-cols-12 md:gap-8">
      {/* Left Column: Form */}
      <div className="md:col-span-7 lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" style={{ color: primaryColor }} />
            {lang === 'bn' ? 'শিপিং তথ্য' : 'Shipping Information'}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                placeholder="01XXXXXXXXX"
              />
            </div>
            {/* District & Location Selection - Always District Mode */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {lang === 'bn' ? 'ডেলিভারি লোকেশন' : 'Delivery Location'}
              </label>

              {/* District Selection */}
              <SearchableSelect
                options={DISTRICTS.map((d) => ({ id: d.id, name: d.name, nameEn: d.nameEn }))}
                value={selectedDistrict}
                onChange={setSelectedDistrict}
                placeholder={lang === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}
                label={lang === 'bn' ? 'জেলা' : 'District'}
                required
              />

              {/* Shipping Zone Display with Bangla Numbers */}
              {selectedDistrict && (
                <div
                  className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg ${
                    calculatedShippingZone === 'dhaka'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <Truck size={16} />
                  <span>
                    {calculatedShippingZone === 'dhaka'
                      ? `${lang === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}: ${formatBanglaPrice(shippingConfig.insideDhaka, currency, lang)}`
                      : `${lang === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}: ${formatBanglaPrice(shippingConfig.outsideDhaka, currency, lang)}`}
                  </span>
                </div>
              )}

              {/* Upazila Selection (only when district selected) */}
              {selectedDistrict && availableUpazilas.length > 0 && (
                <SearchableSelect
                  options={availableUpazilas.map((u) => ({
                    id: u.id,
                    name: u.name,
                    nameEn: u.nameEn,
                  }))}
                  value={selectedUpazila}
                  onChange={setSelectedUpazila}
                  placeholder={lang === 'bn' ? 'উপজেলা/থানা নির্বাচন করুন' : 'Select Upazila/Thana'}
                  label={lang === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana'}
                />
              )}
            </div>

            {/* Address - Always at Bottom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {lang === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}
              </label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                placeholder={
                  lang === 'bn'
                    ? 'বাসা/ফ্ল্যাট নং, রোড নং, এলাকার নাম লিখুন'
                    : 'House/Flat No, Road No, Area name'
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('orderNotes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-gray-300 transition-all"
                placeholder={
                  lang === 'bn'
                    ? 'অর্ডার সম্পর্কে কোনো মন্তব্য থাকলে লিখুন'
                    : 'Any special notes for delivery'
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: primaryColor }} />
            {lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}
          </h2>
          <PaymentMethodSelector
            config={manualPaymentConfig as ManualPaymentConfig}
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            onTransactionIdChange={setTrxId}
            onSenderNumberChange={setSenderNumber}
            lang={lang}
            allowedMethods={allowedPaymentMethods}
          />
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="md:col-span-5 lg:col-span-4 mt-8 md:mt-0 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('orderSummary')}</h2>

          <div className="space-y-4 mb-6">
            {cartItems.map((item, idx) => {
              const product = findCartProduct(item);
              if (!product) return null;
              return (
                <div key={idx} className="flex gap-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-14 h-14 rounded-md object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(product.price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Bumps */}
          {bumpProducts.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                🔥 {lang === 'bn' ? 'স্পেশাল অফার!' : 'Limited Time Offer!'}
              </p>
              <div className="space-y-3">
                {bumpProducts.map((bump) => (
                  <label key={bump.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBumps.includes(bump.id)}
                      onChange={() => toggleBump(bump.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                      style={{ accentColor: primaryColor }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium text-gray-800 transition-colors"
                        style={{ '--hover-color': primaryColor } as React.CSSProperties}
                      >
                        {bump.title || bump.productTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-red-600">
                          {formatPrice(bump.discountedPrice, currency)}
                        </span>
                        {bump.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(bump.originalPrice, currency)}
                          </span>
                        )}
                      </div>
                    </div>
                    {bump.productImage && (
                      <img
                        src={bump.productImage}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('shipping')}</span>
              <span>{formatPrice(shippingCost, currency)}</span>
            </div>
            {bumpTotal > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Extra Offers</span>
                <span>+ {formatPrice(bumpTotal, currency)}</span>
              </div>
            )}

            {/* Discount Input */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                  <span className="flex items-center gap-1">
                    <TicketPercent className="w-4 h-4" /> code: {appliedCoupon.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>- {formatPrice(appliedCoupon.amount, currency)}</span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={t('discountCode') || 'Promo Code'}
                    className={
                      isLuxeBoutique
                        ? 'flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-black'
                        : 'flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
                    }
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || isApplyingCoupon}
                    className={
                      isLuxeBoutique ? getButtonClass('secondary') : getButtonClass('secondary')
                    }
                  >
                    {isApplyingCoupon ? '...' : t('apply') || 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>{t('total')}</span>
              <span style={{ color: primaryColor }}>{formatPrice(total, currency)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={orderFetcher.state === 'submitting'}
            className={`mt-6 ${getButtonClass('primary')}`}
            style={!isLuxeBoutique ? { backgroundColor: primaryColor } : {}}
          >
            {orderFetcher.state === 'submitting' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {lang === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Place Order'}
          </button>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">🔒 Secure</span>
              <span className="flex items-center gap-1">✓ Verified</span>
              <span className="flex items-center gap-1">📦 Fast Delivery</span>
            </div>
            <p className="text-xs text-center text-gray-400">Powered by Ozzyl</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Determine layout style from theme config (default to standard)
  // Determine layout style from theme config (default to standard)
  // Using string type to allow future extension via unified settings
  const checkoutStyle = (themeConfig as { checkoutStyle?: string })?.checkoutStyle || 'standard';

  // Minimal Layout: No Header/Footer, just centered logo
  if (checkoutStyle === 'minimal') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Minimal Header */}
        <div className="bg-white border-b border-gray-200 py-4 px-6 flex justify-center sticky top-0 z-20 shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 md:h-10 object-contain" />
            ) : (
              <span className="text-xl font-bold text-gray-900">{storeName}</span>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 mb-6 transition-colors ${isLuxeBoutique ? 'text-sm uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a]' : 'text-sm text-gray-500 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToStore')}
          </Link>
          {/* Same content grid, but centered slightly more if single col */}
          <div className="md:grid md:grid-cols-12 md:gap-8">
            {/* Left Column: Form */}
            <div className="md:col-span-7 lg:col-span-8 space-y-6">
              {/* ... Form Components ... */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" style={{ color: primaryColor }} />
                  {lang === 'bn' ? 'শিপিং তথ্য' : 'Shipping Information'}
                </h2>
                {/* Re-using same form inputs - ideally extracted to component but inline for now to avoid massive refactor */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('address')}
                    </label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      placeholder={lang === 'bn' ? 'সম্পূর্ণ ঠিকানা লিখুন' : 'Full address'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}
                    </label>
                    <SearchableSelect
                      options={DISTRICTS.map((d) => ({
                        id: d.id,
                        name: d.name,
                        nameEn: d.nameEn,
                      }))}
                      value={selectedDistrict}
                      onChange={setSelectedDistrict}
                      placeholder={lang === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select district'}
                    />
                    {calculatedShippingZone && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                          {lang === 'bn' ? 'শিপিং জোন:' : 'Shipping Zone:'}
                        </span>
                        <span
                          className={`font-medium px-2 py-1 rounded ${calculatedShippingZone === 'dhaka' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                        >
                          {calculatedShippingZone === 'dhaka'
                            ? lang === 'bn'
                              ? 'ঢাকা'
                              : 'Dhaka'
                            : lang === 'bn'
                              ? 'ঢাকার বাইরে'
                              : 'Outside Dhaka'}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedDistrict && availableUpazilas.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {lang === 'bn' ? 'উপজেলা নির্বাচন করুন' : 'Select Upazila'}
                      </label>
                      <SearchableSelect
                        options={availableUpazilas.map((u) => ({
                          id: u.id,
                          name: u.name,
                          nameEn: u.nameEn,
                        }))}
                        value={selectedUpazila}
                        onChange={setSelectedUpazila}
                        placeholder={lang === 'bn' ? 'উপজেলা নির্বাচন করুন' : 'Select upazila'}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang === 'bn' ? 'সম্পূর্ণ ঠিকানা' : 'Full Address'}
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      placeholder={
                        lang === 'bn'
                          ? 'বাড়ি/রোড নম্বর, এলাকা, থানা ইত্যাদি'
                          : 'House/Road number, area, police station etc.'
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('orderNotes')}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder={lang === 'bn' ? 'অর্ডার সম্পর্কে মন্তব্য' : 'Special notes'}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" style={{ color: primaryColor }} />
                  {lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}
                </h2>
                <PaymentMethodSelector
                  config={manualPaymentConfig as ManualPaymentConfig}
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  onTransactionIdChange={setTrxId}
                  onSenderNumberChange={setSenderNumber}
                  lang={lang}
                  allowedMethods={allowedPaymentMethods}
                />
              </div>
            </div>

            {/* Right Column: Order Summary (Always standard for Minimal view, just isolated) */}
            <div className="md:col-span-5 lg:col-span-4 mt-8 md:mt-0">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4">{t('orderSummary')}</h2>
                {/* Reuse Summary UI Logic */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item, idx) => {
                    const product = findCartProduct(item);
                    if (!product) return null;
                    return (
                      <div key={idx} className="flex gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-14 h-14 rounded-md object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-md" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice((product.price ?? 0) * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Bumps */}
                {bumpProducts.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-bold text-yellow-800 mb-3">
                      🔥 {lang === 'bn' ? 'স্পেশাল অফার!' : 'Limited Time Offer!'}
                    </p>
                    <div className="space-y-3">
                      {bumpProducts.map((bump) => (
                        <label
                          key={bump.id}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBumps.includes(bump.id)}
                            onChange={() => toggleBump(bump.id)}
                            className="mt-1 w-4 h-4 rounded border-gray-300"
                            style={{ accentColor: primaryColor }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {bump.title || bump.productTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-bold text-red-600">
                                {formatPrice(bump.discountedPrice, currency)}
                              </span>
                              {bump.discount > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(bump.originalPrice, currency)}
                                </span>
                              )}
                            </div>
                          </div>
                          {bump.productImage && (
                            <img
                              src={bump.productImage}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('shipping')}</span>
                    <span>{formatPrice(shippingCost, currency)}</span>
                  </div>
                  {bumpTotal > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Extra Offers</span>
                      <span>+ {formatPrice(bumpTotal, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>{t('total')}</span>
                    <span style={{ color: primaryColor }}>{formatPrice(total, currency)}</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={orderFetcher.state === 'submitting'}
                  className="w-full mt-6 py-3.5 px-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {orderFetcher.state === 'submitting' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {lang === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // One Page Layout: Single centered column
  if (checkoutStyle === 'one_page') {
    return (
      <StorePageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        templateId={storeTemplateId}
        theme={theme}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        planType={planType}
        customer={customer}
        categories={categories}
        config={themeConfig as ThemeConfig}
        isCustomerAiEnabled={isCustomerAiEnabled}
        aiCredits={aiCredits}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout')}</h1>
            <p className="text-gray-500 text-sm">Complete your order safely and securely.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* 1. Order Summary (Collapsible/Preview) */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">{t('orderSummary')}</h2>
                <span className="text-lg font-bold" style={{ color: primaryColor }}>
                  {formatPrice(total, currency)}
                </span>
              </div>
              {/* Mini Items List */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item, idx) => {
                  const product = findCartProduct(item);
                  if (!product) return null;
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {product.title} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice((product.price ?? 0) * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer Info */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" style={{ color: primaryColor }} />{' '}
                {lang === 'bn' ? 'শিপিং তথ্য' : 'Shipping Information'}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder={lang === 'bn' ? 'আপনার নাম' : 'Name'}
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder={lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}
                />
                <SearchableSelect
                  options={DISTRICTS.map((d) => ({
                    id: d.id,
                    name: d.name,
                    nameEn: d.nameEn,
                  }))}
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  placeholder={lang === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select district'}
                />
                {calculatedShippingZone && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {lang === 'bn' ? 'শিপিং জোন:' : 'Shipping Zone:'}
                    </span>
                    <span
                      className={`font-medium px-2 py-1 rounded ${calculatedShippingZone === 'dhaka' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                    >
                      {calculatedShippingZone === 'dhaka'
                        ? lang === 'bn'
                          ? 'ঢাকা'
                          : 'Dhaka'
                        : lang === 'bn'
                          ? 'ঢাকার বাইরে'
                          : 'Outside Dhaka'}
                    </span>
                  </div>
                )}

                {selectedDistrict && availableUpazilas.length > 0 && (
                  <SearchableSelect
                    options={availableUpazilas.map((u) => ({
                      id: u.id,
                      name: u.name,
                      nameEn: u.nameEn,
                    }))}
                    value={selectedUpazila}
                    onChange={setSelectedUpazila}
                    placeholder={lang === 'bn' ? 'উপজেলা নির্বাচন করুন' : 'Select upazila'}
                  />
                )}

                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder={lang === 'bn' ? 'ঠিকানা' : 'Address'}
                />
              </div>
            </div>

            {/* 3. Payment */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: primaryColor }} />{' '}
                {lang === 'bn' ? 'পেমেন্ট' : 'Payment'}
              </h2>
              <PaymentMethodSelector
                config={manualPaymentConfig as ManualPaymentConfig}
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                onTransactionIdChange={setTrxId}
                onSenderNumberChange={setSenderNumber}
                lang={lang}
                allowedMethods={allowedPaymentMethods}
              />
              <button
                onClick={handleSubmit}
                disabled={orderFetcher.state === 'submitting'}
                className="w-full mt-8 py-4 text-white font-bold rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {orderFetcher.state === 'submitting' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {lang === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Complete Order'}
              </button>
            </div>
          </div>
        </div>
      </StorePageWrapper>
    );
  }

  return (
    <StorePageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      planType={planType}
      customer={customer}
      categories={categories}
      config={themeConfig as ThemeConfig}
      isCustomerAiEnabled={isCustomerAiEnabled}
      aiCredits={aiCredits}
    >
      {content}
    </StorePageWrapper>
  );
}
