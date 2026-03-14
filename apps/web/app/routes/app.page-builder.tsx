/**
 * Page Builder Route
 *
 * Default: Redirects to /app/new-builder (new React-based builder).
 * Legacy GrapesJS mode: Append ?pro=1 to redirect to the GrapesJS worker instead.
 *
 * The old landing_pages-based UI has been retired (0 rows in production).
 * All new pages use builder_pages + builder_sections via app.new-builder.$pageId.
 */

import { redirect, type LoaderFunctionArgs } from 'react-router';

// ============================================================================
// LOADER - Redirect to appropriate builder
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const proMode = url.searchParams.get('pro');

  if (proMode === '1') {
    const env = context.cloudflare.env as unknown as Record<string, string | undefined>;
    const builderUrl = env['PAGE_BUILDER_URL'] ?? 'https://builder.ozzyl.com';
    return redirect(builderUrl);
  }

  return redirect('/app/new-builder');
}
