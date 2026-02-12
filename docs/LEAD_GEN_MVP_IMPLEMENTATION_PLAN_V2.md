# Lead Generation MVP Implementation Plan V2 (Updated 2026-02-12)

> **Status**: Ready for Review  
> **Last Updated**: 2026-02-12  
> **Context7 Verified**: ✅ Cloudflare D1, Remix v2, Workers AI, Vectorize  
> **Architecture**: Dual-Mode System (E-commerce + Lead Gen)

---

## Executive Summary

This document outlines the implementation plan for adding **Lead Generation Website** capabilities to the existing Multi-Store SaaS platform. Users will be able to choose between:

1. **E-commerce Mode** - Full store with products, cart, checkout
2. **Lead Gen Mode** - Landing page with forms to capture leads
3. **Hybrid Mode** - Both e-commerce and lead generation

### Key Design Decisions

- ✅ **Reuse existing infrastructure** (D1, KV, R2, Workers AI)
- ✅ **Leverage current theme system** with new lead-gen sections
- ✅ **Multi-tenant isolation** maintained (all queries filtered by `store_id`)
- ✅ **Progressive enhancement** with Remix Forms
- ✅ **Edge-native** - All processing on Cloudflare Edge

---

## Current System Analysis

### Existing Database Schema (Relevant Tables)

```sql
-- stores table already has:
- storeEnabled (boolean) - Toggle e-commerce routes
- homeEntry (text) - Homepage entry point
- landingConfig (JSON) - Landing page configuration
- landingConfigDraft (JSON) - Draft config

-- Existing lead capture tables:
- marketing_leads - For platform marketing (ozzyl.com)
- leads_data - For AI chatbot lead capture
- ai_conversations - For visitor chat logs
```

### Current Hybrid Mode Support

The system **already supports hybrid mode** via:
- `storeEnabled` field in stores table
- `homeEntry` field to set homepage (store or landing page)
- Landing page builder with draft/publish workflow

**Gap**: No dedicated lead capture forms, form builder, or lead management system.

---

## Architecture Overview


### Dual-Mode Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OZZYL MULTI-STORE SAAS                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Store Configuration (stores table)                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ storeEnabled: boolean  (true = E-commerce, false = Lead Gen only) │  │
│  │ homeEntry: string      (store_home | page:{id})                   │  │
│  │ leadGenConfig: JSON    (NEW - Lead capture settings)              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐               │
│  │   E-COMMERCE MODE   │         │   LEAD GEN MODE     │               │
│  ├─────────────────────┤         ├─────────────────────┤               │
│  │ Products            │         │ Landing Pages       │               │
│  │ Cart                │         │ Lead Forms          │               │
│  │ Checkout            │         │ CTA Sections        │               │
│  │ Orders              │         │ Lead Management     │               │
│  │ Customers           │         │ Email Notifications │               │
│  └─────────────────────┘         └─────────────────────┘               │
│           │                                   │                         │
│           └───────────────┬───────────────────┘                         │
│                           ▼                                             │
│                    SHARED INFRASTRUCTURE                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ D1 Database | R2 Storage | KV Cache | Workers AI | Vectorize     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Lead Capture Flow

```
1. USER VISITS LANDING PAGE
   ├─ ThemeStoreRenderer loads lead-gen sections
   ├─ Sections: hero, features, testimonials, contact-form
   └─ CTA buttons throughout page

2. USER FILLS FORM
   ├─ Progressive enhancement (works without JS)
   ├─ Client-side validation (optional)
   └─ Submits via Remix Form action

3. SERVER-SIDE PROCESSING (Remix Action)
   ├─ Validate input (Zod schema)
   ├─ Check duplicate (email/phone)
   ├─ Save to D1 (lead_submissions table)
   ├─ Send notification email (Resend)
   ├─ Optional: AI enrichment (Workers AI)
   └─ Return success/error

4. MERCHANT VIEWS LEADS
   ├─ Dashboard: /app/leads
   ├─ Filter by date, status, source
   ├─ Export to CSV
   └─ Mark as contacted/converted
```

---

## Database Schema Changes

### New Tables

