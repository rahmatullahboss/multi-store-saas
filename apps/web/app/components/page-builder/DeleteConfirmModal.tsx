/**
 * Delete Confirmation Modal Component
 * 
 * A custom modal to replace the native browser confirm() dialog
 * which can be problematic with React re-renders.
 */

import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  sectionName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  sectionName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">সেকশন ডিলিট করুন</h3>
            <p className="text-sm text-gray-500">Delete Section</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <p className="text-gray-600">
            আপনি কি নিশ্চিত "<span className="font-medium text-gray-900">{sectionName}</span>" সেকশনটি ডিলিট করতে চান?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex gap-2 p-4 bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            হ্যাঁ, ডিলিট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
