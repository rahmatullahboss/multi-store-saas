/**
 * E2E Test Fixtures and Utilities
 * 
 * Provides reusable test helpers and page objects
 */

import { test as base, expect, Page } from '@playwright/test';

// ============================================================================
// TEST DATA
// ============================================================================
export const testData = {
  // Test merchant credentials
  merchant: {
    email: process.env.E2E_MERCHANT_EMAIL || 'test@example.com',
    password: process.env.E2E_MERCHANT_PASSWORD || 'TestPassword123',
    name: 'Test Merchant',
  },
  
  // Test store data
  store: {
    name: 'Test Store',
    subdomain: 'test-store-' + Math.floor(Math.random() * 100000),
    currency: 'BDT',
  },
  
  // Test product data
  product: {
    title: 'Test T-Shirt',
    price: 500,
    description: 'A comfortable cotton t-shirt for testing',
    inventory: 100,
  },
  
  // Test customer data
  customer: {
    name: 'টেস্ট কাস্টমার',
    phone: '01712345678',
    address: 'ঢাকা, মিরপুর ১০, বাড়ি নং ১২৩, রোড ৫, ব্লক ডি',
    division: 'dhaka',
  },
};

// ============================================================================
// PAGE OBJECTS
// ============================================================================

/**
 * Landing Page Object
 */
export class LandingPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/');
  }
  
  async clickGetStarted() {
    await this.page.click('text=শুরু করুন');
  }
  
  async clickLogin() {
    await this.page.click('text=লগইন');
  }
}

/**
 * Auth Page Object
 */
export class AuthPage {
  constructor(private page: Page) {}
  
  async gotoLogin() {
    await this.page.goto('/auth/login');
  }
  
  async gotoRegister() {
    await this.page.goto('/auth/register');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL(/\/app/);
  }
  
  async register(name: string, email: string, password: string, storeName: string, subdomain: string) {
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="storeName"]', storeName);
    
    // Check if we need to show custom subdomain field
    const customToggle = this.page.locator('#useCustomSubdomain');
    if (await customToggle.isVisible()) {
      await customToggle.check();
      await this.page.fill('input[name="subdomain"]', subdomain);
    }
    
    await this.page.click('button[type="submit"]');
  }
  
  async loginWithGoogle() {
    await this.page.click('button:has-text("Google")');
  }

  async ensureRegisteredAndLoggedIn(name: string, email: string, password: string, storeName: string, subdomain: string) {
    await this.gotoLogin();
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');

    try {
      // Wait for app or dashboard
      await this.page.waitForURL(/\/app/, { timeout: 5000 });
    } catch (e) {
      // Login failed, try registration
      await this.gotoRegister();
      await this.register(name, email, password, storeName, subdomain);
      await this.page.waitForURL(/\/app/, { timeout: 10000 });
    }
  }
}

/**
 * Dashboard Page Object
 */
export class DashboardPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/app');
  }
  
  async waitForLoad() {
    await this.page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  }
  
  async navigateTo(section: 'products' | 'orders' | 'customers' | 'settings') {
    await this.page.click(`[href*="${section}"]`);
  }
  
  async getOrderCount(): Promise<string> {
    return await this.page.textContent('[data-testid="order-count"]') || '0';
  }
}

/**
 * Products Page Object
 */
export class ProductsPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/app/products');
  }
  
  async clickAddProduct() {
    await this.page.click('text=প্রোডাক্ট যোগ করুন');
  }
  
  async fillProductForm(product: typeof testData.product) {
    await this.page.fill('input[name="title"]', product.title);
    await this.page.fill('input[name="price"]', product.price.toString());
    await this.page.fill('textarea[name="description"]', product.description);
    await this.page.fill('input[name="inventory"]', product.inventory.toString());
  }
  
  async saveProduct() {
    await this.page.click('button:has-text("সেভ করুন")');
  }
}

/**
 * Storefront Page Object
 */
export class StorefrontPage {
  constructor(private page: Page) {}
  
  async goto(subdomain: string) {
    await this.page.goto(`/${subdomain}`);
  }
  
  async clickProduct(productTitle: string) {
    await this.page.click(`text=${productTitle}`);
  }
  
  async addToCart() {
    await this.page.click('button:has-text("কার্টে যোগ করুন")');
  }
  
  async goToCart() {
    await this.page.click('[data-testid="cart-icon"]');
  }
  
  async proceedToCheckout() {
    await this.page.click('text=চেকআউট');
  }
}

/**
 * Checkout Page Object
 */
export class CheckoutPage {
  constructor(private page: Page) {}
  
  async fillCustomerInfo(customer: typeof testData.customer) {
    await this.page.fill('input[name="customer_name"]', customer.name);
    await this.page.fill('input[name="phone"]', customer.phone);
    await this.page.fill('textarea[name="address"]', customer.address);
    await this.page.selectOption('select[name="division"]', customer.division);
  }
  
  async selectPaymentMethod(method: 'cod' | 'bkash' | 'nagad') {
    await this.page.click(`[data-payment="${method}"]`);
  }
  
  async placeOrder() {
    await this.page.click('button:has-text("অর্ডার করুন")');
  }
  
  async getOrderNumber(): Promise<string> {
    const element = await this.page.waitForSelector('[data-testid="order-number"]');
    return await element.textContent() || '';
  }
}

// ============================================================================
// CUSTOM TEST FIXTURE
// ============================================================================
type Fixtures = {
  landingPage: LandingPage;
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  productsPage: ProductsPage;
  storefrontPage: StorefrontPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  storefrontPage: async ({ page }, use) => {
    await use(new StorefrontPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
