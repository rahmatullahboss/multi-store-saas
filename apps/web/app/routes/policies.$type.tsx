/**
 * Policy Pages Route
 * 
 * Route: /policies/:type (privacy, terms, refund)
 * 
 * Displays auto-generated or custom legal policy pages
 * with store branding.
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getPolicyContent, type PolicyType } from '~/lib/policies';
import { sanitizeHtml } from "~/utils/sanitize";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: 'Policy - Store' }];
  return [
    { title: `${data.title} - ${data.storeName}` },
    { name: 'description', content: `${data.title} for ${data.storeName}` },
  ];
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const { type } = params;
  
  // Validate policy type
  const validTypes: PolicyType[] = ['privacy', 'terms', 'refund'];
  if (!type || !validTypes.includes(type as PolicyType)) {
    throw new Response('Policy not found', { status: 404 });
  }
  
  const policyType = type as PolicyType;
  
  // Get store from tenant context (set by middleware)
  const store = (context as { store?: typeof stores.$inferSelect }).store;
  
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }
  
  // Parse business info for contact email
  let contactEmail = 'support@store.com';
  if (store.businessInfo) {
    try {
      const businessInfo = JSON.parse(store.businessInfo);
      if (businessInfo.email) {
        contactEmail = businessInfo.email;
      }
    } catch {
      // Use default email
    }
  }
  
  // Check for custom policy override
  let customContent: string | null = null;
  switch (policyType) {
    case 'privacy':
      customContent = store.customPrivacyPolicy || null;
      break;
    case 'terms':
      customContent = store.customTermsOfService || null;
      break;
    case 'refund':
      customContent = store.customRefundPolicy || null;
      break;
  }
  
  // Get policy content (custom or auto-generated)
  const policy = getPolicyContent(policyType, store.name, contactEmail);
  
  return json({
    storeName: store.name,
    logo: store.logo,
    title: policy.title,
    content: customContent || policy.content,
    isCustom: !!customContent,
    policyType,
    planType: store.planType || 'free',
  });
}

export default function PolicyPage() {
  const { storeName, logo, title, content, policyType, planType } = useLoaderData<typeof loader>();
  
  // Parse markdown-style headers and content
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'bullet' | 'numbered' | null = null;
    let key = 0;
    
    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType === 'numbered' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={key++} className={`my-4 ml-6 ${listType === 'numbered' ? 'list-decimal' : 'list-disc'} space-y-2`}>
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-600">{item}</li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };
    
    for (const line of lines) {
      // H1 Header
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={key++} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      }
      // H2 Header
      else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={key++} className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            {line.slice(3)}
          </h2>
        );
      }
      // H3 Header
      else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={key++} className="text-xl font-semibold text-gray-800 mb-3 mt-6">
            {line.slice(4)}
          </h3>
        );
      }
      // Bold text line (like **Last Updated:**)
      else if (line.startsWith('**') && line.includes(':**')) {
        flushList();
        const parts = line.match(/\*\*(.+?):\*\*\s*(.*)/);
        if (parts) {
          elements.push(
            <p key={key++} className="text-gray-600 mb-4">
              <strong className="text-gray-900">{parts[1]}:</strong> {parts[2]}
            </p>
          );
        }
      }
      // Bullet list
      else if (line.startsWith('- ')) {
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        currentList.push(line.slice(2));
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        if (listType !== 'numbered') {
          flushList();
          listType = 'numbered';
        }
        currentList.push(line.replace(/^\d+\.\s*/, ''));
      }
      // Regular paragraph
      else if (line.trim()) {
        flushList();
        // Handle bold text within paragraphs
        const formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <p 
            key={key++} 
            className="text-gray-600 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(formattedLine) }}
          />
        );
      }
    }
    
    flushList();
    return elements;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-10 object-contain rounded" />
            ) : (
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
                {storeName[0]}
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">{storeName}</span>
          </Link>
          
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Store
          </Link>
        </div>
      </header>
      
      {/* Policy Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Policy Navigation */}
          <nav className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-200">
            <Link
              to="/policies/privacy"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                policyType === 'privacy'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              to="/policies/terms"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                policyType === 'terms'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Terms of Service
            </Link>
            <Link
              to="/policies/refund"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                policyType === 'refund'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Refund Policy
            </Link>
          </nav>
          
          {/* Policy Content */}
          <article className="prose prose-gray max-w-none">
            {renderContent(content)}
          </article>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-medium text-white mb-2">{storeName}</p>
          <p className="text-sm">© {new Date().getFullYear()} All rights reserved.</p>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=policy-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-300">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
