/**
 * Lead Customer Dashboard
 * Route: /lead-dashboard
 * 
 * After login, customers see their application status, upload documents, and track progress.
 */

import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useNavigation, useActionData } from '@remix-run/react';
import { createDb } from '~/lib/db.server';
import { customers } from '@db/schema';
import { eq } from 'drizzle-orm';
import { getCustomerId, getCustomerSession } from '~/services/customer-auth.server';
import { resolveStore } from '~/lib/store.server';
import { User, FileText, Clock, CheckCircle, Upload, Loader2, X, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Document types required for application
const REQUIRED_DOCUMENTS = [
  { id: 'passport', name: 'Passport', description: 'Valid passport (PDF or Image)' },
  { id: 'certificate', name: 'Academic Certificate', description: 'SSC/HSC or equivalent (PDF or Image)' },
  { id: 'english_test', name: 'English Proficiency Test', description: 'IELTS, TOEFL or Duolingo score (PDF or Image)' },
  { id: 'financial', name: 'Financial Documents', description: 'Bank statement or sponsorship letter (PDF or Image)' },
];

// Client-side document upload component
function DocumentUploadItem({ 
  doc, 
  primaryColor 
}: { 
  doc: { id: string; name: string; description: string; status: string; url: string | null };
  primaryColor: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(doc.url);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, WebP or PDF.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB allowed.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // First, upload to R2 via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', doc.id);

      const response = await fetch('/api/student-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as { success?: boolean; url?: string; error?: string };

      if (!response.ok || result.error || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      // Then save the URL to customer record
      const saveResponse = await fetch('/lead-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          intent: 'saveDocument',
          documentType: doc.id,
          documentUrl: result.url,
        }),
      });

      const saveResult = await saveResponse.json() as { success?: boolean; error?: string };

      if (!saveResponse.ok || saveResult.error) {
        throw new Error(saveResult.error || 'Failed to save document');
      }

      setUploadedUrl(result.url);
      // Reload to refresh data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isUploaded = uploadedUrl || doc.status === 'uploaded';

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium text-gray-900">{doc.name}</p>
          <p className="text-xs text-gray-500">{doc.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {isUploaded ? (
          <>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Uploaded
            </span>
            <a 
              href={uploadedUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </a>
          </>
        ) : (
          <span className="flex items-center gap-1 text-sm text-yellow-600">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        )}
        
        <label 
          className="cursor-pointer text-sm underline px-3 py-1 rounded hover:opacity-80"
          style={{ color: primaryColor }}
        >
          {uploading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            isUploaded ? 'Replace' : 'Upload'
          )}
          <input 
            type="file" 
            className="hidden" 
            accept=".jpeg,.jpg,.png,.webp,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>
      
      {error && (
        <p className="text-xs text-red-500 mt-1 w-full">{error}</p>
      )}
    </div>
  );
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  
  // Check authentication
  const customerId = await getCustomerId(request, env);
  if (!customerId) {
    return redirect('/lead-gen/auth/login');
  }

  const db = createDb(env.DB);
  
  // Get customer details
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customer) {
    return redirect('/lead-gen/auth/login');
  }

  const storeContext = await resolveStore(context, request);
  const storeName = storeContext?.store.name || 'Our Service';
  
  // Get theme colors from lead gen settings
  let primaryColor = '#4F46E5';
  let accentColor = '#8B5CF6';
  let logo: string | undefined;
  
  // For destinations, services, etc - to match homepage header
  let showDestinations = false;
  let showServices = false;
  let showProcess = false;
  let showTeam = false;

  if (storeContext?.store.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      if (config.primaryColor) primaryColor = config.primaryColor;
      if (config.accentColor) accentColor = config.accentColor;
      if (config.logo) logo = config.logo;
      // Get section visibility
      showDestinations = config.destinations?.length > 0;
      showServices = config.showServices && config.services?.length > 0;
      showProcess = config.processSteps?.length > 0;
      showTeam = config.showTeam && config.teamMembers?.length > 0;
    } catch {}
  }

  // Get customer's uploaded documents - in production this would come from a student_documents table
  // For now, we'll use customer.notes to store document URLs as JSON
  let uploadedDocuments: Record<string, { url: string; uploadedAt: string }> = {};
  if (customer.notes) {
    try {
      // Check if notes contains JSON document data
      const parsed = JSON.parse(customer.notes);
      if (parsed.documents && typeof parsed.documents === 'object') {
        uploadedDocuments = parsed.documents;
      }
    } catch {}
  }

  // Build application data with uploaded documents status
  const applicationData = {
    status: Object.keys(uploadedDocuments).length >= REQUIRED_DOCUMENTS.length ? 'submitted' : 'pending',
    submittedAt: null as string | null,
    lastUpdated: new Date().toISOString(),
    documents: REQUIRED_DOCUMENTS.map(doc => ({
      ...doc,
      status: uploadedDocuments[doc.id] ? 'uploaded' : 'pending',
      url: uploadedDocuments[doc.id]?.url || null,
      uploadedAt: uploadedDocuments[doc.id]?.uploadedAt || null,
    })),
    progress: Math.round((Object.keys(uploadedDocuments).length / REQUIRED_DOCUMENTS.length) * 100),
  };

  return json({ 
    customer, 
    storeName, 
    primaryColor,
    accentColor,
    logo,
    showDestinations,
    showServices,
    showProcess,
    showTeam,
    applicationData 
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'logout') {
    const { commitCustomerSession, getCustomerSession } = await import('~/services/customer-auth.server');
    const session = await getCustomerSession(request, env);
    session.unset('customerId');
    session.unset('storeId');
    
    return redirect('/lead-gen/auth/login', {
      headers: {
        'Set-Cookie': await commitCustomerSession(session, env),
      },
    });
  }

  if (intent === 'updateProfile') {
    const db = createDb(env.DB);
    const customerId = await getCustomerId(request, env);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    if (!customerId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      await db
        .update(customers)
        .set({ 
          name, 
          phone,
          updatedAt: new Date() 
        })
        .where(eq(customers.id, customerId));

      return json({ success: true, message: 'Profile updated successfully!' });
    } catch (error) {
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }
  }

  // Handle document upload - save document URL to customer record
  if (intent === 'saveDocument') {
    const db = createDb(env.DB);
    const customerId = await getCustomerId(request, env);
    const documentType = formData.get('documentType') as string;
    const documentUrl = formData.get('documentUrl') as string;

    if (!customerId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!documentType || !documentUrl) {
      return json({ error: 'Missing document information' }, { status: 400 });
    }

    try {
      // Get current customer notes
      const [existingCustomer] = await db
        .select({ notes: customers.notes })
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      // Parse existing notes or create new structure
      let existingDocs: Record<string, { url: string; uploadedAt: string }> = {};
      try {
        if (existingCustomer?.notes) {
          const parsed = JSON.parse(existingCustomer.notes);
          if (parsed.documents && typeof parsed.documents === 'object') {
            existingDocs = parsed.documents;
          }
        }
      } catch {}

      // Add/update document
      existingDocs[documentType] = {
        url: documentUrl,
        uploadedAt: new Date().toISOString(),
      };

      // Save back to notes as JSON
      const newNotes = JSON.stringify({ documents: existingDocs });

      await db
        .update(customers)
        .set({ 
          notes: newNotes,
          updatedAt: new Date() 
        })
        .where(eq(customers.id, customerId));

      return json({ success: true, message: 'Document saved successfully!' });
    } catch (error) {
      console.error('Save document error:', error);
      return json({ error: 'Failed to save document' }, { status: 500 });
    }
  }

  // Handle document deletion
  if (intent === 'deleteDocument') {
    const db = createDb(env.DB);
    const customerId = await getCustomerId(request, env);
    const documentType = formData.get('documentType') as string;

    if (!customerId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const [existingCustomer] = await db
        .select({ notes: customers.notes })
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      let existingDocs: Record<string, { url: string; uploadedAt: string }> = {};
      try {
        if (existingCustomer?.notes) {
          const parsed = JSON.parse(existingCustomer.notes);
          if (parsed.documents && typeof parsed.documents === 'object') {
            existingDocs = parsed.documents;
          }
        }
      } catch {}

      // Remove document
      delete existingDocs[documentType];

      const newNotes = JSON.stringify({ documents: existingDocs });

      await db
        .update(customers)
        .set({ 
          notes: newNotes,
          updatedAt: new Date() 
        })
        .where(eq(customers.id, customerId));

      return json({ success: true, message: 'Document deleted successfully!' });
    } catch (error) {
      return json({ error: 'Failed to delete document' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

type ActionData = { error?: string; success?: boolean; message?: string };

export default function LeadDashboard() {
  const { 
    customer, 
    storeName, 
    primaryColor,
    accentColor,
    logo,
    showDestinations,
    showServices,
    showProcess,
    showTeam,
    applicationData 
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Not Started',
    submitted: 'Documents Submitted',
    review: 'Under Review',
    approved: 'Approved',
    rejected: 'Needs Revision',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - SAME AS HOMEPAGE */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            {logo ? (
              <img className="h-10 w-auto" src={logo} alt={storeName} />
            ) : (
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                {storeName}
              </span>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            {showDestinations && (
              <a href="/destinations" className="text-gray-700 hover:opacity-80 font-medium transition">
                Destinations
              </a>
            )}
            {showServices && (
              <a href="/services" className="text-gray-700 hover:opacity-80 font-medium transition">
                Services
              </a>
            )}
            {showProcess && (
              <a href="/process" className="text-gray-700 hover:opacity-80 font-medium transition">
                Process
              </a>
            )}
            {showTeam && (
              <a href="/team" className="text-gray-700 hover:opacity-80 font-medium transition">
                Team
              </a>
            )}
            <a href="/contact" className="text-gray-700 hover:opacity-80 font-medium transition">
              Contact
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {customer.name || customer.email}
            </span>
            <Form method="post">
              <button
                type="submit"
                name="intent"
                value="logout"
                className="px-4 py-2 font-medium hover:opacity-80 transition"
                style={{ color: primaryColor }}
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Success Message */}
        {actionData?.success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {actionData.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {customer.name?.[0] || customer.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name || 'No Name'}</h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>

              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="updateProfile" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={customer.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={customer.phone || ''}
                    placeholder="+880 1XXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? 'Saving...' : 'Update Profile'}
                </button>
              </Form>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Application Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[applicationData.status]}`}>
                    {statusLabels[applicationData.status]}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Documents</span>
                  <span className="text-gray-900">
                    {applicationData.documents.filter(d => d.status === 'uploaded').length} / {applicationData.documents.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Profile Complete</span>
                  <span className="text-gray-900">
                    {customer.name && customer.phone ? '100%' : '50%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Application Status & Documents */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Application Progress</h2>
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {applicationData.progress}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${applicationData.progress}%`,
                    backgroundColor: primaryColor 
                  }}
                />
              </div>

              <p className="text-sm text-gray-600">
                Complete your profile and upload all required documents to proceed with your application.
              </p>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Required Documents</h2>
                <span className="text-sm text-gray-500">
                  {applicationData.documents.filter(d => d.status === 'uploaded').length} of {applicationData.documents.length} uploaded
                </span>
              </div>

              <div className="space-y-4">
                {applicationData.documents.map((doc) => (
                  <DocumentUploadItem
                    key={doc.id}
                    doc={doc}
                    primaryColor={primaryColor}
                  />
                ))}
              </div>

              {applicationData.status === 'submitted' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    All documents submitted! Our team will review your application.
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="relative pl-10 pb-6">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-green-500" />
                  <p className="font-medium text-gray-900">Account Created</p>
                  <p className="text-sm text-gray-500">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="relative pl-10 pb-6">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-gray-300" />
                  <p className="font-medium text-gray-900">Submit Documents</p>
                  <p className="text-sm text-gray-500">Upload all required documents</p>
                </div>

                <div className="relative pl-10 pb-6">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-gray-300" />
                  <p className="font-medium text-gray-900">Document Review</p>
                  <p className="text-sm text-gray-500">Our team will review your documents</p>
                </div>

                <div className="relative pl-10">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-gray-300" />
                  <p className="font-medium text-gray-900">Application Decision</p>
                  <p className="text-sm text-gray-500">Receive your admission decision</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient rounded-xl p-6 text-white" style={{ backgroundColor: primaryColor }}>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm opacity-90 mb-4">
                Our team is here to assist you with any questions about your application.
              </p>
              <a 
                href="/support" 
                className="inline-block px-4 py-2 bg-white rounded-lg text-sm font-medium"
                style={{ color: primaryColor }}
              >
                Contact Support
              </a>
            </div>

          </div>
        </div>
      </main>

      {/* Footer - SAME AS HOMEPAGE */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">{storeName}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted partner for quality education abroad.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                {showDestinations && <li><a href="/destinations" className="hover:text-white">Destinations</a></li>}
                {showServices && <li><a href="/services" className="hover:text-white">Services</a></li>}
                {showProcess && <li><a href="/process" className="hover:text-white">Process</a></li>}
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Destinations</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/destinations?country=usa" className="hover:text-white">USA</a></li>
                <li><a href="/destinations?country=uk" className="hover:text-white">UK</a></li>
                <li><a href="/destinations?country=canada" className="hover:text-white">Canada</a></li>
                <li><a href="/destinations?country=australia" className="hover:text-white">Australia</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Contact</h3>
              <p className="text-gray-400 text-sm">Get in touch for free consultation</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
