import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, Check } from 'lucide-react';
import { useFetcher } from '@remix-run/react';

export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetcher = useFetcher();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) setIsSubscribed(true);
    } catch (e) {
      console.error('Failed to check subscription:', e);
    }
  }

  async function subscribe() {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        // Verify VAPID Key
        const vapidKey = (window as any).ENV?.VAPID_PUBLIC_KEY;
        if (!vapidKey) {
           console.error('[Notification] VAPID Key missing in window.ENV');
           return;
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        // Send to API
        // Note: Using fetch directly or fetcher with json encoding manually for complex objects
        fetcher.submit(
            { subscription: sub.toJSON() } as any, 
            { method: 'POST', action: '/api/subscribe', encType: 'application/json' }
        );
        
        setIsSubscribed(true);
      }
    } catch (e) {
      console.error('Subscription failed', e);
    } finally {
      setLoading(false);
    }
  }
  
  // Helper to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  if (permission === 'denied') {
     return (
        <button disabled className="p-2 text-red-500/50 cursor-not-allowed" title="Notifications Blocked">
            <BellOff className="w-5 h-5" />
        </button>
     );
  }

  if (isSubscribed) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-medium">
            <Check className="w-3 h-3" />
            <span>Active</span>
        </div>
      );
  }

  return (
    <button 
      onClick={subscribe}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 transition text-xs font-medium"
      title="Enable Order Notifications"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
      <span>Enable Alerts</span>
    </button>
  );
}