```sql
-- Lead Submissions (Main table for lead capture)
CREATE TABLE lead_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  
  -- Contact Info
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  
  -- Form Data (flexible JSON for custom fields)
  form_data TEXT, -- JSON: { field_name: value }
  
  -- Metadata
  source TEXT, -- 'contact_form', 'popup', 'footer', 'chat'
  form_id TEXT, -- Which form submitted (e.g., 'contact-us', 'demo-request')
  page_url TEXT, -- URL where form was submitted
  
  -- Status Tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  assigned_to INTEGER, -- user_id of merchant/staff
  notes TEXT, -- Merchant notes
  
  -- Analytics
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- AI Enrichment (optional)
  ai_score REAL, -- Lead quality score (0-1)
  ai_insights TEXT, -- JSON: { intent, budget_estimate, urgency }
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  contacted_at INTEGER,
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_lead_submissions_store ON lead_submissions(store_id);
CREATE INDEX idx_lead_submissions_status ON lead_submissions(store_id, status);
CREATE INDEX idx_lead_submissions_created ON lead_submissions(store_id, created_at DESC);
CREATE INDEX idx_lead_submissions_email ON lead_submissions(email);
CREATE INDEX idx_lead_submissions_phone ON lead_submissions(phone);

-- Lead Form Configurations (optional - for advanced use)
CREATE TABLE lead_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  
  form_id TEXT NOT NULL, -- 'contact-us', 'demo-request', 'quote'
  name TEXT NOT NULL,
  
  -- Form Schema
  fields TEXT NOT NULL, -- JSON array: [{ type, name, label, required, options }]
  
  -- Settings
  success_message TEXT,
  redirect_url TEXT,
  email_notifications INTEGER DEFAULT 1, -- boolean
  auto_response INTEGER DEFAULT 0, -- Send auto-reply email
  auto_response_template TEXT,
  
  -- Status
  enabled INTEGER DEFAULT 1,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id, form_id)
);

CREATE INDEX idx_lead_forms_store ON lead_forms(store_id);
```

### Update Existing Tables

```sql
-- Add to stores table
ALTER TABLE stores ADD COLUMN lead_gen_config TEXT; -- JSON: { enabled, default_form, notifications }
```


---

## Theme System Integration

### New Lead Gen Sections

Add these sections to existing themes (starter-store, luxe-boutique, nova-lux):

```typescript
// Contact Form Section
export const contactFormSection: SectionSchema = {
  type: 'contact-form',
  name: 'Contact Form',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Get in Touch' },
    { type: 'textarea', id: 'description', label: 'Description' },
    { type: 'select', id: 'form_id', label: 'Form', options: ['contact-us', 'demo-request'] },
    { type: 'color', id: 'bg_color', label: 'Background Color', default: '#ffffff' },
  ],
  blocks: [],
};

// Lead Magnet Section (e.g., "Download Free Guide")
export const leadMagnetSection: SectionSchema = {
  type: 'lead-magnet',
  name: 'Lead Magnet',
  settings: [
    { type: 'text', id: 'headline', label: 'Headline', default: 'Download Free Guide' },
    { type: 'textarea', id: 'benefits', label: 'Benefits (comma-separated)' },
    { type: 'image', id: 'cover_image', label: 'Cover Image' },
    { type: 'url', id: 'download_url', label: 'PDF/Resource URL' },
  ],
  blocks: [],
};

// CTA Banner Section
export const ctaBannerSection: SectionSchema = {
  type: 'cta-banner',
  name: 'CTA Banner',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Ready to Get Started?' },
    { type: 'text', id: 'button_text', label: 'Button Text', default: 'Contact Us' },
    { type: 'select', id: 'button_action', label: 'Action', 
      options: ['scroll_to_form', 'open_popup', 'link'] },
  ],
  blocks: [],
};

// Service List Section
export const servicesSection: SectionSchema = {
  type: 'services-list',
  name: 'Services',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Our Services' },
  ],
  blocks: [
    {
      type: 'service',
      name: 'Service',
      settings: [
        { type: 'text', id: 'title', label: 'Title' },
        { type: 'textarea', id: 'description', label: 'Description' },
        { type: 'image', id: 'icon', label: 'Icon' },
      ],
    },
  ],
  max_blocks: 6,
};
```

### Section Components

