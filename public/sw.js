// Service Worker for handling push notifications and messages from the app
// This allows notifications to be displayed even when the app is closed

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const payload = event.data.payload;
    
    const options = {
      body: payload.body || 'AnonVibes notification',
      icon: payload.icon || '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: payload.tag || 'notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    self.registration.showNotification(payload.title || 'AnonVibes', options);
  }
});

// Handle push notifications from Web Push API
// This is how notifications work even when the app is closed
self.addEventListener('push', (event) => {
  try {
    // Parse the push event data
    let data = {};
    if (event.data) {
      try {
        data = event.data.json();
      } catch {
        // If not JSON, treat as plain text
        data = { body: event.data.text() };
      }
    }

    console.log('[SW] Push event received:', data);
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: data.tag || 'notification',
      requireInteraction: false,
      data: data.data || {}, // Store custom data for click handler
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'AnonVibes', options).catch((error) => {
        console.error('[SW] Error showing notification:', error);
      })
    );
  } catch (error) {
    console.error('[SW] Error handling push event:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Navigate to the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if AnonVibes is already open
      for (let client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    }).catch((error) => {
      console.error('[SW] Error handling notification click:', error);
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});
