/**
 * @file sw.js
 * @description 完全オフラインSPAを実現するための Service Worker。
 * ナビゲーション（HTML）はNetwork-Firstで最新を取得し、電波不通時のみキャッシュを利用。
 * アプリの全静的アセットを管理し、オフライン環境下での動作と最新バージョンの確実な適用を両立します。
 */

/** キャッシュストレージのバージョン識別名（ビルド時に一意なタイムスタンプに置換） */
const CACHE_NAME = 'roguelabyrinth-v__BUILD_TIMESTAMP__';

/** 初回インストール時に事前キャッシュする基本アセット */
const PRECACHE_ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/**
 * Service Worker インストールイベント。
 * 静的マニフェスト・アイコンをキャッシュし、即時アクティベートを要求します。
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

/**
 * Service Worker アクティベートイベント。
 * 過去バージョンの全キャッシュを完全に削除し、新バージョンでクライアント制御を開始します。
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/**
 * クライアントからのメッセージイベント。
 * 即時更新要求（SKIP_WAITING）を受け取った場合に即時アクティベートします。
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * フェッチインターセプトイベント。
 * - ナビゲーション（index.html等）: Network-First（オンライン時は常に最新を取得、オフライン時はキャッシュ）
 * - 静的アセット: Cache-First（キャッシュにあれば即時返却、無ければネットワーク取得してキャッシュ保存）
 */
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const isNavigate = event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isNavigate) {
    // ナビゲーション（HTMLドキュメント）: 常にNetwork-First
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // オフライン時のフォールバック
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }

  // 静的アセット（JS, CSS, 画像等）: Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((err) => {
          console.warn('[SW] Fetch failed for:', event.request.url);
          throw err;
        });
    })
  );
});
