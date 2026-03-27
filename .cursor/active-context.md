> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `apps/web/app/routes/api.create-order.ts` (Domain: **Frontend (React/UI)**)

### 📐 Frontend (React/UI) Conventions & Fixes
- **[decision] decision in app.orders._index.tsx**: -             .then((val) => ({ phone, val }))
+             .then((val: any) => ({ phone, val }))
-                                     {allCouriers.map((c) => (
+                                     {allCouriers.map((c: any) => (
-                                   {orderItemsList.slice(0, 6).map((item, idx) => (
+                                   {orderItemsList.slice(0, 6).map((item: any, idx: number) => (

📌 IDE AST Context: Modified symbols likely include [meta, loader, action, statusOptionsKeys, DashboardOrdersPage]
- **[problem-fix] Fixed null crash in Date — prevents null/undefined runtime crashes**: -   const formatDate = (date: string | Date) => {
+   const formatDate = (date: string | Date | null) => {
-     return new Date(date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
+     if (!date) return '—';
-       year: 'numeric',
+     return new Date(date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
-       month: 'long',
+       year: 'numeric',
-       day: 'numeric',
+       month: 'long',
-       hour: '2-digit',
+       day: 'numeric',
-       minute: '2-digit',
+       hour: '2-digit',
-     });
+       minute: '2-digit',
-   };
+     });
- 
+   };
-   const formatDateShort = (date: string | Date) => {
+ 
-     return new Date(date).toLocaleDateString('en-US', {
+   const formatDateShort = (date: string | Date) => {
-       year: 'numeric',
+     return new Date(date).toLocaleDateString('en-US', {
-       month: 'short',
+       year: 'numeric',
-       day: 'numeric',
+       month: 'short',
-     });
+       day: 'numeric',
-   };
+     });
- 
+   };
-   // Parse shipping address if it's a JSON string
+ 
-   let shippingAddress: { address?: string; city?: string; postalCode?: string } = {};
+   let shippingAddress: { address?: string; city?: string; postalCode?: string, area?: string } = {};
-   const handlePrint = () => {
+   const handlePrint = () => window.print();
-     window.print();
+ 
-   };
+   return (
- 
+     <>
-   return (
+       <style>{`
-     <>
+         @media print {
-       {/* Print Styles */}
+           body * { visibility: hidden; }
-       <style>{`
+           #invoice-print, #invoice-print * { visibility: visible; }
-         @media print {
+           #invoice-print { 
-           body * { visibility: hidden; }
+             position: absolute; 
-           #invoice-print, #invoice-print * { visibility: visible; }
+             left: 0; 
-           #invoice-print { 
+             top: 0; 
-             position: absolute; 
+             width: 100%;
-             left: 0; 
+             padding: 20px
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [meta, loader, action, statusOptions, StatusBadge]
- **[convention] Fixed null crash in LanguageContext — avoids unnecessary re-renders in React — confirmed 3x**: -   Receipt,
+ } from 'lucide-react';
-   Eye,
+ import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
- } from 'lucide-react';
+ import { useTranslation } from '~/contexts/LanguageContext';
- import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
+ import { formatPrice } from '~/utils/formatPrice';
- import { useTranslation } from '~/contexts/LanguageContext';
+ import { type OrderStatus, assertOrderStatusTransition, isOrderStatus } from '~/lib/orderStatus';
- import { formatPrice } from '~/utils/formatPrice';
+ import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
- import { type OrderStatus, assertOrderStatusTransition, isOrderStatus } from '~/lib/orderStatus';
+ import { ozzylGuardCacheKey, fetchExternalFraudData } from '~/services/fraud-engine.server';
- import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
+ 
- import { ozzylGuardCacheKey, fetchAndCacheGuardData, fetchExternalFraudData } from '~/services/fraud-engine.server';
+ export const meta: MetaFunction = () => {
- 
+   return [{ title: 'Orders - Merchant Dashboard' }];
- export const meta: MetaFunction = () => {
+ };
-   return [{ title: 'Orders - Merchant Dashboard' }];
+ 
- };
+ // ============================================================================
- 
+ // LOADER - Fetch orders for the merchant's store
- // LOADER - Fetch orders for the merchant's store
+ export async function loader({ request, context }: LoaderFunctionArgs) {
- // ============================================================================
+   const { storeId } = await requireTenant(request, context, {
- export async function loader({ request, context }: LoaderFunctionArgs) {
+     requirePermission: 'orders',
-   const { storeId } = await requireTenant(request, context, {
+   });
-     requirePermission: 'orders',
+ 
-   });
+   const db = drizzle(context.cloudflare.env.DB);
-   const db = drizzle(context
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [meta, loader, action, statusOptionsKeys, DashboardOrdersPage]
- **[decision] Optimized FRAUD_CHECK**: -         { success: true, intent: 'FRAUD_CHECK', orderId, riskResult: { ...normalizedResultObj, fromCache: false } },
+         { success: true, intent: 'FRAUD_CHECK', orderId, riskResult: { ...resultObj, fromCache: false } },

📌 IDE AST Context: Modified symbols likely include [meta, loader, action, statusOptionsKeys, DashboardOrdersPage]
- **[decision] decision in app.orders._index.tsx**: -             raw.successRate = 100 - (raw.riskScore ?? raw.score ?? Number(raw.isHighRisk ?? 0) * 100 ?? 0);
+             raw.successRate = 100 - (raw.riskScore ?? raw.score ?? (raw.isHighRisk ? 100 : 0));

📌 IDE AST Context: Modified symbols likely include [meta, loader, action, statusOptionsKeys, DashboardOrdersPage]
- **[convention] Fixed null crash in Failed — prevents null/undefined runtime crashes — confirmed 3x**: -     }
+       return json({ success: false, error: 'Failed to apply template' }, { status: 500 });
-     
+     }
-     return json({ success: true, message: 'templateApplied' });
+     
-   }
+     return json({ success: true, message: 'templateApplied' });
- 
+   }
-   if (intent === 'save-theme') {
+ 
-     const primaryColor = formData.get('primaryColor') as string || unified.theme.primary;
+   if (intent === 'save-theme') {
-     const accentColor = formData.get('accentColor') as string || unified.theme.accent;
+     const primaryColor = formData.get('primaryColor') as string || unified.theme.primary;
-     const fontFamily = formData.get('fontFamily') as string || 'inter';
+     const accentColor = formData.get('accentColor') as string || unified.theme.accent;
-     
+     const fontFamily = formData.get('fontFamily') as string || 'inter';
-     try {
+     
-       await saveUnifiedStorefrontSettingsWithCacheInvalidation(
+     try {
-         db,
+       await saveUnifiedStorefrontSettingsWithCacheInvalidation(
-         context.cloudflare.env,
+         db,
-         storeId,
+         context.cloudflare.env,
-         { 
+         storeId,
-           theme: { primary: primaryColor, accent: accentColor },
+         { 
-           typography: { fontFamily },
+           theme: { primary: primaryColor, accent: accentColor },
-         }
+           typography: { fontFamily },
-       );
+         }
-     } catch (e) {
+       );
-       console.error('Failed to update unified settings theme:', e);
+     } catch (e) {
-     }
+       console.error('Failed to update unified settings theme:', e);
-     
+       return json({ success: false, error: 'Failed to save theme' }, { status: 500 });
-     // Legacy Sync
+     }
-     await db.update(stores).set({ 
+     
-       fontFamily,
+     // Legacy Sync
-       updatedAt: new Date() 
+     await db.update(stores).set({ 
-     }).where(eq(stores.id, storeId));
+       fontFamily,
-     
+       updatedAt: new D
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [FONT_OPTIONS, meta, loader, action, StoreDesignPage]
- **[decision] decision in app.store-design.tsx**: -             {templates.map((template) => {
+             {templates.map((template: any) => {
-         templateName={templates.find(t => t.id === previewTemplate)?.name || ''}
+         templateName={templates.find((t: any) => t.id === previewTemplate)?.name || ''}

📌 IDE AST Context: Modified symbols likely include [FONT_OPTIONS, meta, loader, action, StoreDesignPage]
- **[what-changed] Updated API endpoint MetaFunction**: - import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
+ import type { MetaFunction } from 'react-router';
-   const { currentTemplateId, themeConfig, templates, storeSubdomain, storeName, storeMode, storeLogo, businessInfo, socialLinks, fontFamily: storedFontFamily } = useLoaderData<typeof loader>();
+   const { currentTemplateId, themeConfig, templates, storeSubdomain, storeName, storeMode, storeLogo, businessInfo, socialLinks, fontFamily: storedFontFamily } = useLoaderData<any>();
-   const actionData = useActionData<typeof action>();
+   const actionData = useActionData<any>();

📌 IDE AST Context: Modified symbols likely include [FONT_OPTIONS, meta, loader, action, StoreDesignPage]
- **[decision] decision in app.store-design.tsx**: -     storeMode: store[0].mode || 'store',
+     storeMode: (store[0] as any).mode || 'store',

📌 IDE AST Context: Modified symbols likely include [FONT_OPTIONS, meta, loader, action, StoreDesignPage]
- **[what-changed] what-changed in app.store-design.tsx**: - import { parseThemeConfig, defaultThemeConfig, type ThemeConfig, parseSocialLinks, type SocialLinks } from '@db/types';
+ // Removed deprecated legacy imports

📌 IDE AST Context: Modified symbols likely include [FONT_OPTIONS, meta, loader, action, StoreDesignPage]
- **[problem-fix] Patched security issue Product — avoids unnecessary re-renders in React**: -         />
+           shippingConfig={data.shippingConfig}
-       ) : (
+         />
-         <div className="text-center py-20">
+       ) : (
-           <h1 className="text-2xl font-bold text-red-600">Product Page Template Not Found</h1>
+         <div className="text-center py-20">
-         </div>
+           <h1 className="text-2xl font-bold text-red-600">Product Page Template Not Found</h1>
-       )}
+         </div>
-     </StorePageWrapper>
+       )}
-   );
+     </StorePageWrapper>
- }
+   );
- 
+ }
- // ===================================
+ 
- // COLLECTION VIEW COMPONENT
+ // ===================================
- // ===================================
+ // COLLECTION VIEW COMPONENT
- function CollectionPageView({ data }: { data: CollectionPageData }) {
+ // ===================================
-   const {
+ function CollectionPageView({ data }: { data: CollectionPageData }) {
-     storeId,
+   const {
-     storeName,
+     storeId,
-     logo,
+     storeName,
-     currency,
+     logo,
-     storeTemplateId,
+     currency,
-     theme,
+     storeTemplateId,
-     socialLinks,
+     theme,
-     businessInfo,
+     socialLinks,
-     themeConfig,
+     businessInfo,
-     collection,
+     themeConfig,
-     products,
+     collection,
-     categories,
+     products,
-     sortBy,
+     categories,
-     inStock,
+     sortBy,
-     onSale,
+     inStock,
-     minPrice,
+     onSale,
-     maxPrice,
+     minPrice,
-     planType,
+     maxPrice,
-     customer,
+     planType,
-     isCustomerAiEnabled,
+     customer,
-     aiCredits,
+     isCustomerAiEnabled,
-   } = data;
+     aiCredits,
-   const [searchParams, setSearchParams] = useSearchParams();
+   } = data;
- 
+   const [searchParams, setSearchParams] = useSearchParams();
-   // Filter handlers
+ 
-   const handleSortChange = (value: string) => {
+   // Filter handlers
-     const p = new URLSearchParams(searchParams);
+   const handleSortChange = (value: string) => {
-     p.se
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [CACHE_TTL, SerializedReview, SerializedCustomer, BusinessInfo, ProductPageData]
- **[convention] Fixed null crash in Also — reduces initial bundle size with code splitting — confirmed 3x**: -     
+ 
-     return json({ success: true, message: 'themeSaved' });
+     // Also save to unified storefront settings
-   }
+     try {
- 
+       const { saveUnifiedStorefrontSettingsWithCacheInvalidation } = await import('~/services/unified-storefront-settings.server');
-   if (intent === 'save-banner') {
+       await saveUnifiedStorefrontSettingsWithCacheInvalidation(
-     const bannerUrl = formData.get('bannerUrl') as string || '';
+         db,
-     const bannerText = formData.get('bannerText') as string || '';
+         context.cloudflare.env,
-     const announcementEnabled = formData.get('announcementEnabled') === 'true';
+         storeId,
-     const announcementText = formData.get('announcementText') as string || '';
+         { 
-     const announcementLink = formData.get('announcementLink') as string || '';
+           theme: { primary: primaryColor, accent: accentColor },
-     const announcementBgColor = formData.get('announcementBgColor') as string || '';
+           typography: { fontFamily },
-     const announcementTextColor = formData.get('announcementTextColor') as string || '';
+         }
-     const announcementDismissible = formData.get('announcementDismissible') === 'true';
+       );
-     
+     } catch (e) {
-     const updatedConfig: ThemeConfig = { 
+       console.error('Failed to update unified settings theme:', e);
-       ...currentConfig, 
+     }
-       bannerUrl: bannerUrl || undefined,
+     
-       bannerText: bannerText || undefined,
+     return json({ success: true, message: 'themeSaved' });
-       announcement: announcementText ? {
+   }
-         enabled: announcementEnabled,
+ 
-         text: announcementText,
+   if (intent === 'save-banner') {
-         link: announcementLink || undefined,
+     const bannerUrl = formData.get('bannerUrl') as string || '';
-         bgColor: announcementBgColor || undefined,
+     const bannerText = formData.get('bannerText') as string || '';
-         textColor: announcementT
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [FONT_OPTIONS, meta, loader, action, StoreDesignPage]
- **[what-changed] what-changed in api.cron.smart-triggers.ts**: File updated (external): apps/web/app/routes/api.cron.smart-triggers.ts

Content summary (170 lines):
import { json } from "~/lib/rr7-compat";
import type { LoaderFunctionArgs } from "react-router";
// import { drizzle } from "drizzle-orm/d1"; // REMOVED
import { createDb } from "~/lib/db.server";
import * as schema from "@db/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendSmartNotification } from "~/services/messaging.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = (context as any).cloudflare?.env as Env || context.env as unkn
- **[what-changed] what-changed in app.agent.tsx**: File updated (external): apps/web/app/routes/app.agent.tsx

Content summary (260 lines):
import { LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link, Outlet, useLocation } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { Sparkles, MessageSquare, Settings, Book, Bot, Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from '~/contexts/Language
- **[what-changed] what-changed in app.ai.conversations.tsx**: File updated (external): apps/web/app/routes/app.ai.conversations.tsx

Content summary (270 lines):
/**
 * AI Conversations Dashboard
 * 
 * Shows all AI chat conversations for merchants to review and monitor.
 * Displays customer name, phone, timestamps, and full message history.
 */

import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql } from 'drizzle-orm';
import { aiConversations, messages } from '@db/schema';
im
