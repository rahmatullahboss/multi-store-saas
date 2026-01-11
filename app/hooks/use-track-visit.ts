import { useEffect } from 'react';
import { useLocation } from '@remix-run/react';

const STORAGE_KEY = 'store_visitor_id';

export function useTrackVisit(storeId: number | undefined | null) {
  const location = useLocation();

  useEffect(() => {
    if (!storeId) return;

    // 1. Get or create visitor ID
    let visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, visitorId);
    }

    // 2. Prepare payload
    const payload = {
      storeId,
      path: location.pathname,
      visitorId,
    };

    // 3. Send tracking request (fire and forget)
    // using fetch with keepalive to ensure it completes even if page unloads
    fetch('/api/track-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => {
      // Silently fail for analytics
      console.error('[Analytics] Failed to track visit:', err);
    });

  }, [storeId, location.pathname]);
}
