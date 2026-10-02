// Firebase Messaging Background Service Worker
importScripts(https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js);
importScripts(https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js);

try {
  const urlParams = new URLSearchParams(location.search);
  const apiKey = urlParams.get(apiKey) || AIzaSyDi1jB4q1u5mevwwTegRLDtJGJW_hv75lk;
  const projectId = urlParams.get(projectId) || meeo-1242a;
  const messagingSenderId = urlParams.get(messagingSenderId) || 405020230998;
  const appId = urlParams.get(appId) || 1:405020230998:web:12fc0b9ce97f2d1b1fc2f7;

  firebase.initializeApp({
    apiKey,
    projectId,
    messagingSenderId,
    appId,
  });

  const messaging = firebase.messaging();

  // Background Push Notification handler (when tab/browser is minimized)
  messaging.onBackgroundMessage((payload) => {
    const title =
      payload.notification?.title ||
      payload.data?.title ||
      MEEO Admin Alert;

    const body =
      payload.notification?.body ||
      payload.data?.body ||
      You have received a new update.;

    const data = payload.data || {};
    const icon = payload.notification?.icon || payload.notification?.image || /branding/logo.png;
    const badge = payload.notification?.badge || /branding/logo.png;

    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data,
      vibrate: [100, 50, 100],
    });
  });
} catch (e) {
  // Handled
}

self.addEventListener(push, (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title =
      payload.notification?.title ||
      payload.data?.title ||
      MEEO Admin Alert;

    const body =
      payload.notification?.body ||
      payload.data?.body ||
      You have received a new update.;

    const icon = payload.notification?.icon || payload.notification?.image || /branding/logo.png;
    const badge = payload.notification?.badge || /branding/logo.png;
    const data = payload.data || {};

    const options = {
      body,
      icon,
      badge,
      data,
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // handled by firebase compat
  }
});

self.addEventListener(notificationclick, (event) => {
  event.notification.close();
  const targetUrl =
    event.notification.data?.url ||
    event.notification.data?.click_action ||
    /operations/notifications;

  event.waitUntil(
    clients.matchAll({ type: window, includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && focus in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
