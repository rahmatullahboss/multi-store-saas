/**
 * Ozzyl Guard — Public Landing & Signup Page
 * Route: /guard
 *
 * For EXTERNAL merchants (WordPress, Shopify, custom sites)
 * who want to use Ozzyl's fraud detection API (FDaaS).
 *
 * Auth strategy: cookie `guard_token` = raw API key (og_live_xxx...)
 * We hash it with SHA-256 and match against fdaas_api_keys.key_hash.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { fdaasApiKeys } from '@db/schema';
import {
  Shield, ShieldCheck, Zap, Globe, Key, CheckCircle,
  ArrowRight, Loader2, Lock, Package, TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => [
  { title: 'Ozzyl Guard — COD Fraud Detection API for Bangladesh' },
  { name: 'description', content: "Bangladesh's most powerful COD fraud detection API." },
];

// ── crypto helpers ───────────────────────────────────────────────────────────
async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomHex(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── cookie helpers ───────────────────────────────────────────────────────────
function getGuardToken(request: Request): string | null {
  return request.headers.get('Cookie')?.match(/guard_token=([^;]+)/)?.[1] ?? null;
}

function guardCookie(value: string, maxAge = 2_592_000): string {
  return `guard_token=${value}; Path=/guard; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

// ============================================================================
// LOADER — redirect to dashboard if already logged in
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const raw = getGuardToken(request);
  if (raw) {
    const hash = await sha256Hex(raw);
    const db = drizzle(context.cloudflare.env.DB);
    const key = await db
      .select({ id: fdaasApiKeys.id, isActive: fdaasApiKeys.isActive })
      .from(fdaasApiKeys)
      .where(eq(fdaasApiKeys.keyHash, hash))
      .get();
    if (key?.isActive) return redirect('/guard/dashboard');
  }
  return json({});
}

// ============================================================================
// ACTION — signup or signin
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const fd = await request.formData();
  const intent = fd.get('intent') as string;
  const email = (fd.get('email') as string || '').trim().toLowerCase();
  const password = fd.get('password') as string;

  if (!email || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email and password are required.', success: false }, { status: 400 });
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters.', success: false }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  // We store password hash in the `name` field as a workaround since
  // the schema doesn't have a dedicated passwordHash column.
  // Format: "pwdhash:<sha256hex>"
  const pwdHash = await sha256Hex(password + 'ozg_salt_2026_' + email);

  // ── Sign In ───────────────────────────────────────────────────────────────
  if (intent === 'signin') {
    const existing = await db
      .select()
      .from(fdaasApiKeys)
      .where(eq(fdaasApiKeys.ownerEmail, email))
      .get();

    if (!existing) {
      return json({ error: 'No account found. Please sign up first.', success: false }, { status: 401 });
    }
    // Verify password stored in metadata JSON
    let meta: Record<string, string> = {};
    try { meta = JSON.parse(existing.metadata || '{}'); } catch {}
    if (meta.pwdHash !== pwdHash) {
      return json({ error: 'Incorrect password.', success: false }, { status: 401 });
    }

    // Reconstruct raw key from prefix — we can't recover it, so we store it encrypted in metadata
    const rawKey = meta.rawKey as string;
    if (!rawKey) {
      return json({ error: 'Please regenerate your API key from dashboard.', success: false }, { status: 400 });
    }

    return redirect('/guard/dashboard', {
      headers: { 'Set-Cookie': guardCookie(rawKey) },
    });
  }

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const existing = await db
    .select({ id: fdaasApiKeys.id })
    .from(fdaasApiKeys)
    .where(eq(fdaasApiKeys.ownerEmail, email))
    .get();

  if (existing) {
    return json({ error: 'Account already exists. Please sign in.', success: false }, { status: 409 });
  }

  const rawKey = `og_live_${randomHex(24)}`;
  const keyHash = await sha256Hex(rawKey);
  const keyPrefix = rawKey.slice(0, 15);
  const now = new Date();

  await db.insert(fdaasApiKeys).values({
    keyHash,
    keyPrefix,
    name: `${email}'s store`,
    ownerEmail: email,
    plan: 'free',
    monthlyLimit: 100,
    callsThisMonth: 0,
    callsTotal: 0,
    isActive: 1,
    metadata: JSON.stringify({ pwdHash, rawKey }), // rawKey stored so signin works
    createdAt: now,
    updatedAt: now,
  });

  return redirect('/guard/dashboard', {
    headers: { 'Set-Cookie': guardCookie(rawKey) },
  });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function GuardLandingPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white font-sans">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Ozzyl Guard</span>
            <span className="ml-2 text-xs bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">Beta</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button onClick={() => setMode('signin')} className="text-indigo-400 hover:text-indigo-300 font-medium">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-400 mb-6">
          <Zap className="w-3.5 h-3.5" />
          Powered by Cloudflare Edge + Bangladesh Courier Network
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Protect Your Store from<br />
          <span className="text-indigo-400">COD Fraud</span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Bangladesh's most powerful fraud detection API. Plug into WordPress,
          Shopify, or any custom store in minutes. Backed by real courier delivery data.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 mb-16">
          {[
            { icon: Globe, label: 'Works with any platform' },
            { icon: ShieldCheck, label: 'Real courier verification' },
            { icon: TrendingUp, label: 'ML-powered risk scoring' },
            { icon: Package, label: 'COD fraud prevention' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-indigo-500" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Auth Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex rounded-lg bg-white/5 p-1 mb-6">
              {(['signup', 'signin'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === m ? 'bg-indigo-600 text-white shadow' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {m === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              ))}
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value={mode} />

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email address</label>
                <input
                  type="email" name="email" required placeholder="you@yourstore.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Password</label>
                <input
                  type="password" name="password" required minLength={8} placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                />
              </div>

              {actionData?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                  {actionData.error}
                </div>
              )}

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : mode === 'signup' ? (
                  <><Key className="w-4 h-4" /> Get Free API Key</>
                ) : (
                  <><Lock className="w-4 h-4" /> Sign In</>
                )}
              </button>

              {mode === 'signup' && (
                <p className="text-xs text-white/30 text-center">
                  Free plan includes 100 fraud checks per month. No credit card required.
                </p>
              )}
            </Form>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Simple, transparent pricing</h2>
        <p className="text-white/40 text-center mb-12">Start free. Scale as you grow.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '৳0', unit: 'forever', checks: '100', features: ['100 checks/month', 'Phone risk scoring', 'Courier data', 'JSON API'], cta: 'Get Started Free', highlight: false },
            { name: 'Starter', price: '৳999', unit: '/month', checks: '5,000', features: ['5,000 checks/month', 'IP & device signals', 'Shared fraud network', 'WordPress plugin', 'Email support'], cta: 'Start Free Trial', highlight: true },
            { name: 'Pro', price: '৳4,999', unit: '/month', checks: '50,000', features: ['50,000 checks/month', 'Fraud ring detection', 'Webhooks', 'Priority support', 'Custom thresholds'], cta: 'Get Pro', highlight: false },
          ].map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 relative ${plan.highlight ? 'bg-indigo-600/10 border border-indigo-500/30' : 'bg-white/5 border border-white/10'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
              )}
              <div className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-indigo-400' : 'text-white/50'}`}>{plan.name}</div>
              <div className="text-4xl font-bold mb-1">{plan.price}</div>
              <div className="text-white/30 text-sm mb-6">{plan.unit}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'border border-white/10 hover:border-indigo-500/50 text-white/70 hover:text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Sign up & get API key', desc: 'Create a free account and get your API key instantly. No credit card required.' },
            { step: '02', title: 'Add one API call', desc: 'Send customer phone to our API before confirming the COD order.' },
            { step: '03', title: 'Get instant risk score', desc: 'Receive a 0-100 risk score with ALLOW/HOLD/BLOCK decision in under 500ms.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg mx-auto mb-4">{step}</div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Start protecting your store today</h2>
          <p className="text-white/40 mb-8">Join Bangladeshi merchants who trust Ozzyl Guard.</p>
          <button
            onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Get Free API Key <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Ozzyl Guard — by <a href="/" className="text-indigo-400 hover:text-indigo-300">Ozzyl</a></span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:guard@ozzyl.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
