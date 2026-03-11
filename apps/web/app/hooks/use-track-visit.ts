import { useEffect } from 'react';
import { useLocation } from '@remix-run/react';
import { generateUUID } from '~/lib/uuid';

const STORAGE_KEY = 'store_visitor_id';
const BATCH_KEY = 'store_analytics_batch';
const FLUSH_DELAY_MS = 1000;

export function useTrackVisit(storeId: number | undefined | null) {
  const location = useLocation();

  useEffect(() => {
    if (!storeId) return;

    // 1. Get or create visitor ID
    let visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem(STORAGE_KEY, visitorId);
    }

    // 2. Prepare payload
    const payload = {
      type: 'visit' as const,
      storeId,
      path: location.pathname,
      visitorId,
      ts: Date.now(),
    };

    // 3. Queue payload for batch send
    const queued = localStorage.getItem(BATCH_KEY);
    const batch = queued ? (JSON.parse(queued) as typeof payload[]) : [];
    batch.push(payload);
    localStorage.setItem(BATCH_KEY, JSON.stringify(batch));

    // 4. Debounced batch flush
    const timeout = window.setTimeout(() => {
      const queuedBatch = localStorage.getItem(BATCH_KEY);
      if (!queuedBatch) return;

      localStorage.removeItem(BATCH_KEY);

      fetch('/api/track-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: JSON.parse(queuedBatch) }),
        keepalive: true,
      }).catch((err) => {
        // Restore batch on failure
        localStorage.setItem(BATCH_KEY, queuedBatch);
        console.error('[Analytics] Failed to track visit:', err);
      });
    }, FLUSH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [storeId, location.pathname]);
}
