/**
 * Storefront Published Page Route — Phase 7
 *
 * Route: /p/:storeId/:slug
 *
 * Reads the published page JSON snapshot from KV (key: `page:{storeId}:{slug}`).
 * If KV misses → 404 (page not published or expired).
 *
 * The snapshot contains all section props, page settings, and SEO metadata.
 * Sections are rendered client-side via the existing SectionRenderer component
 * (same component used by the editor preview), keeping the server path CPU-free.
 *
 * Bengali 404 is shown when the page is not found.
 *
 * Multi-tenancy: storeId is taken from the URL param and validated — no
 * cross-store data can leak because we only read a KV key scoped to that storeId.
 */

import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/cloudflare';
import { useLoaderData, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { z } from 'zod';
import { readPublishedPage, type PublishedPageSnapshot } from '~/services/builder-publisher.server';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';
import { FloatingActionButtons } from '~/components/page-builder/FloatingActionButtons';
import { OzzylBranding } from '~/components/OzzylBranding';
import { TemplateLayoutRenderer } from '~/components/page-builder/TemplateLayoutRenderer';

// ─── Zod param validation ─────────────────────────────────────────────────────

const ParamsSchema = z.object({
  storeId: z
    .string()
    .min(1, 'storeId is required')
    .refine((v) => /^\d+$/.test(v), { message: 'storeId must be a positive integer' })
    .transform(Number),
  slug: z
    .string()
    .min(1, 'slug is required')
    .max(200, 'slug is too long')
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
});

// ─── Loader Data ─────────────────────────────────────────────────────────────

type LoaderData = {
  snapshot: PublishedPageSnapshot;
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.snapshot) {
    return [{ title: 'পেজ পাওয়া যায়নি | Ozzyl' }];
  }
  const { settings, slug } = data.snapshot;
  const title = settings.seoTitle ?? settings.title ?? slug;
  const description = settings.seoDescription ?? '';

  const tags: ReturnType<MetaFunction> = [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ];

  if (settings.ogImage) {
    tags.push({ property: 'og:image', content: settings.ogImage });
  }

  if (settings.canonicalUrl) {
    tags.push({ tagName: 'link', rel: 'canonical', href: settings.canonicalUrl });
  }

  if (settings.noIndex) {
    tags.push({ name: 'robots', content: 'noindex, nofollow' });
  }

  return tags;
};

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ params, context }: LoaderFunctionArgs) {
  // ── Validate URL params with Zod ─────────────────────────────────────────
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Response('পেজ পাওয়া যায়নি', { status: 404 });
  }

  const { storeId, slug } = parsed.data;

  // ── KV availability guard ────────────────────────────────────────────────
  const kv: KVNamespace | undefined = context.cloudflare.env.STORE_CACHE;
  if (!kv) {
    // KV not configured — treat as page not found in development
    console.warn('[p.$storeId.$slug] STORE_CACHE KV binding is not configured');
    throw new Response('পেজ পাওয়া যায়নি', { status: 404 });
  }

  // ── Read from KV ─────────────────────────────────────────────────────────
  const snapshot = await readPublishedPage(kv, storeId, slug);

  if (!snapshot) {
    // KV miss → page not published or TTL expired
    throw new Response('পেজ পাওয়া যায়নি', { status: 404 });
  }

  // ── Validate snapshot storeId matches URL param (integrity check) ─────────
  // This prevents a hypothetical case where a key collision serves wrong tenant data.
  if (snapshot.storeId !== storeId) {
    console.error(
      `[p.$storeId.$slug] storeId mismatch: param=${storeId}, snapshot=${snapshot.storeId}`
    );
    throw new Response('পেজ পাওয়া যায়নি', { status: 404 });
  }

  return json<LoaderData>({ snapshot });
}

// ─── Default Component ────────────────────────────────────────────────────────

export default function PublishedBuilderPage() {
  const { snapshot } = useLoaderData<typeof loader>();
  const { settings, sections, storeId, slug } = snapshot;

  // Filter to only enabled sections, sorted by sortOrder
  const visibleSections = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <TemplateLayoutRenderer templateId={settings.templateId ?? 'default'}>
      {/* Custom header HTML injection (e.g. pixel scripts, chat widgets) */}
      {settings.customHeaderHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: settings.customHeaderHtml }}
          suppressHydrationWarning
        />
      ) : null}

      {/* Section-based page content — rendered client-side via React hydration */}
      <SectionRenderer
        sections={visibleSections}
        activeSectionId={null}
        storeId={storeId}
        productId={settings.productId ?? undefined}
        product={null}
      />

      {/* Floating Action Buttons — WhatsApp, Call, Order */}
      <FloatingActionButtons
        whatsappEnabled={settings.whatsappEnabled}
        whatsappNumber={settings.whatsappNumber ?? ''}
        whatsappMessage={settings.whatsappMessage ?? 'হ্যালো! আমি অর্ডার করতে চাই।'}
        callEnabled={settings.callEnabled}
        callNumber={settings.callNumber ?? ''}
        orderEnabled={settings.orderEnabled}
        orderText={settings.orderText ?? 'অর্ডার করুন'}
        orderBgColor={settings.orderBgColor ?? '#6366F1'}
        orderTextColor={settings.orderTextColor ?? '#FFFFFF'}
        position={settings.buttonPosition}
      />

      {/* Custom footer HTML injection */}
      {settings.customFooterHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: settings.customFooterHtml }}
          suppressHydrationWarning
        />
      ) : null}

      {/* Non-removable Ozzyl branding */}
      <OzzylBranding />
    </TemplateLayoutRenderer>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

export function ErrorBoundary() {
  const error = useRouteError();

  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  if (is404) {
    return <Bengali404 />;
  }

  // Unexpected error
  const message =
    isRouteErrorResponse(error)
      ? error.data
      : error instanceof Error
      ? error.message
      : 'অপ্রত্যাশিত ত্রুটি হয়েছে।';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ত্রুটি হয়েছে</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          হোমে ফিরে যান
        </a>
      </div>
    </div>
  );
}

// ─── Bengali 404 Component ────────────────────────────────────────────────────

function Bengali404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="text-center max-w-lg">
        {/* Large illustrated 404 */}
        <div className="mb-8">
          <div className="text-9xl font-black text-indigo-200 select-none leading-none">
            ৪০৪
          </div>
          <div className="text-5xl -mt-4">😕</div>
        </div>

        {/* Bengali message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          পেজ পাওয়া যায়নি
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          আপনি যে পেজটি খুঁজছেন সেটি হয়তো মুছে ফেলা হয়েছে,
          অথবা এখনো প্রকাশ করা হয়নি।
        </p>
        <p className="text-gray-500 text-sm mb-8">
          The page you are looking for was not found or has not been published yet.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            🏠 হোমে ফিরে যান
          </a>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-block px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            ← আগের পেজে যান
          </button>
        </div>

        {/* Ozzyl branding */}
        <p className="mt-10 text-xs text-gray-400">
          Powered by{' '}
          <a
            href="https://ozzyl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-600"
          >
            Ozzyl
          </a>
        </p>
      </div>
    </div>
  );
}
