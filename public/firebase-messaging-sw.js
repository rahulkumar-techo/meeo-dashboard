// Firebase Messaging Background Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Read credentials dynamically from registration query parameters
const urlParams = new URLSearchParams(location.search);
const apiKey = urlParams.get("apiKey");
const projectId = urlParams.get("projectId");
const messagingSenderId = urlParams.get("messagingSenderId");
const appId = urlParams.get("appId");

if (apiKey && projectId) {
  try {
    firebase.initializeApp({
      apiKey,
      projectId,
      messagingSenderId,
      appId,
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "MEEO Admin Alert";

      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "You have received a new update.";

      const data = payload.data || {};
      const icon = payload.notification?.icon || payload.notification?.image || "/branding/logo.png";
      const badge = payload.notification?.badge || "/branding/logo.png";

      self.registration.showNotification(title, {
        body,
        icon,
        badge,
        data,
        vibrate: [100, 50, 100],
      });
    });
  } catch (e) {
    console.error("[firebase-messaging-sw] Init error:", e);
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    event.notification.data?.url ||
    event.notification.data?.click_action ||
    "/operations/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
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
