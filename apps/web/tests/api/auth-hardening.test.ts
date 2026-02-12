import { describe, expect, it } from 'vitest';
import {
  createOAuthAuthorizationRequest,
  createTransferToken,
  getStoreAllowedOrigins,
  resolveSafeStoreOrigin,
  validateOAuthStateToken,
  validateTransferToken,
  consumePkceVerifierForOAuth,
} from '~/services/customer-auth.server';
import { isAllowedSuperAdminLogin } from '~/services/auth.server';

class MockKV {
  private readonly data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
}

function createAuthEnv(): Env {
  return {
    SESSION_SECRET: 'test-session-secret-very-long',
    STORE_CACHE: new MockKV() as unknown as KVNamespace,
    SAAS_DOMAIN: 'ozzyl.com',
    ENVIRONMENT: 'staging',
  } as Env;
}

describe('Auth Hardening - OAuth and Token Safety', () => {
  it('creates signed OAuth state with one-time validation and PKCE verifier', async () => {
    const env = createAuthEnv();
    const origin = 'https://shop1.ozzyl.com';

    const oauthReq = await createOAuthAuthorizationRequest(101, origin, env);
    expect(oauthReq.state).toBeTruthy();
    expect(oauthReq.codeChallengeMethod).toBe('S256');
    expect(oauthReq.codeChallenge.length).toBeGreaterThan(10);

    const stateFirst = await validateOAuthStateToken(oauthReq.state, env);
    expect(stateFirst).not.toBeNull();
    expect(stateFirst?.storeId).toBe(101);
    expect(stateFirst?.origin).toBe(origin);

    // one-time state token
    const stateSecond = await validateOAuthStateToken(oauthReq.state, env);
    expect(stateSecond).toBeNull();

    const verifier = await consumePkceVerifierForOAuth(stateFirst!.transactionId, env);
    expect(verifier).toBeTruthy();

    // one-time PKCE verifier
    const verifierAgain = await consumePkceVerifierForOAuth(stateFirst!.transactionId, env);
    expect(verifierAgain).toBeNull();
  });

  it('rejects replay of session transfer tokens', async () => {
    const env = createAuthEnv();
    const token = await createTransferToken(77, 12, env);

    const first = await validateTransferToken(token, env);
    expect(first).toEqual({ customerId: 77, storeId: 12 });

    const replay = await validateTransferToken(token, env);
    expect(replay).toBeNull();
  });
});

describe('Auth Hardening - Multi Tenant and Admin Policy', () => {
  it('accepts only allowlisted store origins', () => {
    const env = createAuthEnv();
    const allowed = getStoreAllowedOrigins(
      { subdomain: 'shop-alpha', customDomain: 'brand.example.com' },
      env
    );

    const safeCustom = resolveSafeStoreOrigin(
      'https://brand.example.com',
      allowed,
      'https://shop-alpha.ozzyl.com'
    );
    expect(safeCustom).toBe('https://brand.example.com');

    const safeFallback = resolveSafeStoreOrigin(
      'https://evil.example.net',
      allowed,
      'https://shop-alpha.ozzyl.com'
    );
    expect(safeFallback).toBe('https://shop-alpha.ozzyl.com');
  });

  it('enforces strict super admin email pinning', () => {
    const env = { SUPER_ADMIN_EMAIL: 'root@ozzyl.com' } as Env;

    expect(isAllowedSuperAdminLogin('root@ozzyl.com', env)).toBe(true);
    expect(isAllowedSuperAdminLogin('ROOT@OZZYL.COM', env)).toBe(true);
    expect(isAllowedSuperAdminLogin('support@ozzyl.com', env)).toBe(false);
    expect(isAllowedSuperAdminLogin('root@ozzyl.com', undefined)).toBe(false);
  });
});
