import { useEffect, useState } from 'react';

const DISMISS_KEY = 'store_push_prompt_dismissed';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function StorePushPrompt({ storeName }: { storeName: string }) {
  const [visible, setVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  };

  const handleEnable = async () => {
    try {
      setIsSubscribing(true);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setIsSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const keyResponse = await fetch('/api/push/key');
      const keyJson = await keyResponse.json() as { publicKey?: string };
      const publicKey = keyJson.publicKey;

      if (!publicKey) {
        setIsSubscribing(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      handleDismiss();
    } catch (error) {
      console.error('Push subscribe error', error);
      setIsSubscribing(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-3 justify-between mb-4">
      <div>
        <p className="font-medium">Get updates from {storeName}</p>
        <p className="text-sm text-emerald-700">Enable notifications for order updates and offers.</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 text-sm text-emerald-700 hover:text-emerald-900"
        >
          Not now
        </button>
        <button
          type="button"
          disabled={isSubscribing}
          onClick={handleEnable}
          className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubscribing ? 'Enabling...' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
