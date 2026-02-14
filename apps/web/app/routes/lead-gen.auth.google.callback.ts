/**
 * Lead Gen Google OAuth Callback Route
 * 
 * Route: /lead-gen/auth/google/callback
 * 
 * Handles Google OAuth callback, creates/finds customer, asks for phone if needed.
 */

import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { customers } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { createCustomerSession, getCustomerSession, commitCustomerSession } from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // storeId
  const error = url.searchParams.get('error');
  
  if (error) {
    console.error('[lead-gen.auth.google.callback] OAuth error:', error);
    return redirect('/lead-gen/auth/login?error=oauth_failed');
  }
  
  if (!code || !state) {
    return redirect('/lead-gen/auth/login?error=missing_params');
  }
  
  const storeId = parseInt(state, 10);
  if (isNaN(storeId)) {
    return redirect('/lead-gen/auth/login?error=invalid_store');
  }
  
  const env = context.cloudflare.env;
  
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
  const db = drizzle(env.DB);
  const baseUrl = url.origin;
  const redirectUri = `${baseUrl}/lead-gen/auth/google/callback`;
  
  if (!googleClientId || !googleClientSecret) {
    return redirect('/lead-gen/auth/login?error=oauth_not_configured');
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    const tokens = await tokenResponse.json() as { access_token?: string; id_token?: string; error?: string };
    
    if (!tokens.access_token) {
      console.error('[lead-gen.auth.google.callback] Token exchange failed:', tokens);
      return redirect('/lead-gen/auth/login?error=token_exchange_failed');
    }
    
    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const userInfo = await userInfoResponse.json() as { 
      email?: string; 
      name?: string; 
      picture?: string;
      sub?: string;
    };
    
    if (!userInfo.email) {
      return redirect('/lead-gen/auth/login?error=no_email');
    }
    
    // Check if customer exists
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, userInfo.email), eq(customers.storeId, storeId)))
      .limit(1);
    
    let customer = existingCustomer[0];
    
    if (!customer) {
      // Create new customer with Google info
      const [newCustomer] = await db
        .insert(customers)
        .values({
          storeId,
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          phone: '', // Will need to verify phone
          passwordHash: `google_oauth_${userInfo.sub}`,
          authProvider: 'google',
          googleId: userInfo.sub,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      customer = newCustomer;
    }
    
    // Check if phone is missing - redirect to phone verification
    if (!customer.phone || customer.phone === '') {
      // Redirect to phone verification
      return redirect(`/lead-gen/auth/phone-verify?email=${encodeURIComponent(customer.email || '')}`);
    }
    
    // Update last login
    await db
      .update(customers)
      .set({ lastLoginAt: new Date() })
      .where(eq(customers.id, customer.id));
    
    // Create session and redirect to dashboard
    const session = await getCustomerSession(new Request('http://localhost'), env);
    session.set('customerId', customer.id);
    session.set('storeId', storeId);
    
    return redirect('/lead-dashboard', {
      headers: {
        'Set-Cookie': await commitCustomerSession(session, env),
      },
    });
    
  } catch (err) {
    console.error('[lead-gen.auth.google.callback] Error:', err);
    return redirect('/lead-gen/auth/login?error=oauth_exception');
  }
}
