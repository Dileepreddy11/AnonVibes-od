// Push Notification Manager - Handles browser notifications and permissions

// Track notification timestamps to prevent spam
const notificationTimestamps: Map<string, number> = new Map();
const NOTIFICATION_THROTTLE_MS = 2000; // Minimum 2 seconds between notifications of same type

export interface PushNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
}

/**
 * Check if browser supports notifications
 */
export function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if enough time has passed since last notification of this type (anti-spam)
 */
function shouldThrottleNotification(tag: string): boolean {
  const lastTime = notificationTimestamps.get(tag) || 0;
  const now = Date.now();
  
  if (now - lastTime < NOTIFICATION_THROTTLE_MS) {
    console.log(`[v0] Throttling notification ${tag} - shown ${now - lastTime}ms ago`);
    return true;
  }
  
  notificationTimestamps.set(tag, now);
  return false;
}

/**
 * Check if service workers are supported
 */
export function supportsServiceWorker(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!supportsNotifications()) return null;
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!supportsNotifications()) {
    console.warn('Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Show a notification using the Notification API
 * Implements anti-spam throttling to prevent Chrome from blocking notifications
 */
export async function showNotification(options: PushNotificationOptions): Promise<void> {
  if (!supportsNotifications()) {
    console.warn('[v0] Notifications not supported');
    return;
  }

  const permission = getNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('[v0] Notification permission not granted');
    return;
  }

  // Use tag to throttle same type of notifications
  const notificationTag = options.tag || 'notification';
  
  // Check throttling to prevent spam detection
  if (shouldThrottleNotification(notificationTag)) {
    return;
  }

  try {
    const notificationOptions = {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: notificationTag, // Use for replacing duplicate notifications
      requireInteraction: false,
      silent: false,
    };

    // If service worker is available, show notification through it
    if (supportsServiceWorker() && navigator.serviceWorker.controller) {
      console.log(`[v0] Sending notification via service worker: ${options.title}`);
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: options.title,
          ...notificationOptions,
        },
      });
    } else {
      // Fallback: Show notification directly
      console.log(`[v0] Showing notification directly: ${options.title}`);
      new Notification(options.title, notificationOptions);
    }
  } catch (error) {
    console.error('[v0] Error showing notification:', error);
  }
}

/**
 * Register service worker for background notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!supportsServiceWorker()) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('Error registering Service Worker:', error);
    return null;
  }
}

/**
 * Save notification preference to localStorage
 */
export function saveNotificationPreference(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('anonvibes_notifications_enabled', JSON.stringify(enabled));
  }
}

/**
 * Get notification preference from localStorage
 */
export function getNotificationPreference(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('anonvibes_notifications_enabled');
    return stored ? JSON.parse(stored) : false;
  }
  return false;
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    post: '📝',
    comment: '💬',
    reaction: '❤️',
    like: '👍',
    mention: '@️',
  };
  return icons[type] || '💭';
}
