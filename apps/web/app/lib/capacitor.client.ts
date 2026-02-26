/**
 * Capacitor Mobile App Initialization
 * Only runs in native Android/iOS context — safe to import in web too.
 */

function isNativeApp(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.() === true
  );
}

export async function initCapacitor() {
  if (!isNativeApp()) return;

  console.log('[Capacitor] Native platform detected — initializing plugins...');

  try {
    // 1. Status Bar — make it transparent/styled
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // 2. Splash Screen — hide after app loads
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });

    // 3. Network — monitor connectivity
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    console.log('[Capacitor] Network status:', status.connected ? 'Online' : 'Offline');

    Network.addListener('networkStatusChange', (status) => {
      console.log('[Capacitor] Network changed:', status.connected ? 'Online' : 'Offline');
      // Dispatch custom event so React components can react
      window.dispatchEvent(
        new CustomEvent('capacitor:networkChange', { detail: status })
      );
    });

    // 4. App — handle back button & app state changes
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    App.addListener('appStateChange', ({ isActive }) => {
      console.log('[Capacitor] App state:', isActive ? 'Foreground' : 'Background');
    });

    // 5. Push Notifications — request permission
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const permResult = await PushNotifications.requestPermissions();

    if (permResult.receive === 'granted') {
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('[Capacitor] Push token:', token.value);
        // Send token to your backend
        fetch('/api/push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value }),
        }).catch(() => {
          // Silent fail — non-critical
        });
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Capacitor] Push received:', notification.title);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[Capacitor] Push tapped:', action.notification.title);
        // Navigate to relevant page based on notification data
        const data = action.notification.data;
        if (data?.url) {
          window.location.href = data.url;
        }
      });
    }

    console.log('[Capacitor] All plugins initialized ✅');
  } catch (error) {
    console.error('[Capacitor] Plugin initialization error:', error);
  }
}
