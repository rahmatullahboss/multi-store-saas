/**
 * Super Admin - Storage Management
 * 
 * Route: /admin/storage
 * 
 * Features:
 * - View all R2 storage files
 * - Identify orphaned files (not referenced in DB)
 * - Delete unused files to reclaim storage
 * - Storage usage statistics
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { products, stores } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import {
  HardDrive, 
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  FileImage,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const meta: MetaFunction = () => {
  return [{ title: 'Storage Management - Super Admin' }];
};

interface R2File {
  key: string;
  size: number;
  uploaded: string;
  isOrphaned: boolean;
  usedBy: string | null;
}

// ============================================================================
// LOADER - Fetch R2 files and check against database
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  const r2 = context.cloudflare.env.R2;
  const r2PublicUrl = context.cloudflare.env.R2_PUBLIC_URL || '';
  
  if (!r2) {
    return json({ 
      files: [], 
      error: 'R2 storage not configured',
      totalSize: 0,
      orphanedCount: 0,
      totalCount: 0,
      r2PublicUrl: '',
    });
  }
  
  // Get all files from R2
  const r2Objects = await r2.list({ limit: 500 });
  
  // Get all image URLs from database
  const allProducts = await drizzleDb
    .select({ imageUrl: products.imageUrl })
    .from(products);
  
  const allStores = await drizzleDb
    .select({ 
      logo: stores.logo, 
      favicon: stores.favicon,
      landingConfig: stores.landingConfig,
    })
    .from(stores);
  
  // Build set of used URLs
  const usedUrls = new Set<string>();
  const urlToUsage = new Map<string, string>();
  
  // Product images
  allProducts.forEach(p => {
    if (p.imageUrl) {
      usedUrls.add(p.imageUrl);
      urlToUsage.set(p.imageUrl, 'Product Image');
    }
  });
  
  // Store assets
  allStores.forEach(s => {
    if (s.logo) {
      usedUrls.add(s.logo);
      urlToUsage.set(s.logo, 'Store Logo');
    }
    if (s.favicon) {
      usedUrls.add(s.favicon);
      urlToUsage.set(s.favicon, 'Store Favicon');
    }
    // Check landing config for images
    if (s.landingConfig) {
      try {
        const config = typeof s.landingConfig === 'string' 
          ? JSON.parse(s.landingConfig) 
          : s.landingConfig;
        
        // Extract image URLs from landing config
        const extractUrls = (obj: unknown): void => {
          if (!obj || typeof obj !== 'object') return;
          
          for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            if (typeof value === 'string' && value.includes(r2PublicUrl)) {
              usedUrls.add(value);
              urlToUsage.set(value, `Landing Page (${key})`);
            } else if (typeof value === 'object') {
              extractUrls(value);
            }
          }
        };
        extractUrls(config);
      } catch {
        // Ignore parse errors
      }
    }
  });
  
  // Map R2 objects to our format
  const files: R2File[] = r2Objects.objects.map(obj => {
    const fullUrl = r2PublicUrl ? `${r2PublicUrl.replace(/\/$/, '')}/${obj.key}` : obj.key;
    const isOrphaned = !usedUrls.has(fullUrl);
    const usedBy = urlToUsage.get(fullUrl) || null;
    
    return {
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      isOrphaned,
      usedBy,
    };
  });
  
  // Sort: orphaned first, then by date
  files.sort((a, b) => {
    if (a.isOrphaned !== b.isOrphaned) return a.isOrphaned ? -1 : 1;
    return new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime();
  });
  
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const orphanedCount = files.filter(f => f.isOrphaned).length;
  
  return json({ 
    files,
    error: null,
    totalSize,
    orphanedCount,
    totalCount: files.length,
    r2PublicUrl,
  });
}

// ============================================================================
// ACTION - Delete files from R2
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const r2 = context.cloudflare.env.R2;
  if (!r2) {
    return json({ error: 'R2 not configured' }, { status: 500 });
  }
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'delete') {
    const key = formData.get('key') as string;
    if (!key) {
      return json({ error: 'No file key provided' }, { status: 400 });
    }
    
    await r2.delete(key);
    return json({ success: true, deleted: key });
  }
  
  if (intent === 'deleteAll') {
    const keys = formData.getAll('keys') as string[];
    if (keys.length === 0) {
      return json({ error: 'No files selected' }, { status: 400 });
    }
    
    // Delete all selected files
    for (const key of keys) {
      await r2.delete(key);
    }
    
    return json({ success: true, deleted: keys.length });
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminStorage() {
  const loaderData = useLoaderData<typeof loader>();
  const { error, totalSize, orphanedCount, totalCount, r2PublicUrl } = loaderData;
  // Ensure files is always a valid array without null items
  const files = (loaderData.files || []) as R2File[];
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrphanedOnly, setShowOrphanedOnly] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const fetcher = useFetcher();
  
  const isDeleting = fetcher.state !== 'idle';
  
  // Filter files
  const filteredFiles = files.filter((file): file is R2File => {
    if (!file) return false;
    const matchesSearch = file.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = showOrphanedOnly ? file.isOrphaned : true;
    return matchesSearch && matchesFilter;
  });
  
  const toggleSelect = (key: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFiles(newSelected);
  };
  
  const selectAllOrphaned = () => {
    const orphanedKeys = files.filter((f): f is R2File => f !== null && f.isOrphaned).map(f => f.key);
    setSelectedFiles(new Set(orphanedKeys));
  };
  
  const clearSelection = () => {
    setSelectedFiles(new Set());
  };
  
  const orphanedSize = files.filter((f): f is R2File => f !== null && f.isOrphaned).reduce((sum, f) => sum + f.size, 0);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-400">{error}</h3>
        <p className="text-sm text-red-300/70 mt-1">R2 storage configuration is required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.storageManagement')}</h1>
          <p className="text-slate-400">{t('admin.storageManagementDesc')}</p>
        </div>
        
        <Form method="get">
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${isDeleting ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </Form>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatBytes(totalSize)}</p>
              <p className="text-sm text-slate-400">{t('admin.totalStorage')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <FileImage className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
              <p className="text-sm text-slate-400">{t('admin.totalFiles')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{orphanedCount}</p>
              <p className="text-sm text-slate-400">{t('admin.orphaned')} ({formatBytes(orphanedSize)})</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('admin.searchFilesPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>
        
        {/* Filter Toggle */}
        <button
          onClick={() => setShowOrphanedOnly(!showOrphanedOnly)}
          className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
            showOrphanedOnly 
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {t('admin.orphanedOnly')}
        </button>
        
        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="deleteAll" />
            {Array.from(selectedFiles).map(key => (
              <input key={key} type="hidden" name="keys" value={key} />
            ))}
            <button
              type="submit"
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {t('admin.deleteFilesBtn', { count: selectedFiles.size })}
            </button>
          </fetcher.Form>
        )}
      </div>
      
      {/* Selection Actions */}
      {orphanedCount > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={selectAllOrphaned}
            className="text-sm text-orange-400 hover:text-orange-300 transition"
          >
            {t('admin.selectAllOrphaned', { count: orphanedCount })}
          </button>
          {selectedFiles.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              {t('admin.clearSelection')}
            </button>
          )}
        </div>
      )}
      
      {/* Files Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left w-10">
                  <input 
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(new Set(filteredFiles.map(f => f.key)));
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600 text-red-500 focus:ring-red-500/50"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.colFile')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.colStatus')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.colSize')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.colUploaded')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {showOrphanedOnly ? t('admin.noOrphanedFiles') : t('admin.noFiles')}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.key} className={`hover:bg-slate-800/50 transition ${file.isOrphaned ? 'bg-orange-500/5' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.key)}
                        onChange={() => toggleSelect(file.key)}
                        className="w-4 h-4 rounded border-slate-600 text-red-500 focus:ring-red-500/50"
                      />
                    </td>
                    
                    {/* File Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          file.isOrphaned ? 'bg-orange-500/20' : 'bg-slate-700'
                        }`}>
                          <ImageIcon className={`w-5 h-5 ${file.isOrphaned ? 'text-orange-400' : 'text-slate-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-xs" title={file.key}>
                            {file.key.split('/').pop()}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{file.key}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3">
                      {file.isOrphaned ? (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          {t('admin.orphaned')}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            {t('admin.inUse')}
                          </span>
                          {file.usedBy && (
                            <span className="text-xs text-slate-500 ml-1">
                              ({file.usedBy})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    {/* Size */}
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {formatBytes(file.size)}
                    </td>
                    
                    {/* Uploaded */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(file.uploaded)}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`${r2PublicUrl}/${file.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                          title={t('admin.viewFile')}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </a>
                        <fetcher.Form method="post">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="key" value={file.key} />
                          <button
                            type="submit"
                            disabled={isDeleting}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition disabled:opacity-50"
                            title={t('admin.deleteFile')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </fetcher.Form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Warning Notice */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-orange-400">{t('admin.orphanedFilesNoticeTitle')}</h4>
            <p className="text-xs text-orange-300/80 mt-1">
              {t('admin.orphanedFilesNoticeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
