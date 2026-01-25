/**
 * Builder Toast Utilities
 *
 * Provides consistent toast notifications for page builder actions.
 * Uses sonner for beautiful, accessible notifications.
 */

import { toast } from 'sonner';

/**
 * Show toast for undo action
 */
export function showUndoToast() {
  toast.success('আনডু করা হয়েছে', {
    icon: '↩️',
    duration: 2000,
  });
}

/**
 * Show toast for redo action
 */
export function showRedoToast() {
  toast.success('রিডু করা হয়েছে', {
    icon: '↪️',
    duration: 2000,
  });
}

/**
 * Show toast for section delete
 */
export function showDeleteToast(sectionName?: string) {
  toast.success('সেকশন মুছে ফেলা হয়েছে', {
    description: sectionName,
    icon: '🗑️',
    duration: 2500,
  });
}

/**
 * Show toast for section duplicate
 */
export function showDuplicateToast(sectionName?: string) {
  toast.success('সেকশন ডুপ্লিকেট করা হয়েছে', {
    description: sectionName,
    icon: '📑',
    duration: 2500,
  });
}

/**
 * Show toast for section add
 */
export function showAddSectionToast(sectionName?: string) {
  toast.success('নতুন সেকশন যোগ করা হয়েছে', {
    description: sectionName,
    icon: '➕',
    duration: 2500,
  });
}

/**
 * Show toast for page publish
 */
export function showPublishToast(isUpdate = false) {
  toast.success(isUpdate ? 'পেজ আপডেট হয়েছে' : 'পেজ পাবলিশ হয়েছে', {
    description: 'পরিবর্তনগুলো লাইভ হয়ে গেছে',
    icon: '🚀',
    duration: 3000,
  });
}

/**
 * Show toast for save success
 */
export function showSaveToast() {
  toast.success('সংরক্ষিত হয়েছে', {
    icon: '💾',
    duration: 2000,
  });
}

/**
 * Show toast for error
 */
export function showErrorToast(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show toast for section reorder
 */
export function showReorderToast() {
  toast.success('সেকশন সাজানো হয়েছে', {
    icon: '↕️',
    duration: 2000,
  });
}

/**
 * Show loading toast that can be updated
 */
export function showLoadingToast(message: string) {
  return toast.loading(message, {
    duration: Infinity,
  });
}

/**
 * Update a toast by ID
 */
export function updateToast(
  toastId: string | number,
  options: { message: string; type: 'success' | 'error' }
) {
  if (options.type === 'success') {
    toast.success(options.message, { id: toastId });
  } else {
    toast.error(options.message, { id: toastId });
  }
}

/**
 * Dismiss a toast by ID
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}