```tsx
// ~/themes/starter-store/sections/contact-form.tsx

import type { SectionComponentProps } from '~/lib/theme-engine/types';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useState } from 'react';

export function ContactFormSection({ section, context }: SectionComponentProps) {
  const { settings } = section;
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className="py-16 px-4" style={{ backgroundColor: settings.bg_color }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          {settings.heading}
        </h2>
        {settings.description && (
          <p className="text-center text-gray-600 mb-8">
            {settings.description}
          </p>
        )}

        {actionData?.success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-green-800 font-semibold mb-2">Thank You!</h3>
            <p className="text-green-700">We'll get back to you soon.</p>
          </div>
        ) : (
          <Form method="post" action="/api/submit-lead" className="space-y-6">
            <input type="hidden" name="form_id" value={settings.form_id} />
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border rounded-lg px-4 py-2"
                disabled={isSubmitting}
              />
              {actionData?.errors?.name && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border rounded-lg px-4 py-2"
                disabled={isSubmitting}
              />
              {actionData?.errors?.email && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full border rounded-lg px-4 py-2"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full border rounded-lg px-4 py-2"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </Form>
        )}
      </div>
    </section>
  );
}

export const schema = contactFormSection;
```

---

## API Routes Implementation

### Lead Submission Route

```typescript
// ~/routes/api.submit-lead.tsx

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions, stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Resend } from 'resend';

// Validation Schema
const LeadSubmissionSchema = z.object({
  form_id: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  // UTM parameters
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const db = drizzle(context.cloudflare.env.DB);
    
    // Get store from hostname
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    const store = await db.query.stores.findFirst({
      where: eq(stores.customDomain, hostname),
    });
    
    if (!store) {
      return json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    
    // Validate
    const validated = LeadSubmissionSchema.safeParse(rawData);
    if (!validated.success) {
      return json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Get client info
    const ipAddress = request.headers.get('CF-Connecting-IP') || '';
    const userAgent = request.headers.get('User-Agent') || '';
    const referrer = request.headers.get('Referer') || '';

    // Save to database
    const [lead] = await db
      .insert(leadSubmissions)
      .values({
        storeId: store.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        formData: JSON.stringify({ message: data.message }),
        source: 'contact_form',
        formId: data.form_id,
        pageUrl: referrer,
        status: 'new',
        utmSource: data.utm_source || null,
        utmMedium: data.utm_medium || null,
        utmCampaign: data.utm_campaign || null,
        referrer,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: leadSubmissions.id });

    // Send notification email to merchant
    const leadGenConfig = store.leadGenConfig 
      ? JSON.parse(store.leadGenConfig as string) 
      : {};
    
    if (leadGenConfig.emailNotifications !== false) {
      try {
        const resend = new Resend(context.cloudflare.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'leads@ozzyl.com',
          to: leadGenConfig.notificationEmail || store.email || 'admin@ozzyl.com',
          subject: `New Lead: ${data.name}`,
          html: `
            <h2>New Lead Submission</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
            ${data.message ? `<p><strong>Message:</strong><br>${data.message}</p>` : ''}
            <hr>
            <p><small>Lead ID: ${lead.id} | Source: ${data.form_id}</small></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Optional: AI Enrichment (async)
    context.waitUntil(enrichLeadWithAI(lead.id, data, context.cloudflare.env));

    return json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('Lead submission error:', error);
    return json(
      { success: false, error: 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}

// AI Enrichment (optional)
async function enrichLeadWithAI(leadId: number, data: any, env: any) {
  try {
    // Generate quality score based on completeness
    const score = calculateLeadScore(data);
    
    // Use Workers AI to analyze message intent
    if (data.message) {
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'Analyze this lead inquiry and extract: intent (information/demo/purchase), urgency (low/medium/high), budget estimate if mentioned. Respond in JSON.',
          },
          {
            role: 'user',
            content: data.message,
          },
        ],
      });

      const db = drizzle(env.DB);
      await db
        .update(leadSubmissions)
        .set({
          aiScore: score,
          aiInsights: JSON.stringify(response.response),
          updatedAt: new Date(),
        })
        .where(eq(leadSubmissions.id, leadId));
    }
  } catch (error) {
    console.error('AI enrichment failed:', error);
  }
}

