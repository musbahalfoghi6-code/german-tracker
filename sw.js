/* ============================================================================
   Service Worker — خطة تعلم الألمانية
   المهام:
   1) تخزين الملفات الأساسية مؤقتًا (Cache) للسماح بفتح التطبيق دون اتصال
   2) استقبال طلبات عرض الإشعارات القادمة من الصفحة (showNotification)
   ملاحظة: هذا الملف لا يشغّل مؤقتًا في الخلفية بمفرده لإرسال إشعارات مجدولة
   حقيقية أثناء إغلاق المتصفح؛ ذلك يتطلب خادم Push خارجي وهو خارج نطاق هذا المشروع.
   ============================================================================ */

const CACHE_NAME = "de-learning-cache-v1";
const CORE_ASSETS = [
  "./German-Learning-Tracker.html",
  "./manifest.json",
  "./icon.svg"
];

// عند التثبيت: تخزين الملفات الأساسية في الكاش
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// عند التفعيل: حذف أي نسخ كاش قديمة
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// عند الطلب: محاولة الشبكة أولًا، والرجوع للكاش عند عدم توفر الاتصال
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// عند الضغط على إشعار: التركيز على نافذة التطبيق المفتوحة أو فتح واحدة جديدة
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes("German-Learning-Tracker.html"));
      if (existing) return existing.focus();
      return self.clients.openWindow("./German-Learning-Tracker.html");
    })
  );
});
