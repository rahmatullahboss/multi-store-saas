/**
 * Reports Dashboard
 * 
 * Route: /app/reports
 * 
 * Features:
 * - Sales report with date filter + CSV export
 * - Inventory report with CSV export
 * - Customer report with CSV export
 * - Tax report with date filter + CSV export
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { orders, products, customers, stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { 
  FileText, Download, Calendar, Package, 
  Users, DollarSign, Filter
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Reports - Ozzyl' }];
};

// ============================================================================
// LOADER - Fetch report data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  const reportType = url.searchParams.get('report') || 'sales';
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  // Get store currency
  const storeData = await db
    .select({ currency: stores.currency, name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const currency = storeData[0]?.currency || 'BDT';
  const storeName = storeData[0]?.name || 'Store';

  // Date filters
  const dateStart = startDate ? new Date(startDate) : null;
  const dateEnd = endDate ? new Date(endDate + 'T23:59:59') : null;

  let reportData: unknown[] = [];

  switch (reportType) {
    case 'sales': {
      const query = db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          createdAt: orders.createdAt,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          subtotal: orders.subtotal,
          shipping: orders.shipping,
          tax: orders.tax,
          total: orders.total,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
        })
        .from(orders)
        .where(eq(orders.storeId, storeId))
        .orderBy(desc(orders.createdAt));

      const allSalesOrders = await query;
      
      // Filter by date in JS
      reportData = allSalesOrders.filter(o => {
        if (!o.createdAt) return true;
        const orderDate = new Date(o.createdAt);
        if (dateStart && orderDate < dateStart) return false;
        if (dateEnd && orderDate > dateEnd) return false;
        return true;
      });
      break;
    }

    case 'inventory': {
      reportData = await db
        .select({
          id: products.id,
          title: products.title,
          sku: products.sku,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          inventory: products.inventory,
          isPublished: products.isPublished,
          category: products.category,
        })
        .from(products)
        .where(eq(products.storeId, storeId))
        .orderBy(products.title);
      break;
    }

    case 'customers': {
      // Get orders grouped by customer email
      const customerOrders = await db
        .select({
          customerEmail: orders.customerEmail,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          total: orders.total,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.storeId, storeId));

      // Aggregate by customer
      const customerMap = new Map<string, {
        email: string;
        name: string;
        phone: string;
        orderCount: number;
        totalSpent: number;
        lastOrderDate: Date | null;
      }>();

      customerOrders.forEach(o => {
        const key = o.customerEmail || o.customerPhone || '';
        if (!key) return;
        
        const existing = customerMap.get(key);
        if (existing) {
          existing.orderCount++;
          existing.totalSpent += o.total || 0;
          if (o.createdAt && (!existing.lastOrderDate || o.createdAt > existing.lastOrderDate)) {
            existing.lastOrderDate = o.createdAt;
          }
        } else {
          customerMap.set(key, {
            email: o.customerEmail || '',
            name: o.customerName || '',
            phone: o.customerPhone || '',
            orderCount: 1,
            totalSpent: o.total || 0,
            lastOrderDate: o.createdAt,
          });
        }
      });

      reportData = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
      break;
    }

    case 'tax': {
      // For now, show order totals (tax would be calculated based on store settings)
      const taxOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          createdAt: orders.createdAt,
          subtotal: orders.subtotal,
          total: orders.total,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
        })
        .from(orders)
        .where(eq(orders.storeId, storeId))
        .orderBy(desc(orders.createdAt));

      reportData = taxOrders.filter(o => {
        if (!o.createdAt) return true;
        const orderDate = new Date(o.createdAt);
        if (dateStart && orderDate < dateStart) return false;
        if (dateEnd && orderDate > dateEnd) return false;
        return true;
      });
      break;
    }
  }

  return json({
    reportType,
    reportData,
    currency,
    storeName,
    startDate,
    endDate,
  });
}

// ============================================================================
// CSV GENERATION
// ============================================================================
function generateSalesCSV(data: unknown[], currency: string): string {
  const orders = data as Array<{
    orderNumber: string;
    createdAt: Date | null;
    customerName: string | null;
    customerEmail: string | null;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    status: string | null;
    paymentStatus: string | null;
  }>;

  const headers = ['Order #', 'Date', 'Customer', 'Email', 'Subtotal', 'Shipping', 'Tax', 'Total', 'Status', 'Payment'];
  const rows = orders.map(o => [
    o.orderNumber || '',
    o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    o.customerName || '',
    o.customerEmail || '',
    o.subtotal?.toString() || '0',
    o.shipping?.toString() || '0',
    o.tax?.toString() || '0',
    o.total?.toString() || '0',
    o.status || '',
    o.paymentStatus || '',
  ]);

  return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
}

function generateInventoryCSV(data: unknown[]): string {
  const products = data as Array<{
    title: string;
    sku: string | null;
    price: number;
    inventory: number;
    isPublished: boolean | null;
    category: string | null;
  }>;

  const headers = ['Product', 'SKU', 'Price', 'Stock', 'Status', 'Category', 'Stock Value'];
  const rows = products.map(p => [
    p.title,
    p.sku || '',
    p.price?.toString() || '0',
    p.inventory?.toString() || '0',
    p.isPublished ? 'Active' : 'Draft',
    p.category || '',
    ((p.price || 0) * (p.inventory || 0)).toString(),
  ]);

  return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
}

function generateCustomersCSV(data: unknown[]): string {
  const customers = data as Array<{
    name: string;
    email: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: Date | null;
  }>;

  const headers = ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Last Order'];
  const rows = customers.map(c => [
    c.name,
    c.email,
    c.phone,
    c.orderCount.toString(),
    c.totalSpent.toString(),
    c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '',
  ]);

  return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
}

function generateTaxCSV(data: unknown[]): string {
  const orders = data as Array<{
    orderNumber: string;
    createdAt: Date | null;
    subtotal: number;
    total: number;
    status: string | null;
    paymentStatus: string | null;
  }>;

  const headers = ['Order #', 'Date', 'Subtotal', 'Total', 'Status', 'Payment Status'];
  const rows = orders.map(o => [
    o.orderNumber || '',
    o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    o.subtotal?.toString() || '0',
    o.total?.toString() || '0',
    o.status || '',
    o.paymentStatus || '',
  ]);

  return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ReportsPage() {
  const { reportType, reportData, currency, storeName, startDate, endDate } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useTranslation();

  const formatPrice = (amount: number) => {
    // Values are stored in actual currency (Taka/Dollar), not cents
    const symbols: Record<string, string> = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return `${symbols[currency] || currency} ${amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-BD')}`;
  };

  const handleReportChange = (type: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('report', type);
    setSearchParams(newParams);
  };

  const handleDateChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleExportCSV = () => {
    let csv = '';
    let filename = '';
    const dateStr = new Date().toISOString().split('T')[0];

    switch (reportType) {
      case 'sales':
        csv = generateSalesCSV(reportData, currency);
        filename = `sales-report-${dateStr}.csv`;
        break;
      case 'inventory':
        csv = generateInventoryCSV(reportData);
        filename = `inventory-report-${dateStr}.csv`;
        break;
      case 'customers':
        csv = generateCustomersCSV(reportData);
        filename = `customer-report-${dateStr}.csv`;
        break;
      case 'tax':
        csv = generateTaxCSV(reportData);
        filename = `tax-report-${dateStr}.csv`;
        break;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const reports = [
    { id: 'sales', label: t('salesReport'), icon: DollarSign, hasDateFilter: true },
    { id: 'inventory', label: t('inventoryReport'), icon: Package, hasDateFilter: false },
    { id: 'customers', label: t('customerReport'), icon: Users, hasDateFilter: false },
    { id: 'tax', label: t('taxReport'), icon: FileText, hasDateFilter: true },
  ];

  const currentReport = reports.find(r => r.id === reportType) || reports[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports')}</h1>
          <p className="text-gray-600">{lang === 'bn' ? `${storeName} এর ডেটা এক্সপোর্ট করুন` : `Export data for ${storeName}`}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Download className="w-4 h-4" />
          {t('exportCSV')}
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1">
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => handleReportChange(report.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
              reportType === report.id
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <report.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{report.label}</span>
          </button>
        ))}
      </div>

      {/* Date Filter (for sales and tax) */}
      {currentReport.hasDateFilter && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">{t('dateRange')}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('startDate')}</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('endDate')}</label>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('startDate');
                  newParams.delete('endDate');
                  setSearchParams(newParams);
                }}
                className="self-end px-3 py-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                {t('clearDates')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{currentReport.label}</h2>
          <span className="text-sm text-gray-500">{reportData.length} {t('records')}</span>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          {reportType === 'sales' && <SalesTable data={reportData} formatPrice={formatPrice} />}
          {reportType === 'inventory' && <InventoryTable data={reportData} formatPrice={formatPrice} />}
          {reportType === 'customers' && <CustomersTable data={reportData} formatPrice={formatPrice} />}
          {reportType === 'tax' && <TaxTable data={reportData} formatPrice={formatPrice} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TABLE COMPONENTS
// ============================================================================
function SalesTable({ data, formatPrice }: { data: unknown[]; formatPrice: (n: number) => string }) {
  const { t } = useTranslation();
  const orders = data as Array<{
    id: number;
    orderNumber: string;
    createdAt: Date | null;
    customerName: string | null;
    total: number;
    status: string | null;
    paymentStatus: string | null;
  }>;

  if (orders.length === 0) {
    return <EmptyState message={t('noSalesData')} />;
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('order')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('date')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('customer')}</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">{t('total')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('status')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('payment')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {orders.map(order => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">#{order.orderNumber}</td>
            <td className="px-4 py-3 text-gray-600">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
            </td>
            <td className="px-4 py-3 text-gray-600">{order.customerName || t('guest')}</td>
            <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPrice(order.total)}</td>
            <td className="px-4 py-3">
              <StatusBadge status={order.status || 'pending'} />
            </td>
            <td className="px-4 py-3">
              <PaymentBadge status={order.paymentStatus || 'pending'} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InventoryTable({ data, formatPrice }: { data: unknown[]; formatPrice: (n: number) => string }) {
  const { t } = useTranslation();
  const products = data as Array<{
    id: number;
    title: string;
    sku: string | null;
    price: number;
    inventory: number;
    isPublished: boolean | null;
  }>;

  if (products.length === 0) {
    return <EmptyState message={t('noInventoryData')} />;
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('product')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('sku')}</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">{t('price')}</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">{t('stock')}</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">{t('stockValue')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('status')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {products.map(product => (
          <tr key={product.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{product.title}</td>
            <td className="px-4 py-3 text-gray-600">{product.sku || '-'}</td>
            <td className="px-4 py-3 text-right text-gray-900">{formatPrice(product.price)}</td>
            <td className="px-4 py-3 text-right">
              <span className={`font-medium ${
                product.inventory <= 5 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {product.inventory}
              </span>
            </td>
            <td className="px-4 py-3 text-right text-gray-900">
              {formatPrice(product.price * product.inventory)}
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {product.isPublished ? t('active') : t('draft')}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomersTable({ data, formatPrice }: { data: unknown[]; formatPrice: (n: number) => string }) {
  const { t } = useTranslation();
  const customers = data as Array<{
    name: string;
    email: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: Date | null;
  }>;

  if (customers.length === 0) {
    return <EmptyState message={t('noCustomerData')} />;
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('customer')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('contact')}</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">{t('orders')}</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">{t('totalSpent')}</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">{t('lastOrder')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {customers.map((customer, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{customer.name || t('unknown')}</td>
            <td className="px-4 py-3">
              <div className="text-gray-600">{customer.email || '-'}</div>
              {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
            </td>
            <td className="px-4 py-3 text-right text-gray-900">{customer.orderCount}</td>
            <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPrice(customer.totalSpent)}</td>
            <td className="px-4 py-3 text-gray-600">
              {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TaxTable({ data, formatPrice }: { data: unknown[]; formatPrice: (n: number) => string }) {
  const { t } = useTranslation();
  const orders = data as Array<{
    id: number;
    orderNumber: string;
    createdAt: Date | null;
    subtotal: number;
    total: number;
    status: string | null;
    paymentStatus: string | null;
  }>;

  if (orders.length === 0) {
    return <EmptyState message={t('noTaxData')} />;
  }

  const totalSubtotal = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">{t('order')}</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">{t('date')}</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">{t('subtotal')}</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">{t('total')}</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">{t('payment')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">#{order.orderNumber}</td>
              <td className="px-4 py-3 text-gray-600">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3 text-right text-gray-900">{formatPrice(order.subtotal)}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPrice(order.total)}</td>
              <td className="px-4 py-3">
                <PaymentBadge status={order.paymentStatus || 'pending'} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
          <tr>
            <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">{t('total')}</td>
            <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(totalSubtotal)}</td>
            <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(totalAmount)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(status)}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(status)}
    </span>
  );
}