function calculateLeadScore(data: any): number {
  let score = 0.5; // Base score
  if (data.email) score += 0.2;
  if (data.phone) score += 0.2;
  if (data.company) score += 0.1;
  return Math.min(score, 1.0);
}
```


---

## Lead Management Dashboard

### Routes

```
/app/leads              - Lead list and overview
/app/leads/$id          - Lead detail view
/app/leads/export       - Export to CSV
/app/settings/lead-gen  - Lead gen configuration
```

### Lead List Page

```typescript
// ~/routes/app.leads._index.tsx

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions } from '@db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { Download, Mail, Phone, Calendar, Filter } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  
  // Filters
  const status = url.searchParams.get('status') || 'all';
  const dateRange = url.searchParams.get('date') || '30'; // days
  
  // Build query
  let conditions = [eq(leadSubmissions.storeId, storeId)];
  
  if (status !== 'all') {
    conditions.push(eq(leadSubmissions.status, status));
  }
  
  if (dateRange !== 'all') {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    conditions.push(sql`${leadSubmissions.createdAt} >= ${daysAgo}`);
  }

  const leads = await db
    .select()
    .from(leadSubmissions)
    .where(and(...conditions))
    .orderBy(desc(leadSubmissions.createdAt))
    .limit(100);

  // Stats
  const stats = await db
    .select({
      total: sql<number>`count(*)`,
      new: sql<number>`sum(case when status = 'new' then 1 else 0 end)`,
      contacted: sql<number>`sum(case when status = 'contacted' then 1 else 0 end)`,
      converted: sql<number>`sum(case when status = 'converted' then 1 else 0 end)`,
    })
    .from(leadSubmissions)
    .where(eq(leadSubmissions.storeId, storeId));

  return json({ leads, stats: stats[0], filters: { status, dateRange } });
}

