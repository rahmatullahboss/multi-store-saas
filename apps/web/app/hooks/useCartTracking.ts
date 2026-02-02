/**
 * useCartTracking Hook
 * 
 * Tracks abandoned carts by sending partial form data to the API.
 * Uses debouncing to avoid excessive API calls while user types.
 * 
 * Usage in templates:
 * const trackCart = useCartTracking(storeId, productId);
 * // Call when form data changes:
 * trackCart({ customer_name, phone, quantity, variant_id });
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface CartTrackingData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  quantity?: number;
  variant_id?: number;
  variant_info?: string;
}

const DEBOUNCE_MS = 2500; // Wait 2.5 seconds after user stops typing
const SESSION_KEY = 'cart_session_id';
const ANALYTICS_BATCH_KEY = 'store_analytics_batch';
const FLUSH_DELAY_MS = 1000;

// Generate a unique session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Get or create session ID from localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useCartTracking(storeId: number | undefined, productId: number | undefined) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');
  const [sessionId] = useState<string>(() => getSessionId());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const trackCart = useCallback(
    (data: CartTrackingData) => {
      // Skip if missing required IDs
      if (!storeId || !productId) return;

      // Skip if no contact info (can't recover without it)
      if (!data.customer_phone && !data.customer_email) return;

      // Skip if data hasn't changed
      const dataString = JSON.stringify(data);
      if (dataString === lastDataRef.current) return;
      lastDataRef.current = dataString;

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the API call
      timeoutRef.current = setTimeout(() => {
        const payload = {
          type: 'cart' as const,
          store_id: storeId,
          product_id: productId,
          session_id: sessionId,
          customer_name: data.customer_name || undefined,
          customer_email: data.customer_email || undefined,
          customer_phone: data.customer_phone || undefined,
          quantity: data.quantity || 1,
          variant_id: data.variant_id,
          variant_info: data.variant_info,
          ts: Date.now(),
        };

        const queued = localStorage.getItem(ANALYTICS_BATCH_KEY);
        const batch = queued ? (JSON.parse(queued) as typeof payload[]) : [];
        batch.push(payload);
        localStorage.setItem(ANALYTICS_BATCH_KEY, JSON.stringify(batch));

        window.setTimeout(() => {
          const queuedBatch = localStorage.getItem(ANALYTICS_BATCH_KEY);
          if (!queuedBatch) return;

          localStorage.removeItem(ANALYTICS_BATCH_KEY);

          fetch('/api/track-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: JSON.parse(queuedBatch) }),
            keepalive: true,
          }).catch(() => {
            localStorage.setItem(ANALYTICS_BATCH_KEY, queuedBatch);
          });
        }, FLUSH_DELAY_MS);
      }, DEBOUNCE_MS);
    },
    [storeId, productId, sessionId]
  );

  return { trackCart, sessionId };
}
