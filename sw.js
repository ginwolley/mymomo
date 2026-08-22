const CACHE = "momo-v5"; // 更新版本号以触发新安装
const PRECACHE = [
  "工作台.html",
  "css/style.css",
  "js/core.js",
  "js/sync.js",
  "js/fitness.js",
  "js/overview.js",
  "js/salary.js",
  "js/settings.js",
  "js/stock.js",
  "js/passwords.js",
  "js/app.js",
  "manifest.json",
  "icon.jpg",
  "icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // sw.js 不缓存，确保浏览器始终获取最新版本进行更新
  if (e.request.url.endsWith("sw.js")) {
    e.respondWith(fetch(e.request));
    return;
  }
  // 主页面走网络优先，确保始终加载最新版本
  if (e.request.mode === "navigate" || e.request.url.endsWith("工作台.html")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});