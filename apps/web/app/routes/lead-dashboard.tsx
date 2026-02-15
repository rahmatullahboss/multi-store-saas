/**
 * Lead Gen Client Dashboard
 * Pro Max Design: Modern Sidebar + Premium UI + Stats Board
 */

import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type SerializeFrom,
} from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useActionData } from '@remix-run/react';
import { createDb } from '~/lib/db.server';
import { customers, leadGenForms, leadGenSubmissions } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCustomerId, getCustomerStoreId, requireCustomer, logoutCustomer } from '~/services/customer-auth.server';
import { resolveStore } from '~/lib/store.server';
import {
  LogOut,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Menu,
  LayoutDashboard,
  Settings,
  Shield,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Interfaces
type Customer = typeof customers.$inferSelect;

interface SubmissionData {
  id: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed' | null;
  data: Record<string, unknown>;
  createdAt: Date | null;
  formName: string | null;
}

interface LoaderData {
  customer: Customer;
  storeName: string;
  submissions: SubmissionData[];
  primaryColor: string;
  logo: string | undefined;
  stats: {
    totalApplications: number;
    pendingAction: number;
    completed: number;
  };
}

async function hasExpectedLeadGenSubmissionsSchema(db: D1Database): Promise<boolean> {
  try {
    const result = await db.prepare("PRAGMA table_info('lead_gen_submissions')").all<{
      name?: string;
    }>();
    const columns = new Set(
      (result.results || []).map((row) => (row.name || '').toLowerCase())
    );
    const required = ['customer_id', 'data', 'form_id', 'created_at', 'status'];
    return required.every((column) => columns.has(column));
  } catch {
    return false;
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const customerId = await requireCustomer(request, env);
  const sessionStoreId = await getCustomerStoreId(request, env);
  if (!sessionStoreId) {
    return redirect('/lead-gen/auth/login');
  }
  const db = createDb(env.DB);

  const storeContext = await resolveStore(context, request);
  if (!storeContext || storeContext.storeId !== sessionStoreId) {
    return redirect('/lead-gen/auth/login?error=invalid_store_session');
  }

  // Get customer data
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, sessionStoreId)))
    .limit(1);

  // Explicitly check for null/undefined customer
  if (!customer) {
    // If we have a session but no customer record, force logout
    // We need the store URL for redirect, try to get it from request or context
    const storeUrl = storeContext?.store ? `https://${storeContext.store.subdomain}.ozzyl.com` : '/';
    return logoutCustomer(request, storeUrl, env);
  }

  const storeName = storeContext?.store.name || 'Our Service';

  // Get theme colors from lead gen settings OR fallback
  let primaryColor = '#4F46E5';
  let logo: string | undefined;

  // 1. Try lead gen config
  if (storeContext?.store.leadGenConfig) {
    try {
      const config = JSON.parse(storeContext.store.leadGenConfig as string);
      if (config.primaryColor) primaryColor = config.primaryColor;
      if (config.logo) logo = config.logo;
    } catch { /* ignore */ }
  }

  // 2. Fallback to store theme config (was 'settings' but schema uses 'themeConfig')
  if (primaryColor === '#4F46E5' && storeContext?.store.themeConfig) {
    try {
      const themeConfig = JSON.parse(storeContext.store.themeConfig as string);
      if (themeConfig.primaryColor) primaryColor = themeConfig.primaryColor;
      if (!logo && themeConfig.logo) logo = themeConfig.logo; // Assuming logo might be in themeConfig too
      
      // Also check specific logo field on store if not found
      if (!logo && storeContext.store.logo) {
         logo = storeContext.store.logo;
      }
    } catch { /* ignore */ }
  }


  // Get submissions/applications. Some environments may not have lead gen tables yet.
  let submissions: Array<{
    id: number;
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed' | null;
    data: unknown;
    createdAt: Date | null;
    formName: string | null;
  }> = [];

  const schemaReady = await hasExpectedLeadGenSubmissionsSchema(env.DB);
  if (schemaReady) {
    try {
      submissions = await db
        .select({
          id: leadGenSubmissions.id,
          status: leadGenSubmissions.status,
          data: leadGenSubmissions.data,
          createdAt: leadGenSubmissions.createdAt,
          formName: leadGenForms.name,
        })
        .from(leadGenSubmissions)
        .leftJoin(leadGenForms, eq(leadGenSubmissions.formId, leadGenForms.id))
        .where(eq(leadGenSubmissions.customerId, customerId))
        .orderBy(desc(leadGenSubmissions.createdAt));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isLeadGenSchemaIssue =
        /no such table:\s*lead_gen_(forms|submissions)/i.test(message) ||
        /no such column:\s*lead_gen_submissions\.(data|form_id|customer_id|created_at|status)/i.test(message) ||
        /no such column:\s*(data|form_id|customer_id|created_at|status)/i.test(message);

      if (isLeadGenSchemaIssue) {
        console.warn('[lead-dashboard] Lead gen schema mismatch; returning empty submissions.');
        submissions = [];
      } else {
        throw error;
      }
    }
  } else {
    console.warn('[lead-dashboard] Legacy lead_gen_submissions schema detected; skipping submissions query.');
  }

  // Parse JSON data in submissions and cast to SubmissionData
  const parsedSubmissions: SubmissionData[] = submissions.map(s => ({
    id: s.id,
    status: s.status,
    data: typeof s.data === 'string' ? JSON.parse(s.data) : (s.data as Record<string, unknown>),
    createdAt: s.createdAt,
    formName: s.formName,
  }));

  // Calculate stats
  const stats = {
    totalApplications: parsedSubmissions.length,
    pendingAction: parsedSubmissions.filter(s => s.status === 'pending' || s.status === 'in_review').length,
    completed: parsedSubmissions.filter(s => s.status === 'approved' || s.status === 'completed').length,
  };

  return json<LoaderData>({
    customer,
    storeName,
    submissions: parsedSubmissions,
    primaryColor,
    logo,
    stats
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  
  // We need store info for logout redirect
  const storeContext = await resolveStore(context, request);
  const storeUrl = storeContext?.store ? `https://${storeContext.store.subdomain}.ozzyl.com` : '/';

  const customerId = await getCustomerId(request, env);
  const sessionStoreId = await getCustomerStoreId(request, env);
  if (!customerId || !sessionStoreId) return redirect('/lead-gen/auth/login');

  const db = createDb(env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'logout') {
    return logoutCustomer(request, storeUrl, env);
  }

  if (intent === 'update_profile') {
     const name = formData.get('name') as string;
     const phone = formData.get('phone') as string;

     await db.update(customers)
       .set({ name, phone, updatedAt: new Date() })
       .where(and(eq(customers.id, customerId), eq(customers.storeId, sessionStoreId)));

     return json({ success: true, message: 'Profile updated successfully' });
  }

  // Handle file upload (simplified for this context)
  if (intent === 'upload_document') {
     return json({ success: true, message: 'Document uploaded (simulation)' });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function LeadDashboard() {
  const { customer, storeName, submissions, primaryColor, logo, stats } = useLoaderData<typeof loader>() as SerializeFrom<LoaderData>;
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'documents' | 'profile'>('dashboard');
  const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
  
  // Close sidebar on route change (or tab change on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);


  // Helper to format dates
  const formatDate = (date: Date | null | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-sm lg:shadow-none transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-gray-50">
            <Link to="/" className="flex items-center gap-2">
               {logo ? (
                  <img className="h-8 w-auto" src={logo} alt={storeName} />
               ) : (
                  <span className="text-xl font-bold truncate" style={{ color: primaryColor }}>{storeName}</span>
               )}
            </Link>
          </div>

          {/* User Profile Snippet */}
          <div className="p-6 pb-2">
             <div className="flex items-center gap-4 mb-6">
                <div 
                   className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
                   style={{ backgroundColor: primaryColor }}
                >
                   {customer.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                   <h3 className="font-semibold text-gray-900 truncate">{customer.name || 'User'}</h3>
                   <p className="text-xs text-gray-500 truncate">{customer.email || customer.phone}</p>
                </div>
             </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <button
               onClick={() => setActiveTab('dashboard')}
               className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                 activeTab === 'dashboard' 
                   ? 'bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-200' 
                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
               }`}
            >
               <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`} style={activeTab === 'dashboard' ? { color: primaryColor } : undefined} />
               Dashboard
            </button>
            
            <button
               onClick={() => setActiveTab('applications')}
               className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                 activeTab === 'applications' 
                   ? 'bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-200' 
                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
               }`}
            >
               <FileText className={`w-5 h-5 ${activeTab === 'applications' ? 'text-indigo-600' : 'text-gray-400'}`} style={activeTab === 'applications' ? { color: primaryColor } : undefined} />
               Applications
               {stats.pendingAction > 0 && (
                  <span className="ml-auto bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs font-semibold">
                     {stats.pendingAction}
                  </span>
               )}
            </button>
            <button
               onClick={() => setActiveTab('documents')}
               className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                 activeTab === 'documents' 
                   ? 'bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-200' 
                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
               }`}
            >
               <Upload className={`w-5 h-5 ${activeTab === 'documents' ? 'text-indigo-600' : 'text-gray-400'}`} style={activeTab === 'documents' ? { color: primaryColor } : undefined} />
               Documents
            </button>
            <button
               onClick={() => setActiveTab('profile')}
               className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                 activeTab === 'profile' 
                   ? 'bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-200' 
                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
               }`}
            >
               <Settings className={`w-5 h-5 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`} style={activeTab === 'profile' ? { color: primaryColor } : undefined} />
               Profile Settings
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-50">
             <Form method="post">
                <input type="hidden" name="intent" value="logout" />
                <button
                   type="submit"
                   className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                   <LogOut className="w-5 h-5" />
                   Sign Out
                </button>
             </Form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
         {/* Top Header Mobile */}
         <div className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-30">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
               <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-gray-900 truncate max-w-[200px]">{storeName}</span>
            <div className="w-8" /> {/* spacer */}
         </div>

         {/* Content Scroll Area */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
               
               {/* Welcome Banner (Only on Dashboard) */}
               {activeTab === 'dashboard' && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                     <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                           Welcome back, {customer.name?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-gray-500 max-w-xl">
                           Here is what's happening with your applications today. You have {stats.pendingAction} items requiring your attention.
                        </p>
                     </div>
                     <div 
                        className="absolute right-0 top-0 w-64 h-64 opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
                        style={{ backgroundColor: primaryColor }}
                     />
                  </div>
               )}

               {/* Stats Grid */}
               {activeTab === 'dashboard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-3 bg-blue-50 rounded-xl">
                              <FileText className="w-6 h-6 text-blue-600" />
                           </div>
                           <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.totalApplications}</div>
                        <p className="text-sm text-gray-500 mt-1">Applications</p>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-3 bg-amber-50 rounded-xl">
                              <Clock className="w-6 h-6 text-amber-600" />
                           </div>
                           <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pending</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.pendingAction}</div>
                        <p className="text-sm text-gray-500 mt-1">Actions Required</p>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-3 bg-green-50 rounded-xl">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                           </div>
                           <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Done</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
                        <p className="text-sm text-gray-500 mt-1">Completed</p>
                     </div>
                  </div>
               )}

               {/* Recent Applications List */}
               {(activeTab === 'dashboard' || activeTab === 'applications') && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                        {activeTab === 'dashboard' && (
                           <button 
                             onClick={() => setActiveTab('applications')}
                             className="text-sm font-medium hover:underline"
                             style={{ color: primaryColor }}
                           >
                             View All
                           </button>
                        )}
                     </div>
                     
                     {submissions.length === 0 ? (
                        <div className="p-12 text-center">
                           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-gray-300" />
                           </div>
                           <h3 className="text-gray-900 font-medium mb-1">No applications yet</h3>
                           <p className="text-gray-500 text-sm mb-6">Start by applying for a program or service.</p>
                           <Link 
                              to="/"
                              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: primaryColor }}
                           >
                              Browse Programs
                           </Link>
                        </div>
                     ) : (
                        <div className="divide-y divide-gray-50">
                           {submissions.map((sub: SerializeFrom<SubmissionData>) => (
                              <div key={sub.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                          sub.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                          sub.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                                       }`}>
                                          <Activity className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                             {sub.formName || 'Application'}
                                          </h4>
                                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                             <span>Submitted on {formatDate(sub.createdAt)}</span>
                                             <span>•</span>
                                             <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sub.status)}`}>
                                                {sub.status?.replace('_', ' ').toUpperCase()}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* Documents Tab */}
               {activeTab === 'documents' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">My Documents</h2>
                        <p className="text-gray-500 text-sm">Upload and manage your required documents for applications.</p>
                     </div>
                     
                     <div className="p-6 grid gap-6">
                        {/* Upload Zone */}
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 hover:bg-gray-50 transition-all cursor-pointer">
                           <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="w-6 h-6 text-indigo-600" />
                           </div>
                           <h3 className="text-gray-900 font-medium">Click to upload or drag and drop</h3>
                           <p className="text-gray-500 text-sm mt-1">PDF, JPG, PNG up to 10MB</p>
                        </div>

                        {/* File Liist (Mock for now since logic is simplified) */}
                        <div className="space-y-3">
                           <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Uploaded Files</h3>
                           {/* Empty state for now */}
                           <div className="text-center py-8 text-gray-400 text-sm italic">
                              No documents uploaded yet.
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Profile Settings Tab */}
               {activeTab === 'profile' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
                     </div>
                     <div className="p-6 max-w-2xl">
                        <Form method="post" className="space-y-6">
                           <input type="hidden" name="intent" value="update_profile" />
                           
                           <div className="flex items-center gap-6 mb-8">
                              <div 
                                 className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                                 style={{ backgroundColor: primaryColor }}
                              >
                                 {customer.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                 <h3 className="text-lg font-bold text-gray-900">{customer.name || 'User'}</h3>
                                 <p className="text-gray-500">Student Account</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                 <input 
                                    type="text" 
                                    name="name" 
                                    defaultValue={customer.name || ''}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                 <div className="relative">
                                    <input 
                                       type="email" 
                                       defaultValue={customer.email || ''}
                                       disabled
                                       className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed pl-10"
                                    />
                                    <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                 </div>
                                 <p className="text-xs text-gray-400 mt-1">Email cannot be changed for security.</p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                 <input 
                                    type="tel" 
                                    name="phone"
                                    defaultValue={customer.phone || ''} 
                                    placeholder="+1234567890"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                           </div>
                           
                           <div className="pt-4">
                              <button 
                                 type="submit"
                                 className="px-6 py-2.5 rounded-xl text-white font-medium shadow-md hover:opacity-90 transition-opacity"
                                 style={{ backgroundColor: primaryColor }}
                              >
                                 Save Changes
                              </button>
                              {actionData?.message && (
                                 <span className="ml-4 text-sm text-green-600 font-medium animate-in fade-in">
                                    {actionData.message}
                                 </span>
                              )}
                           </div>
                        </Form>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </main>
    </div>
  );
}
