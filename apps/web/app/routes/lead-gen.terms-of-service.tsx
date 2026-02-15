import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { resolveStore } from '~/lib/store.server';
import { getLeadGenSettings } from '~/services/lead-gen-settings.server';
import { ArrowLeft, FileText } from 'lucide-react';

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

export default function TermsOfServicePage() {
  const { store, settings } = useLoaderData<typeof loader>();

  const defaultTerms = `
    <h2>Terms of Service</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>
    
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using the services of ${settings.storeName}, you agree to be bound by these Terms of Service.</p>
    
    <h3>2. Services Description</h3>
    <p>We provide educational consultancy services including:</p>
    <ul>
      <li>University selection guidance</li>
      <li>Application processing assistance</li>
      <li>Visa application support</li>
      <li>Pre-departure briefing</li>
      <li>Career counseling</li>
    </ul>
    
    <h3>3. User Responsibilities</h3>
    <p>You agree to:</p>
    <ul>
      <li>Provide accurate and complete information</li>
      <li>Maintain the confidentiality of your account</li>
      <li>Not use our services for any illegal purposes</li>
      <li>Comply with all applicable laws and regulations</li>
    </ul>
    
    <h3>4. Service Fees</h3>
    <p>Our consultation services are free. However, you are responsible for:</p>
    <ul>
      <li>University application fees</li>
      <li>Visa application fees</li>
      <li>Any other third-party charges</li>
    </ul>
    
    <h3>5. Limitation of Liability</h3>
    <p>We strive to provide accurate information, but we cannot guarantee:</p>
    <ul>
      <li>University admission</li>
      <li>Visa approval</li>
      <li>Scholarship awards</li>
    </ul>
    <p>Final decisions rest with universities and immigration authorities.</p>
    
    <h3>6. Intellectual Property</h3>
    <p>All content on this website is the property of ${settings.storeName} and is protected by copyright laws.</p>
    
    <h3>7. Termination</h3>
    <p>We reserve the right to terminate services if you violate these terms.</p>
    
    <h3>8. Governing Law</h3>
    <p>These terms are governed by the laws of Bangladesh.</p>
    
    <h3>9. Changes to Terms</h3>
    <p>We may update these terms from time to time. Continued use of our services constitutes acceptance of the updated terms.</p>
    
    <h3>10. Contact Information</h3>
    <p>For questions about these Terms of Service, please contact us at:</p>
    <p>Email: ${settings.email || 'contact@example.com'}</p>
    <p>Phone: ${settings.phone || '+880 1608206303'}</p>
    <p>Address: ${settings.address || 'Dhaka, Bangladesh'}</p>
  `;

  const termsContent = settings.termsOfService || defaultTerms;

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
            <FileText className="w-6 h-6" style={{ color: settings.primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        </div>

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: termsContent }}
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
