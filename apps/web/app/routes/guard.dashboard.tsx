/**
 * Ozzyl Guard — Merchant Dashboard
 * Route: /guard/dashboard
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useFetcher } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { fdaasApiKeys, fdaasUsageLog } from '@db/schema';
import { useState } from 'react';
import {
  Shield, Copy, Eye, EyeOff, RefreshCw, LogOut,
  CheckCircle, AlertTriangle, XCircle, TrendingUp, Code2, Zap, ArrowUpRight,
} from 'lucide-react';

export const meta: MetaFunction = () => [{ title: 'Ozzyl Guard — Dashboard' }];

// ── helpers ──────────────────────────────────────────────────────────────────
async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomHex(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}
function getGuardToken(request: Request): string | null {
  return request.headers.get('Cookie')?.match(/guard_token=([^;]+)/)?.[1] ?? null;
}
function guardCookie(value: string, maxAge = 2_592_000): string {
  return `guard_token=${value}; Path=/guard; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const raw = getGuardToken(request);
  if (!raw) return redirect('/guard');

  const hash = await sha256Hex(raw);
  const db = drizzle(context.cloudflare.env.DB);

  const keyRecord = await db
    .select()
    .from(fdaasApiKeys)
    .where(eq(fdaasApiKeys.keyHash, hash))
    .get();

  if (!keyRecord || !keyRecord.isActive) {
    return redirect('/guard', {
      headers: { 'Set-Cookie': guardCookie('', 0) },
    });
  }

  const logs = await db
    .select()
    .from(fdaasUsageLog)
    .where(eq(fdaasUsageLog.apiKeyId, keyRecord.id))
    .orderBy(desc(fdaasUsageLog.createdAt))
    .limit(20)
    .catch(() => []);

  const usagePct = Math.min(
    Math.round(((keyRecord.callsThisMonth ?? 0) / (keyRecord.monthlyLimit ?? 100)) * 100),
    100
  );

  // Parse metadata for display key
  let displayKey = `${keyRecord.keyPrefix}••••••••••••••••••`;
  let meta: Record<string, string> = {};
  try { meta = JSON.parse(keyRecord.metadata || '{}'); } catch {}
  if (meta.rawKey) displayKey = meta.rawKey as string;

  return json({
    email: keyRecord.ownerEmail,
    plan: keyRecord.plan,
    keyPrefix: keyRecord.keyPrefix,
    displayKey,
    callsThisMonth: keyRecord.callsThisMonth ?? 0,
    monthlyLimit: keyRecord.monthlyLimit ?? 100,
    usagePct,
    logs,
  });
}

// ============================================================================
// ACTION — regenerate key or logout
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const raw = getGuardToken(request);
  if (!raw) return redirect('/guard');

  const hash = await sha256Hex(raw);
  const fd = await request.formData();
  const intent = fd.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'logout') {
    return redirect('/guard', { headers: { 'Set-Cookie': guardCookie('', 0) } });
  }

  if (intent === 'regenerate') {
    const existing = await db
      .select({ id: fdaasApiKeys.id, ownerEmail: fdaasApiKeys.ownerEmail, metadata: fdaasApiKeys.metadata })
      .from(fdaasApiKeys)
      .where(eq(fdaasApiKeys.keyHash, hash))
      .get();

    if (!existing) return redirect('/guard');

    const newRaw = `og_live_${randomHex(24)}`;
    const newHash = await sha256Hex(newRaw);
    const newPrefix = newRaw.slice(0, 15);

    // Keep password hash, update rawKey
    let meta: Record<string, string> = {};
    try { meta = JSON.parse(existing.metadata || '{}'); } catch {}
    meta.rawKey = newRaw;

    await db.update(fdaasApiKeys)
      .set({ keyHash: newHash, keyPrefix: newPrefix, metadata: JSON.stringify(meta), updatedAt: new Date() })
      .where(eq(fdaasApiKeys.id, existing.id));

    return redirect('/guard/dashboard', {
      headers: { 'Set-Cookie': guardCookie(newRaw) },
    });
  }

  return json({ ok: true });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function GuardDashboard() {
  const { email, plan, displayKey, callsThisMonth, monthlyLimit, usagePct, logs } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'curl' | 'php' | 'js'>('curl');

  const maskedKey = revealed ? displayKey : `${displayKey.slice(0, 15)}${'•'.repeat(20)}`;

  async function copyKey() {
    await navigator.clipboard.writeText(displayKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const planLabel = { free: 'Free', starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' }[plan] ?? plan;
  const planColor = plan === 'free' ? 'text-white/40' : plan === 'starter' ? 'text-indigo-400' : 'text-purple-400';

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white font-sans">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">Ozzyl Guard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40">{email}</span>
            <span className={`text-xs font-semibold uppercase tracking-wide ${planColor}`}>{planLabel}</span>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <button type="submit" className="flex items-center gap-1.5 text-white/30 hover:text-white text-sm transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </fetcher.Form>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* API Key Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your API Key</h2>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="regenerate" />
              <button
                type="submit"
                className="flex items-center gap-1.5 text-white/30 hover:text-red-400 text-xs transition-colors"
                onClick={(e) => {
                  if (!confirm('Regenerate? Old key stops working immediately.')) e.preventDefault();
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </fetcher.Form>
          </div>

          <div className="flex items-center gap-3 bg-black/30 border border-white/5 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm font-mono text-indigo-300 overflow-hidden text-ellipsis whitespace-nowrap">
              {maskedKey}
            </code>
            <button onClick={() => setRevealed(!revealed)} className="text-white/30 hover:text-white transition-colors p-1">
              {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={copyKey} className="text-white/30 hover:text-indigo-400 transition-colors p-1">
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Usage bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/50">Monthly usage</span>
              <span className={`font-semibold ${usagePct >= 90 ? 'text-red-400' : usagePct >= 70 ? 'text-amber-400' : 'text-white/70'}`}>
                {callsThisMonth.toLocaleString()} / {monthlyLimit.toLocaleString()} checks
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          {(plan === 'free' || usagePct >= 70) && (
            <div className="mt-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-indigo-300">
                <TrendingUp className="w-4 h-4" />
                {plan === 'free' ? 'Upgrade to Starter — ৳999/month for 5,000 checks' : 'Upgrade to Pro for 50,000 checks/month'}
              </div>
              <a href="mailto:support@ozzyl.com?subject=Guard Upgrade" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Upgrade <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Code Snippets */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold">Quick Integration</h2>
          </div>
          <div className="flex gap-2 mb-4">
            {(['curl', 'php', 'js'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                {tab === 'curl' ? 'cURL' : tab === 'php' ? 'PHP / WordPress' : 'JS / Shopify'}
              </button>
            ))}
          </div>
          <div className="bg-black/40 rounded-xl p-4 overflow-x-auto">
            {activeTab === 'curl' && (
              <pre className="text-xs text-green-300 font-mono leading-relaxed">{`curl -X POST https://app.ozzyl.com/api/v1/fraud-check \\
  -H "Authorization: Bearer ${displayKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"01712345678","order_total":1500,"payment_method":"cod"}'`}</pre>
            )}
            {activeTab === 'php' && (
              <pre className="text-xs text-blue-300 font-mono leading-relaxed">{`<?php // WooCommerce — add to functions.php
add_action('woocommerce_checkout_order_processed', function($order_id) {
  $order = wc_get_order($order_id);
  if ($order->get_payment_method() !== 'cod') return;
  $res = wp_remote_post('https://app.ozzyl.com/api/v1/fraud-check', [
    'headers' => ['Authorization' => 'Bearer ${displayKey}', 'Content-Type' => 'application/json'],
    'body'    => json_encode(['phone' => $order->get_billing_phone(), 'order_total' => (float)$order->get_total(), 'payment_method' => 'cod']),
    'timeout' => 5,
  ]);
  $result = json_decode(wp_remote_retrieve_body($res), true);
  if (($result['decision'] ?? '') === 'block') $order->update_status('on-hold', 'Ozzyl Guard: High risk.');
});`}</pre>
            )}
            {activeTab === 'js' && (
              <pre className="text-xs text-yellow-300 font-mono leading-relaxed">{`// Shopify — Cloudflare Worker webhook handler
export default {
  async fetch(request) {
    const order = await request.json();
    if (order.payment_gateway !== 'cash_on_delivery') return new Response('skip');
    const res = await fetch('https://app.ozzyl.com/api/v1/fraud-check', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ${displayKey}', 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: order.shipping_address?.phone, order_total: parseFloat(order.total_price), payment_method: 'cod' }),
    });
    const result = await res.json();
    console.log('Risk:', result.risk_score, result.decision);
    return new Response('ok');
  }
};`}</pre>
            )}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold">Recent API Calls</h2>
            <span className="ml-auto text-xs text-white/30">Last 20 requests</span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No API calls yet. Make your first fraud check!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs border-b border-white/5">
                    <th className="text-left pb-3 font-medium">Timestamp</th>
                    <th className="text-left pb-3 font-medium">Phone</th>
                    <th className="text-left pb-3 font-medium">Risk Score</th>
                    <th className="text-left pb-3 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(logs as any[]).map((log, i) => {
                    const score = log.riskScore ?? 0;
                    const decision = log.decision ?? 'allow';
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-white/40 text-xs">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString('en-BD') : '—'}
                        </td>
                        <td className="py-3 font-mono text-white/60 text-xs">
                          {log.phoneHash ? `${log.phoneHash.slice(0, 8)}…` : '—'}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${score}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-green-400'}`}>{score}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          {decision === 'allow' && <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> ALLOW</span>}
                          {decision === 'hold' && <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> HOLD</span>}
                          {decision === 'block' && <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> BLOCK</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-white/20 pb-8">
          Need help? <a href="mailto:guard@ozzyl.com" className="text-indigo-400 hover:text-indigo-300">guard@ozzyl.com</a>
        </div>
      </main>
    </div>
  );
}
