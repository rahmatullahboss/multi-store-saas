# Super Admin Features (Platform Owner)

The Super Admin dashboard is the control center for the entire SaaS platform. This document outlines the capabilities available to you as the platform owner.

## 1. AI Command Center

_Control your platform with natural language._

- **Natural Language Queries**: Ask questions like "Show me revenue for last 30 days" or "Which stores are at risk of churning?" to get instant data visualizations from the entire platform database.
- **Global Conversion Funnel**: Visualizes the aggregate customer journey (Visitors -> Carts -> Checkouts -> Orders) across all stores to identify platform-wide bottlenecks.
- **Merchant Health Scoring**: Auto-calculates a health score (0-100) for every store based on revenue, order volume, and **Conversion Rate**. It identifies:
  - 🟢 **Healthy**: Performing well.
  - 🟡 **At Risk**: Needs attention (e.g., declining sales).
  - 🔴 **Critical**: High churn risk or policy violation.
- **Trending Products**: Shows top-selling products platform-wide, helping you understand market trends.

## 2. Tenant & Subscription Management

_Manage your merchants and billing._

- **Store Management**:
  - **View All Stores**: See a list of all active and inactive stores.
  - **Impersonation**: Login as any merchant to debug issues or provide support.
  - **Suspension**: Suspend non-compliant stores with a click.
- **Plan Management**: Configure subscription tiers (Free, Pro, Enterprise) and set feature limits (e.g., max 100 products, AI message limits).

## 3. Theme Marketplace

_Curate the design options for your merchants._

- **Theme Management**: Upload, update, and delete store templates.
- **Validation System**: Automated checks ensure uploaded themes work with the AI Editor and are mobile-responsive.

## 4. Technical Architecture

_How it works under the hood (Cost Analysis)._

- **AI Engine (Shared)**: Uses a shared AI model for the Command Center.
- **Cost Efficiency**: Most analytics (Health Score, Funnels) use **System Logic (SQL/Stats)** instead of heavy AI calls, keeping your operational costs low.
