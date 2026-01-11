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

- **Abandoned Cart Recovery**: Triggered by time-delay logic (Cron Jobs).
- **Order Confirmation**: Triggered by order creation events.
- **Cost**: SMS/WhatsApp gateway fees apply, but **NO AI Cost** unless "AI Message Generation" is explicitly used.

### 2.2 AI Co-Pilot & Assistant (AI Powered - Paid) 🤖

- **Smart Assistant**: Chatbot that answers questions ("How are sales today?").
- **Cost**: Uses LLM Tokens. **Billable**.

### 2.3 Marketing Copy Generator (AI Powered - Paid) 🤖

- **Function**: Generates ad copy or SMS text.
- **Cost**: Uses LLM Tokens. **Billable**.

---

## 3. Core Store Features (System Logic - Free)

_Standard e-commerce capabilities._

- **Live Store Editor**: Drag-and-drop customization.
- **Product Management**: Inventory tracking, variants.
- **Order Management**: Invoicing, status updates.
- **Customer CRM**: Order history, basics profiles.

---

## 4. Customer-Facing Features

_What shoppers experience._

- **Dynamic Storefronts**: Fast loading Remix apps.
- **Smart Cart**: Persistent cart storage.
- **Fast Checkout**: Simplified BD-style checkout.
- **Notifications**: Real-time status updates via SMS/WhatsApp.
