# Merchant Features (Store Owners)

Merchants have access to a powerful dashboard to manage their e-commerce business. This document outlines the features available to them and the technology behind them.

## ⚠️ Important Note on Billing: System Logic vs. AI

Some features use **Internal System Logic** (Free, no extra cost to you) while others use **Generative AI** (Paid, costs money per usage).

- **System Automation (Free)**: Features powered by SQL queries, Statistics, and Code Algorithms.
- **AI Powered (Paid)**: Features using LLMs (OpenAI, etc.) for text generation or complex reasoning.

---

## 1. Analytics & Growth (Smart Scaling)

_Tools to grow their business using data._

### 1.1 Sales Forecasting (System Logic - Free)

- **Function**: Uses **Linear Regression** (Statistical Math) on the last 30 days of sales data to predict revenue for the next 7-30 days.
- **Cost**: **$0**. Validates purely via code logic. No AI token usage.

### 1.2 Customer Lifetime Value (CLV) (System Logic - Free)

- **Function**: Calculates prediction based on Average Order Value (AOV) × Purchase Frequency.
- **Cost**: **$0**. Uses pure SQL aggregation.

### 1.3 Growth Opportunities Card (System Logic - Free)

- **Function**: Uses the output of Forecast & CLV to suggest actions (e.g., "Launch Retention Campaign").
- **Cost**: **$0**. Logic is programmed in the dashboard code.

### 1.4 Dynamic Recommendations (System Logic - Free)

- **Function**: "People also bought X" logic. Uses **Collaborative Filtering** (SQL Query) to find co-related products in order history.
- **Cost**: **$0**. Efficient database query.

---

## 2. Marketing & Automation

_Automate customer engagement._

### 2.1 Messaging Automation (System Logic by default)

- **Abandoned Cart Recovery**: Automatically finds carts abandoned >1 hour ago (check interval: scheduler job). Recovery link sent via WhatsApp (Priority) or SMS.
- **Win-Back Campaigns**: Automated targeted offers to customers inactive for 30+ days.
- **Order Confirmation**: Triggered by order creation events.
- **Cost**: SMS/WhatsApp gateway fees apply (SSL Wireless / Meta Cloud API), but **NO AI Cost** unless "AI Message Generation" is explicitly used.

### 2.2 Loyalty & Retention (System Logic - Free)

- **Tiered Loyalty Program**:
  - **Bronze**: 1x Points (Base).
  - **Silver (Spent > 10,000 BDT)**: 1.2x Points.
  - **Gold (Spent > 50,000 BDT)**: 1.5x Points.
  - **Platinum (Spent > 100,000 BDT)**: 2x Points.
- **Referral System**: Bonus points awarded to referrers when their friends make a first purchase.
- **Point Redemption**: Customers can use points to get discounts on future orders (configured by merchant).
- **Cost**: **$0**. Built-in logic engine.

### 2.3 A/B Testing (System Logic - Pro Plan)

- **Function**: Create multiple versions of product pages or landing pages to see which one performs better.
- **Metrics**: Tracks Views, Conversions, and Revenue per variant.
- **Cost**: **$0** (included in Pro/Business plans). Uses database-driven traffic splitting.

### 2.4 AI Co-Pilot & Assistant (AI Powered - Paid) 🤖

- **Smart Assistant**: Chatbot that answers questions ("How are sales today?").
- **Cost**: Uses LLM Tokens. **Billable**.

### 2.3 Marketing Copy Generator (AI Powered - Paid) 🤖

- **Function**: Generates ad copy or SMS text.
- **Cost**: Uses LLM Tokens. **Billable**.

---

## 3. Core Store Features (System Logic - Free)

_Standard e-commerce capabilities._

- **Live Store Editor**: Drag-and-drop customization with GrapesJS.
- **Advanced Page Builder**: Support for Motion Effects, Shape Dividers, Popup Builder, and Custom CSS.
- **Product Management**: Inventory tracking, variants, and SEO customization.
- **Order Management**: Invoicing, status updates, and courier integration.
- **Customer CRM**: Order history, basic profiles, and smart segmentation (VIP, Churn Risk, etc.).

---

## 4. Customer-Facing Features

_What shoppers experience._

- **Dynamic Storefronts**: Fast loading Remix apps.
- **Smart Cart**: Persistent cart storage.
- **Fast Checkout**: Simplified BD-style checkout.
- **Notifications**: Real-time status updates via SMS/WhatsApp.
