/**
 * Domain API Endpoint
 * 
 * Route: POST /api/domain/add
 * 
 * SECURITY: Strict enforcement of paid plan requirement.
 * Free users attempting to add domains will receive 403 Forbidden.
 * 
 * This API exists for programmatic/AJAX access.
 * The main domain request flow uses form actions in app.settings.domain.tsx
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { canUseCustomDomain, type PlanType } from '~/utils/plans.server';

interface DomainAddRequest {
  domain: string;
}

interface DomainAddResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return json<DomainAddResponse>(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Authenticate user
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json<DomainAddResponse>(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  // Parse request body
  let body: DomainAddRequest;
  try {
    body = await request.json();
  } catch {
    return json<DomainAddResponse>(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { domain } = body;
  if (!domain || typeof domain !== 'string') {
    return json<DomainAddResponse>(
      { error: 'Domain is required' },
      { status: 400 }
    );
  }

  const db = drizzle(context.cloudflare.env.DB);

  // ============================================================================
  // CRUCIAL SECURITY CHECK: Verify store is on a paid plan
  // ============================================================================
  const store = await db
    .select({ planType: stores.planType, customDomain: stores.customDomain })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store[0]) {
    return json<DomainAddResponse>(
      { error: 'Store not found' },
      { status: 404 }
    );
  }

  const planType = (store[0].planType as PlanType) || 'free';

  // STRICT ENFORCEMENT: Block free users with security logging
  if (!canUseCustomDomain(planType)) {
    console.warn(
      `[SECURITY BLOCK] Free user store ${storeId} attempted to add custom domain via API: ${domain}. ` +
      `Plan: ${planType}. IP: ${request.headers.get('cf-connecting-ip') || 'unknown'}. ` +
      `User-Agent: ${request.headers.get('user-agent') || 'unknown'}`
    );
    
    return json<DomainAddResponse>(
      { 
        error: 'Custom domains require a paid plan. Upgrade to Starter or Premium to connect your own domain.' 
      },
      { status: 403 }
    );
  }

  // Check if store already has a custom domain
  if (store[0].customDomain) {
    return json<DomainAddResponse>(
      { error: 'Your store already has a custom domain configured.' },
      { status: 400 }
    );
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  const cleanDomain = domain.toLowerCase().trim();
  
  if (!domainRegex.test(cleanDomain)) {
    return json<DomainAddResponse>(
      { error: 'Invalid domain format. Example: shop.example.com' },
      { status: 400 }
    );
  }

  // Check if domain is already taken
  const existingDomain = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.customDomain, cleanDomain))
    .limit(1);

  if (existingDomain[0]) {
    return json<DomainAddResponse>(
      { error: 'This domain is already in use by another store.' },
      { status: 409 }
    );
  }

  // Check if domain is already requested by another store
  const existingRequest = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.customDomainRequest, cleanDomain))
    .limit(1);

  if (existingRequest[0] && existingRequest[0].id !== storeId) {
    return json<DomainAddResponse>(
      { error: 'This domain is already requested by another store.' },
      { status: 409 }
    );
  }

  // Submit domain request
  await db.update(stores).set({
    customDomainRequest: cleanDomain,
    customDomainStatus: 'pending',
    customDomainRequestedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId));

  console.log(
    `[DOMAIN REQUEST] Store ${storeId} (plan: ${planType}) requested domain: ${cleanDomain}`
  );

  return json<DomainAddResponse>({
    success: true,
    message: 'Domain request submitted successfully. We will review it within 24 hours.',
  });
}

// GET request - return method not allowed
export async function loader() {
  return json({ error: 'Use POST to add a domain' }, { status: 405 });
}
