/**
 * Store Delete Warning Modal
 * 
 * Shows merchants all the data they will lose when deleting their store.
 * Requires typing "DELETE" to confirm - creating friction for retention.
 */

import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { 
  AlertTriangle, 
  X, 
  Package, 
  Users, 
  ShoppingCart, 
  Mail, 
  FileText,
  BarChart3,
  Loader2,
  Trash2
} from 'lucide-react';

interface DataCounts {
  products: number;
  customers: number;
  orders: number;
  totalRevenue: number;
  subscribers: number;
  landingPages: number;
  campaigns: number;
  currency: string;
}

interface StoreDeleteWarningProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  dataCounts: DataCounts;
}

export function StoreDeleteWarningModal({ 
  isOpen, 
  onClose, 
  storeName,
  dataCounts 
}: StoreDeleteWarningProps) {
  const [confirmText, setConfirmText] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== 'idle';

  if (!isOpen) return null;

  const canDelete = confirmText === 'DELETE';

  const formatCurrency = (amount: number) => {
    if (dataCounts.currency === 'BDT') {
      return `৳${amount.toLocaleString('en-BD')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  const handleDelete = () => {
    if (!canDelete) return;
    
    fetcher.submit(
      { 
        intent: 'deleteStore',
        exitReason,
        feedback
      },
      { method: 'post' }
    );
  };

  const dataItems = [
    { 
      icon: Package, 
      label: 'Products', 
      count: dataCounts.products,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      icon: Users, 
      label: 'Customers', 
      count: dataCounts.customers,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    { 
      icon: ShoppingCart, 
      label: 'Orders', 
      count: dataCounts.orders,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtext: dataCounts.totalRevenue > 0 ? `${formatCurrency(dataCounts.totalRevenue)} revenue` : undefined
    },
    { 
      icon: Mail, 
      label: 'Email Subscribers', 
      count: dataCounts.subscribers,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    { 
      icon: FileText, 
      label: 'Landing Pages', 
      count: dataCounts.landingPages,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    { 
      icon: BarChart3, 
      label: 'Email Campaigns', 
      count: dataCounts.campaigns,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
  ];

  const exitReasons = [
    { value: 'pricing', label: 'Pricing is too high' },
    { value: 'features', label: 'Missing features I need' },
    { value: 'competitor', label: 'Switching to another platform' },
    { value: 'closing', label: 'Closing my business' },
    { value: 'temporary', label: 'Taking a break temporarily' },
    { value: 'other', label: 'Other reason' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-red-50 border-b border-red-100 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">Delete Store?</h2>
                <p className="text-sm text-red-600">This action cannot be undone</p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 font-medium">
                ⚠️ You are about to permanently delete <strong>"{storeName}"</strong>
              </p>
              <p className="text-amber-700 text-sm mt-1">
                All your store data will be lost forever. This includes:
              </p>
            </div>

            {/* Data Loss Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                Data You Will Lose
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {dataItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.label}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        {item.subtext && (
                          <p className="text-xs text-gray-400">{item.subtext}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exit Survey (Optional) */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-900">
                Why are you leaving? <span className="text-gray-400 font-normal">(Optional)</span>
              </h3>
              <select
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="">Select a reason...</option>
                {exitReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>

              {exitReason && (
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Any additional feedback? (helps us improve)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
              )}
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Type DELETE here..."
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent ${
                  confirmText === 'DELETE' 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-gray-500'
                }`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel, Keep My Store
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete || isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>

            {/* Last chance reminder */}
            <p className="text-xs text-center text-gray-400">
              This is your last chance. Once deleted, there's no going back.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
