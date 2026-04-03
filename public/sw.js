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

// Handle push notifications (for future Web Push API integration)
self.addEventListener('push', (event) => {
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'AnonVibes notification',
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: data.tag || 'notification',
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

    event.waitUntil(
      self.registration.showNotification(data.title || 'AnonVibes', options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if AnonVibes is already open
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
