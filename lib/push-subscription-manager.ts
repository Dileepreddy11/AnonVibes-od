/**
 * Push Subscription Manager
 * 
 * Handles Web Push API subscriptions to enable notifications
 * even when the app is closed. This is how Instagram-like notifications work.
 * 
 * Flow:
 * 1. User enables notifications in the app
 * 2. Browser requests push permission
 * 3. Service Worker gets a push subscription
 * 4. Subscription is stored on backend
 * 5. Backend sends push notifications via Web Push API
 * 6. Service Worker receives push event and displays notification
 */

// Check if browser supports Web Push API
export function supportsPushNotifications(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Check if service worker is registered
export async function isServiceWorkerReady(): Promise<boolean> {
  if (!supportsPushNotifications()) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return !!registration;
  } catch {
    return false;
  }
}

/**
 * Subscribe user to push notifications
 * This creates a push subscription and stores it on the backend
 */
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!supportsPushNotifications()) {
    console.warn('[v0] Push notifications not supported');
    return false;
  }

  try {
    console.log('[v0] Starting push subscription for user:', userId);

    // Get the service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('[v0] No existing subscription, creating new one');
      
      // Note: In production, you would get VAPID public key from your server
      // For now, we create a subscription for demonstration
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // In production: applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    // Send subscription to backend for storage
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store subscription on backend');
    }

    console.log('[v0] Successfully stored push subscription');
    return true;
  } catch (error) {
    console.error('[v0] Error subscribing to push notifications:', error);
    return false;
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  if (!supportsPushNotifications()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe locally
      await subscription.unsubscribe();
      console.log('[v0] Unsubscribed from push locally');
    }

    // Notify backend to disable subscription
    const response = await fetch('/api/notifications/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      console.warn('[v0] Failed to disable subscription on backend');
    }

    return true;
  } catch (error) {
    console.error('[v0] Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Check if user is already subscribed to push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!supportsPushNotifications()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

/**
 * Get current push subscription details (for debugging)
 */
export async function getPushSubscriptionDetails() {
  if (!supportsPushNotifications()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return {
        endpoint: subscription.endpoint,
        keys: subscription.getKey ? {
          auth: subscription.getKey('auth'),
          p256dh: subscription.getKey('p256dh'),
        } : null,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[v0] Error getting push subscription details:', error);
    return null;
  }
}
