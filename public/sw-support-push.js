/* Service worker for support chat push notifications. Register from /admin/support. */
self.addEventListener("push", function (event) {
  if (!event.data) return;
  let data = { title: "새 지원 채팅", body: "", url: "/admin/support", threadId: null };
  try {
    const j = event.data.json();
    if (j.title) data.title = j.title;
    if (j.body) data.body = j.body;
    if (j.url) data.url = j.url;
    if (j.threadId) data.threadId = j.threadId;
  } catch (_) {
    data.body = event.data.text() || "";
  }
  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "support-" + (data.threadId || Date.now()),
    requireInteraction: false,
    data: { url: data.url, threadId: data.threadId },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/support";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (const c of list) {
        if (c.url.includes("/admin/support") && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