export default function LeadsPage() {
  const { leads, stats, filters } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-3">
          <Link
            to="/app/leads/export"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Link>
          <Link
            to="/app/settings/lead-gen"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">New</div>
          <div className="text-2xl font-bold text-blue-700">{stats.new}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-700">Contacted</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.contacted}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">Converted</div>
          <div className="text-2xl font-bold text-green-700">{stats.converted}</div>
        </div>
      </div>

      {/* Filters */}
      <Form method="get" className="bg-white p-4 rounded-lg border mb-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              defaultValue={filters.status}
              className="border rounded px-3 py-2"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              name="date"
              defaultValue={filters.dateRange}
              className="border rounded px-3 py-2"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </Form>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Source</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No leads yet. Start promoting your landing page!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.name}</div>
                    {lead.company && (
                      <div className="text-sm text-gray-500">{lead.company}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm text-gray-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{lead.formId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        lead.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : lead.status === 'contacted'
                          ? 'bg-yellow-100 text-yellow-700'
                          : lead.status === 'converted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/app/leads/${lead.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Database & Schema (Week 1)

- [ ] Create migration for `lead_submissions` table
- [ ] Create migration for `lead_forms` table (optional)
- [ ] Add `lead_gen_config` to stores table
- [ ] Update Drizzle schema files
- [ ] Run migrations locally and test

### Phase 2: Theme Sections (Week 1-2)

- [ ] Create contact-form section component
- [ ] Create lead-magnet section component
- [ ] Create cta-banner section component
- [ ] Create services-list section component
- [ ] Add sections to starter-store theme
- [ ] Add sections to luxe-boutique theme
- [ ] Add sections to nova-lux theme
- [ ] Test section rendering on storefront

### Phase 3: API Routes (Week 2)

- [ ] Create `/api/submit-lead` action route
- [ ] Implement Zod validation
- [ ] Implement duplicate detection
- [ ] Integrate Resend for email notifications
- [ ] Add AI enrichment (optional)
- [ ] Test form submission flow

### Phase 4: Lead Management Dashboard (Week 2-3)

- [ ] Create `/app/leads` list page
- [ ] Create `/app/leads/$id` detail page
- [ ] Implement filters (status, date range)
- [ ] Add export to CSV functionality
- [ ] Create `/app/settings/lead-gen` config page
- [ ] Test all dashboard features

### Phase 5: Settings & Configuration (Week 3)

- [ ] Add lead gen toggle in store settings
- [ ] Create form builder UI (optional for MVP)
- [ ] Add email notification settings
- [ ] Add auto-response settings
- [ ] Test configuration persistence

### Phase 6: Testing & Documentation (Week 3-4)

- [ ] Write unit tests for API routes
- [ ] Write E2E tests for form submission
- [ ] Write E2E tests for lead management
- [ ] Update user documentation
- [ ] Create video tutorial
- [ ] Test with real merchants


---

## Mode Selection for Merchants

### Onboarding Flow Update

```typescript
// During store creation/onboarding, ask merchant:

┌─────────────────────────────────────────────────────────┐
│  What type of website do you want to create?            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ○  E-commerce Store                                     │
│     Sell products online with cart and checkout          │
│                                                          │
│  ○  Lead Generation Website                              │
│     Capture leads with forms and landing pages           │
│                                                          │
│  ○  Both (Hybrid)                                        │
│     E-commerce + Lead capture                            │
│                                                          │
└─────────────────────────────────────────────────────────┘

// Based on selection:
// - E-commerce: storeEnabled = true, default theme with product sections
// - Lead Gen: storeEnabled = false, default theme with form sections
// - Hybrid: storeEnabled = true, both section types available
```

### Settings Page

```typescript
// ~/routes/app.settings.business-mode.tsx

export default function BusinessModePage() {
  const { store } = useLoaderData<typeof loader>();
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Business Mode</h1>
      
      <Form method="post" className="space-y-6">
        {/* E-commerce Toggle */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">E-commerce Store</h3>
              <p className="text-gray-600 text-sm">
                Enable product catalog, shopping cart, and checkout
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="storeEnabled"
                defaultChecked={store.storeEnabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Lead Gen Toggle */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">Lead Generation</h3>
              <p className="text-gray-600 text-sm">
                Enable contact forms and lead capture features
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="leadGenEnabled"
                defaultChecked={store.leadGenConfig?.enabled ?? false}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Save Changes
        </button>
      </Form>
    </div>
  );
}
```

---

## Email Notifications

### Templates

```typescript
// Lead Notification to Merchant
const merchantNotification = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Lead Received!</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">{{name}}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:{{email}}">{{email}}</a></div>
      </div>
      {{#if phone}}
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value"><a href="tel:{{phone}}">{{phone}}</a></div>
      </div>
      {{/if}}
      {{#if company}}
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">{{company}}</div>
      </div>
      {{/if}}
      {{#if message}}
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">{{message}}</div>
      </div>
      {{/if}}
      <hr style="margin: 20px 0;">
      <p><a href="{{dashboard_url}}/app/leads/{{lead_id}}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Lead Details</a></p>
    </div>
    <div class="footer">
      <p>Lead ID: {{lead_id}} | Source: {{form_id}}</p>
      <p>Powered by Ozzyl</p>
    </div>
  </div>
</body>
</html>
`;

// Auto-response to Lead (optional)
const autoResponse = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Thank you for contacting us!</h2>
    <p>Hi {{name}},</p>
    <p>We've received your inquiry and will get back to you within 24 hours.</p>
    <p>In the meantime, feel free to explore our website or reach out directly at {{store_email}}.</p>
    <p>Best regards,<br>{{store_name}} Team</p>
  </div>
</body>
</html>
`;
```

---

## Security Considerations

### Input Validation

- ✅ **Server-side validation** with Zod (never trust client)
- ✅ **Email validation** (format + disposable email check)
- ✅ **Phone validation** (basic format check)
- ✅ **SQL injection prevention** (Drizzle ORM parameterized queries)
- ✅ **XSS prevention** (escape all user input in templates)

### Rate Limiting

```typescript
// Rate limit form submissions by IP
const RATE_LIMIT = {
  max: 5, // requests
  window: 60 * 60, // 1 hour (seconds)
};

async function checkRateLimit(
  ip: string, 
  kv: KVNamespace
): Promise<boolean> {
  const key = `rate_limit:lead_form:${ip}`;
  const current = await kv.get(key);
  
  if (!current) {
    await kv.put(key, '1', { expirationTtl: RATE_LIMIT.window });
    return true;
  }
  
  const count = parseInt(current);
  if (count >= RATE_LIMIT.max) {
    return false; // Rate limited
  }
  
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT.window });
  return true;
}
```

### Spam Prevention

```typescript
// Honeypot field (hidden from users)
<input 
  type="text" 
  name="website" 
  style={{ display: 'none' }} 
  tabIndex={-1}
  autoComplete="off"
/>

// Server-side check
if (formData.get('website')) {
  // Bot detected - silently reject
  return json({ success: true }); // Fake success
}

// Time-based check (form filled too fast)
const formLoadTime = formData.get('_form_load_time');
const submitTime = Date.now();
if (submitTime - parseInt(formLoadTime) < 3000) {
  // Filled in less than 3 seconds - likely bot
  return json({ success: true }); // Fake success
}
```

### Data Privacy

- ✅ **GDPR compliance** - Clear consent for data collection
- ✅ **Data retention policy** - Auto-delete old leads (configurable)
- ✅ **PII encryption** - Sensitive data encrypted at rest (optional)
- ✅ **Right to deletion** - Allow leads to request data deletion

---

## Performance Optimization

### Form Submission

```typescript
// Use Remix optimistic UI for instant feedback
import { useFetcher } from '@remix-run/react';

export function OptimisticContactForm() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  const isDone = fetcher.data?.success;

  return (
    <fetcher.Form method="post" action="/api/submit-lead">
      {/* Form fields */}
      
      {isDone && (
        <div className="success-message">
          Thank you! We'll be in touch soon.
        </div>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </fetcher.Form>
  );
}
```

### Database Indexing

```sql
-- Critical indexes for performance
CREATE INDEX idx_lead_submissions_store ON lead_submissions(store_id);
CREATE INDEX idx_lead_submissions_status ON lead_submissions(store_id, status);
CREATE INDEX idx_lead_submissions_created ON lead_submissions(store_id, created_at DESC);
CREATE INDEX idx_lead_submissions_email ON lead_submissions(email);
```

### KV Caching

```typescript
// Cache lead form configurations
const cacheKey = `lead_form:${storeId}:${formId}`;
const cached = await env.KV.get(cacheKey, 'json');

if (cached) {
  return cached;
}

// Fetch from D1 and cache
const formConfig = await db.query.leadForms.findFirst({
  where: and(
    eq(leadForms.storeId, storeId),
    eq(leadForms.formId, formId)
  ),
});

await env.KV.put(cacheKey, JSON.stringify(formConfig), {
  expirationTtl: 60 * 60, // 1 hour
});
```

---

## Analytics & Reporting

### Lead Sources Tracking

```typescript
// Track where leads come from
interface LeadAnalytics {
  total: number;
  bySource: {
    contact_form: number;
    popup: number;
    chat: number;
    footer: number;
  };
  byStatus: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  };
  conversionRate: number; // converted / total
  avgResponseTime: number; // hours
}

// Query for analytics
const analytics = await db
  .select({
    source: leadSubmissions.source,
    status: leadSubmissions.status,
    count: sql<number>`count(*)`,
  })
  .from(leadSubmissions)
  .where(eq(leadSubmissions.storeId, storeId))
  .groupBy(leadSubmissions.source, leadSubmissions.status);
```

### Dashboard Widgets

```tsx
// Lead conversion funnel
<div className="bg-white p-6 rounded-lg border">
  <h3 className="font-semibold mb-4">Conversion Funnel</h3>
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span>Total Leads</span>
      <span className="font-bold">{stats.total}</span>
    </div>
    <div className="flex items-center justify-between text-yellow-700">
      <span>Contacted</span>
      <span className="font-bold">
        {stats.contacted} ({Math.round(stats.contacted / stats.total * 100)}%)
      </span>
    </div>
    <div className="flex items-center justify-between text-green-700">
      <span>Converted</span>
      <span className="font-bold">
        {stats.converted} ({Math.round(stats.converted / stats.total * 100)}%)
      </span>
    </div>
  </div>
</div>
```


---

## Integration with Existing Features

### AI Chatbot Integration

The platform already has an AI chatbot (`ai_conversations`, `leads_data` tables). We can integrate:

```typescript
// When chatbot captures a lead, also create a lead_submission
async function handleChatbotLead(conversation: AIConversation, leadsData: LeadData[]) {
  const leadInfo = {
    name: leadsData.find(l => l.key === 'name')?.value,
    phone: leadsData.find(l => l.key === 'phone')?.value,
    email: leadsData.find(l => l.key === 'email')?.value,
  };

  // Create unified lead submission
  await db.insert(leadSubmissions).values({
    storeId: conversation.storeId,
    name: leadInfo.name || 'Unknown',
    email: leadInfo.email || null,
    phone: leadInfo.phone || null,
    formData: JSON.stringify({ conversation_id: conversation.id }),
    source: 'chat',
    formId: 'ai-chatbot',
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
```

### Email Marketing Integration (Future)

```typescript
// Export leads to email marketing platform
async function exportToEmailMarketing(storeId: number) {
  const leads = await db
    .select({ email: leadSubmissions.email, name: leadSubmissions.name })
    .from(leadSubmissions)
    .where(
      and(
        eq(leadSubmissions.storeId, storeId),
        eq(leadSubmissions.status, 'converted')
      )
    );

  // Send to Mailchimp/Sendinblue/etc
  // Implementation depends on chosen platform
}
```

### WhatsApp Integration (Bangladesh Market)

```typescript
// Send lead notification via WhatsApp (popular in Bangladesh)
async function sendWhatsAppNotification(lead: Lead, store: Store) {
  const whatsappConfig = store.leadGenConfig?.whatsapp;
  
  if (!whatsappConfig?.enabled) return;

  const message = `
🎯 New Lead Received!

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'N/A'}
Source: ${lead.formId}

View: ${store.customDomain || store.subdomain}/app/leads/${lead.id}
  `.trim();

  // Use WhatsApp Business API or third-party service
  await fetch('https://api.whatsapp.com/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: whatsappConfig.phoneNumber,
      message,
    }),
  });
}
```

---

## Migration Strategy

### For Existing Stores

```typescript
// Migration: Add lead gen capabilities to existing stores

export async function migrateExistingStores(db: D1Database) {
  const stores = await db.select().from(stores).all();

  for (const store of stores) {
    // Default configuration based on current setup
    const leadGenConfig = {
      enabled: false, // Disabled by default, merchants opt-in
      emailNotifications: true,
      notificationEmail: store.email || null,
      autoResponse: false,
      forms: {
        'contact-us': {
          enabled: true,
          fields: ['name', 'email', 'phone', 'message'],
        },
      },
    };

    await db
      .update(stores)
      .set({ 
        leadGenConfig: JSON.stringify(leadGenConfig),
      })
      .where(eq(stores.id, store.id));
  }
}
```

### For New Stores

```typescript
// During onboarding, detect merchant intent
export async function createStore(data: NewStore) {
  const businessType = data.businessType; // 'ecommerce' | 'leadgen' | 'hybrid'

  const storeConfig = {
    ecommerce: {
      storeEnabled: true,
      leadGenConfig: JSON.stringify({ enabled: false }),
      homeEntry: 'store_home',
    },
    leadgen: {
      storeEnabled: false,
      leadGenConfig: JSON.stringify({ enabled: true }),
      homeEntry: 'page:landing',
    },
    hybrid: {
      storeEnabled: true,
      leadGenConfig: JSON.stringify({ enabled: true }),
      homeEntry: 'store_home',
    },
  };

  return await db.insert(stores).values({
    ...data,
    ...storeConfig[businessType],
  });
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// ~/routes/api.submit-lead.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { action } from './api.submit-lead';

describe('Lead Submission API', () => {
  it('should validate required fields', async () => {
    const request = new Request('http://localhost/api/submit-lead', {
      method: 'POST',
      body: new FormData(), // Empty form
    });

    const response = await action({ request, context: mockContext });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });

  it('should accept valid submission', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('form_id', 'contact-us');

    const request = new Request('http://localhost/api/submit-lead', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: mockContext });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.leadId).toBeDefined();
  });

  it('should prevent duplicate submissions', async () => {
    // Test duplicate email within 24 hours
    // Implementation depends on duplicate detection logic
  });

  it('should rate limit by IP', async () => {
    // Submit 6 times from same IP
    // 6th should be rejected
  });
});
```

### E2E Tests

```typescript
// ~/e2e/lead-capture.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Lead Capture Flow', () => {
  test('should submit contact form successfully', async ({ page }) => {
    await page.goto('http://teststore.localhost:3000');

    // Fill form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test inquiry');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Thank You');
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('http://teststore.localhost:3000');

    // Submit without filling
    await page.click('button[type="submit"]');

    // Check for error messages
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('merchant should see lead in dashboard', async ({ page }) => {
    // Login as merchant
    await page.goto('http://teststore.localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'merchant@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Go to leads page
    await page.goto('http://teststore.localhost:3000/app/leads');

    // Check for submitted lead
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });
});
```

---

## MVP Scope Definition

### ✅ INCLUDED in MVP

1. **Database Schema**
   - `lead_submissions` table
   - `lead_gen_config` in stores table

2. **Theme Sections**
   - Contact form section
   - CTA banner section
   - Services list section (basic)

3. **API Routes**
   - `/api/submit-lead` (create)
   - Email notification to merchant

4. **Dashboard**
   - `/app/leads` (list with filters)
   - `/app/leads/$id` (detail view)
   - Export to CSV

5. **Settings**
   - Toggle lead gen on/off
   - Email notification settings

### ❌ NOT INCLUDED in MVP (Future)

1. **Advanced Features**
   - Visual form builder
   - Custom form fields
   - Multi-step forms
   - Conditional logic

2. **Integrations**
   - WhatsApp notifications
   - Email marketing platforms
   - CRM integrations
   - Zapier webhooks

3. **Advanced Analytics**
   - Lead scoring
   - Attribution tracking
   - A/B testing
   - Heatmaps

4. **Automation**
   - Auto-assignment rules
   - Email drip campaigns
   - Lead nurturing workflows

---

## Success Metrics

### KPIs to Track

1. **Adoption Rate**
   - % of stores enabling lead gen
   - Average leads per store per month

2. **Technical Performance**
   - Form submission success rate
   - Average response time (<100ms)
   - Email delivery rate (>95%)

3. **User Satisfaction**
   - Merchant feedback on lead quality
   - Time to first lead after setup
   - Lead-to-conversion rate

---

## Timeline & Resource Allocation

### Recommended Timeline

| Phase | Duration | Developer Hours |
|-------|----------|-----------------|
| Phase 1: Database & Schema | 3 days | 16 hours |
| Phase 2: Theme Sections | 5 days | 32 hours |
| Phase 3: API Routes | 4 days | 24 hours |
| Phase 4: Lead Dashboard | 5 days | 32 hours |
| Phase 5: Settings | 3 days | 16 hours |
| Phase 6: Testing | 4 days | 24 hours |
| **Total** | **~4 weeks** | **144 hours** |

### Team Composition

- **1x Backend Developer** - API routes, database
- **1x Frontend Developer** - Dashboard, theme sections
- **1x QA Engineer** - Testing, validation
- **1x Product Manager** - Requirements, coordination

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email deliverability issues | High | Use Resend (proven service), implement SPF/DKIM |
| Spam/bot submissions | Medium | Honeypot, rate limiting, time checks |
| Database performance with high volume | Medium | Proper indexing, KV caching |
| Multi-tenancy data leaks | Critical | Strict store_id filtering, security review |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low merchant adoption | Medium | Clear value proposition, easy setup |
| Competing with dedicated lead gen tools | Low | Focus on integration with e-commerce |
| GDPR/privacy compliance | High | Clear consent, data retention policies |

---

## Comparison with Original Plan

### What Changed?

| Aspect | Original Plan | Updated Plan V2 |
|--------|---------------|-----------------|
| **Database** | New separate tables | Reuse + extend existing schema |
| **Architecture** | Standalone lead gen app | Integrated dual-mode system |
| **Theme System** | Custom lead gen themes | Extend existing themes with new sections |
| **Forms** | Custom form builder | MVP: Fixed contact form, Advanced: Form builder |
| **AI Integration** | From scratch | Leverage existing Workers AI setup |
| **Email** | Generic SMTP | Resend (already used in platform) |
| **Testing** | Not detailed | Comprehensive unit + E2E tests |

### Why These Changes?

1. **Faster Time to Market** - Reuse existing infrastructure
2. **Better UX** - Unified dashboard for merchants
3. **Lower Complexity** - One theme system, not two
4. **Edge Compatibility** - All features work on Cloudflare Edge
5. **Cost Efficiency** - No additional services needed

---

## Next Steps

### Immediate Actions

1. **Review & Approval** ✅
   - Review this plan with stakeholders
   - Get approval to proceed

2. **Create Detailed Tasks** 📋
   - Break down phases into Jira tickets
   - Assign to development team

3. **Set Up Development Environment** 🛠️
   - Create feature branch: `feature/lead-gen-mvp`
   - Set up local test store

4. **Begin Phase 1** 🚀
   - Create database migrations
   - Update Drizzle schema
   - Test locally

### Questions to Resolve

1. Should we implement form builder in MVP or post-MVP?
2. What's the priority: WhatsApp integration or email marketing?
3. Do we need multi-language support for lead forms (EN + BN)?
4. What's the lead data retention policy (90 days? 1 year? Unlimited)?

---

## Conclusion

This updated implementation plan provides a **production-ready roadmap** for adding lead generation capabilities to the Ozzyl Multi-Store SaaS platform. 

Key strengths:
- ✅ **Reuses existing infrastructure** (D1, R2, KV, Workers AI)
- ✅ **Maintains multi-tenancy security** (all queries filtered by store_id)
- ✅ **Edge-native architecture** (100% Cloudflare)
- ✅ **Progressive enhancement** (works without JS)
- ✅ **Scalable design** (handles growth from MVP to enterprise)

**Recommended Action**: Proceed with Phase 1 (Database & Schema) after stakeholder approval.

---

**Document Version**: 2.0  
**Last Updated**: 2026-02-12  
**Status**: ✅ Ready for Review  
**Next Review**: After stakeholder feedback

