import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { resolveStore } from '~/lib/store.server';
import { getLeadGenSettings } from '~/services/lead-gen-settings.server';
import { ArrowLeft, Shield } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const settings = await getLeadGenSettings(db, storeContext.storeId);

  return json({
    store: storeContext.store,
    settings,
  });
}

export default function PrivacyPolicyPage() {
  const { store, settings } = useLoaderData<typeof loader>();

  const defaultPrivacyPolicy = `
    <h2>Privacy Policy</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>
    
    <h3>1. Introduction</h3>
    <p>Welcome to ${settings.storeName}. We respect your privacy and are committed to protecting your personal data.</p>
    
    <h3>2. Information We Collect</h3>
    <p>We may collect the following types of information:</p>
    <ul>
      <li>Personal identification information (Name, email address, phone number, etc.)</li>
      <li>Educational background and qualifications</li>
      <li>Documents submitted for university applications</li>
      <li>Usage data and cookies</li>
    </ul>
    
    <h3>3. How We Use Your Information</h3>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Provide and maintain our services</li>
      <li>Process university applications</li>
      <li>Communicate with you about your applications</li>
      <li>Improve our services</li>
      <li>Comply with legal obligations</li>
    </ul>
    
    <h3>4. Data Security</h3>
    <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
    
    <h3>5. Your Rights</h3>
    <p>You have the right to:</p>
    <ul>
      <li>Access your personal data</li>
      <li>Request correction of your data</li>
      <li>Request deletion of your data</li>
      <li>Object to processing of your data</li>
    </ul>
    
    <h3>6. Contact Us</h3>
    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
    <p>Email: ${settings.email || 'contact@example.com'}</p>
    <p>Phone: ${settings.phone || '+880 1608206303'}</p>
  `;

  const privacyContent = settings.privacyPolicy || defaultPrivacyPolicy;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${settings.primaryColor}15` }}
          >
            <Shield className="w-6 h-6" style={{ color: settings.primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: privacyContent }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
