# System Features Documentation

This document provides a comprehensive overview of all features implemented in the Multi-Store SaaS Platform. It covers Super Admin capability, Merchant tools, and Customer-facing features.

## 1. Super Admin Features (Platform Owner)

The Super Admin dashboard is the control center for the entire SaaS platform.

### 1.1 AI Command Center

- **Natural Language Queries**: Ask questions like "Show me revenue for last 30 days" or "Which stores are at risk of churning?" to get instant data visualizations.
- **Global Conversion Funnel**: Visualizes the aggregate customer journey (Visitors -> Carts -> Checkouts -> Orders) across all stores.
- **Merchant Health Scoring**: Auto-calculates a health score (0-100) for every store based on revenue, order volume, and **Conversion Rate**. Identifies "Healthy", "At Risk", and "Critical" stores.
- **Trending Products**: Shows top-selling products platform-wide.

### 1.2 Tenant & Subscription Management

- **Store Management**: View active/inactive stores, login as merchant (Impersonation), and suspend non-compliant stores.
- **Plan Management**: Configure subscription tiers (Free, Pro, Enterprise) and feature limits (e.g., max 100 products).

### 1.3 Theme Marketplace

- **Theme Management**: Upload and manage store templates.
- **Validation**: Start-up checks ensure themes are compatible with the AI Editor.

---

## 2. Merchant Features (Store Owners)

Merchants have access to a powerful dashboard to manage their e-commerce business.

### 2.1 AI Co-Pilot & Automation

- **Smart Assistant**: A dedicated AI agent that answers queries about store performance ("How many orders today?") and suggests actions.
- **Automated Insights**: Proactive alerts for low inventory, high churn risk, or dip in sales.

### 2.2 Marketing & Growth (Advanced)

- **Facebook Pixel Integration**:
  - **Dual-Pixel Tracking**: Setup their own Pixel ID while the platform also tracks via a Master Pixel for global insights.
  - **Server-Side Events (CAPI)**: Purchase events are sent directly from the server to Facebook, identifying customers for better ad targeting.
- **Messaging Automation (SMS & WhatsApp)**:
  - **Abandoned Cart Recovery**: Automatically finds carts abandoned for >1 hour and sends a recovery link via WhatsApp (Priority) or SMS.
  - **Order Confirmation**: Instant WhatsApp/SMS notification when an order is placed.
- **Upsells & Order Bumps**:
  - **Pre-Purchase Bumps**: Offer complementary products right in the checkout flow.
  - **Post-Purchase Upsells**: One-click upsell offers after payment.

### 2.3 Predictive Analytics & Smart Scaling (New)

- **Sales Forecasting**:
  - **Revenue Projection**: AI models (Linear Regression) analyze last 30 days of sales to forecast revenue for the next 7-30 days. Helps in inventory planning.
- **Customer Lifetime Value (CLV)**:
  - **Prediction**: Estimates how much a customer is likely to spend over their lifetime based on Average Order Value (AOV) and Purchase Frequency.
  - **Churn Risk Detection**: Analyzes customer purchase frequency gaps. If `time_since_last_order > 3 * average_frequency`, flags as "High Risk".
  - **Next Purchase Prediction**: Estimates the specific date a customer is likely to buy again based on their personal historical intervals.
- **Dynamic Recommendations**:
  - **"People also bought" Logic**: Automatically suggests related products by analyzing order history patterns (Collaborative Filtering).

### 2.3 Store Design & Templates

- **Live Store Editor**: Drag-and-drop editor to customize the storefront.
- **Mobile-First Themes**: Themes like "MobileFirst" and "Luxe" optimized for mobile views.
- **Mobile Preview**: Real-time preview of how the store looks on mobile devices.
- **My Themes**: Save and switch between different installed themes.

### 2.4 Customer Management (CRM)

- **Smart Segmentation**: AI automatically categorizes customers into:
  - **VIP**: High spenders/frequent buyers.
  - **Regular**: Standard active customers.
  - **Churn Risk**: Customers who haven't bought in a while.
  - **Window Shoppers**: High visits, low purchases.
- **Customer Profiles**: Detailed view of order history, total spend, and contact info.

### 2.5 Order & Inventory Management

- **Order Processing**: View, fulfill, and print invoices for orders.
- **Inventory Tracking**: Auto-deduction of stock on sale; alerts for low stock.
- **Courier Integration**: (Infrastructure ready) Support for Steadfast, Pathao, RedX.

---

## 3. Customer Features (End Users)

The shopping experience provided to the end consumers.

### 3.1 Shopping Experience

- **Dynamic Storefronts**: Fast, SEO-optimized storefronts powered by Remix and Cloudflare.
- **AI Personalization**:
  - **Smart Recommendations**: Shows "You might also like" products on product pages based on what other customers bought together.
- **Product Discovery**: Search, Filter, and Categories.
- **Responsive Design**: Smooth experience on Desktop, Tablet, and Mobile.

### 3.2 Cart & Checkout

- **Smart Cart**: Persistent cart leveraging local storage.
- **Fast Checkout**: Simplified checkout form (Name, Phone, Address) optimized for BD market (Division/District selection).
- **Payment Methods**: Cash on Delivery (COD) and Digital Payments (bKash - integrated).

### 3.3 Post-Purchase

- **Order Tracking**: Track order status using Order ID.
- **Notifications**: SMS/WhatsApp updates on order status changes.

---

## 4. Technical Architecture & Core

- **Platform**: Built on [Remix](https://remix.run/) and [Cloudflare Workers](https://workers.cloudflare.com/) for edge performance.
- **Database**: **Cloudflare D1** (SQLite at the Edge) for fast, distributed data access.
- **AI Engine**:
  - **RAG (Retrieval-Augmented Generation)**: Uses **Cloudflare Vectorize** to give AI agents access to real-time store data.
  - **LLM**: Compatible with OpenAI and other LLM providers via standard API.
- **Security**:
  - **Role-Based Access Control (RBAC)**: Strict separation between Super Admin, Merchant, and Customer data.
  - **Data Isolation**: Row-level security logic ensures merchants only see their own data.
