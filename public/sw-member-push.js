/* Web push for signed-in members (register from /account). */
self.addEventListener("push", function (event) {
  if (!event.data) return;
  let data = { title: "알림", body: "", url: "/account#alerts" };
  try {
    const j = event.data.json();
    if (j.title) data.title = j.title;
    if (j.body) data.body = j.body;
    if (j.url) data.url = j.url;
  } catch (_) {
    data.body = event.data.text() || "";
  }
  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "member-broadcast-" + Date.now(),
    requireInteraction: false,
    data: { url: data.url },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/account#alerts";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (const c of list) {
        if (c.url.includes("/account") && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
