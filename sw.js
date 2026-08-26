const CACHE = "momo-v6"; // 更新版本号以触发新安装
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
  // 预缓存文件，但个别文件失败不阻止安装（否则 SW 无法更新）
  e.waitUntil(
    caches.open(CACHE).then(c => 
      Promise.allSettled(PRECACHE.map(url => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// 网络优先策略：所有请求都先从网络获取，失败时回退到缓存
// 这样每次打开 app 都能拿到最新版本，同时支持离线访问
self.addEventListener("fetch", e => {
  const url = e.request.url;
  
  // sw.js 不缓存，直接用网络（确保浏览器能检查到更新）
  if (url.endsWith("sw.js")) {
    e.respondWith(fetch(e.request));
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功获取 → 更新缓存（仅缓存同源的基本请求）
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});