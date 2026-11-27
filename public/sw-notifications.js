// Notification & Reminder Handler imported by Workbox Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_DEVICE_NOTIFICATION') {
    const { title, options } = event.data;
    if (self.registration && self.registration.showNotification) {
      event.waitUntil(
        self.registration
          .showNotification(title, {
            icon: '/favicon-192x192.png',
            badge: '/favicon.png',
            tag: 'aura-daily-study-target',
            renotify: true,
            requireInteraction: true,
            silent: false,
            vibrate: [60],
            actions: [
              { action: 'mark_done', title: '✅ Mark Done' },
              { action: 'open-targets', title: "🎯 View Today's Target" },
            ],
            ...options,
          })
          .catch((err) => {
            console.error('SW showNotification error:', err);
          })
      );
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  event.notification.close();

  if (action === 'dismiss') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'AURA_NOTIFICATION_CLICKED',
            action: action || 'open-targets',
            timestamp: Date.now(),
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/?action=' + encodeURIComponent(action || 'open-targets'));
      }
    })
  );
});
