import { stores, products, orders, discounts } from "db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { parseThemeConfig, parseLandingConfig, defaultThemeConfig } from "db/types";
import type { ThemeConfig, LandingConfig } from "db/types";
import type { Database } from "~/lib/db.server";

export interface AIContext {
  store: {
    name: string;
    type: string;
    productCount: number;
    averageOrderValue: number;
    currency: string;
    topCategories: string[];
  };
  currentPage: string;
  currentTheme: string;
  config: {
    theme: ThemeConfig;
    landing: LandingConfig | null;
    marketing: {
      flashSaleActive: boolean;
      activeDiscounts: string[];
    };
  };
  sections: any[]; 
  merchantIntent?: string;
}

/**
 * Builds the context required for the AI to understand the current store state.
 */
export async function buildAIContext(db: Database, storeId: number, merchantCommand?: string): Promise<AIContext> {
  // 1. Fetch Core Data (Parallel)
  const [store, storeProducts, recentOrders, activeDiscounts] = await Promise.all([
    db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    }),
    db.query.products.findMany({
      where: eq(products.storeId, storeId),
      limit: 50, // Context window optimization
    }),
    db.query.orders.findMany({
      where: eq(orders.storeId, storeId),
      orderBy: desc(orders.createdAt),
      limit: 20,
    }),
    db.query.discounts.findMany({
      where: and(
        eq(discounts.storeId, storeId),
        eq(discounts.isActive, true),
        gte(discounts.expiresAt, new Date())
      ),
    }),
  ]);

  if (!store) {
    throw new Error("Store not found");
  }

  // 2. Parse Configurations
  const themeConfig = parseThemeConfig(store.themeConfig) || defaultThemeConfig;
  const landingConfig = parseLandingConfig(store.landingConfig);

  // 3. Calculate Derived Metrics
  const totalRevenue = recentOrders.reduce((sum: number, order: any) => sum + order.total, 0);
  const averageOrderValue = recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0;
  
  // Detect top categories
  const categoryCounts: Record<string, number> = {};
  storeProducts.forEach((p: any) => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat]) => cat);

  // Detect Store Type (Simple Heuristic for now)
  // In a real scenario, this could be stored in DB or inferred by LLM
  const detectStoreType = (cats: string[]) => {
    const joined = cats.join(" ").toLowerCase();
    if (joined.includes("shirt") || joined.includes("dress")) return "fashion";
    if (joined.includes("phone") || joined.includes("laptop")) return "electronics";
    if (joined.includes("organic") || joined.includes("food")) return "grocery";
    return "general";
  };

  // 4. Determine Current Sections based on Mode
  const currentSections = store.mode === 'landing' 
    ? [] // Landing pages usually have fixed structure or different section logic
    : themeConfig.sections || [];

  return {
    store: {
      name: store.name,
      type: detectStoreType(topCategories),
      productCount: storeProducts.length,
      averageOrderValue,
      currency: store.currency || 'BDT',
      topCategories,
    },
    // Infer page context from intent if simple, otherwise default to home
    currentPage: merchantCommand?.toLowerCase().includes("product page") ? "product" : "homepage",
    currentTheme: store.theme || "default",
    config: {
      theme: themeConfig,
      landing: landingConfig,
      marketing: {
        flashSaleActive: themeConfig.flashSale?.isActive || false,
        activeDiscounts: activeDiscounts.map((d: any) => d.code),
      },
    },
    sections: currentSections,
    merchantIntent: merchantCommand,
  };
}
