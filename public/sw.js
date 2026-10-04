/**
 * @file sw.js
 * @description 完全オフラインSPAを実現するための Service Worker。
 * アプリの全静的アセット（HTML, CSS, JS, アイコン）をキャッシュし、
 * 電波の届かないオフライン環境下でも即座にゲームが起動・動作することを保証します。
 */

const CACHE_NAME = 'roguelabyrinth-v1';

/** 初回インストール時に事前キャッシュする基本アセット */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/**
 * Service Worker インストールイベント。
 * 基本アセットを一括キャッシュし、即時アクティベートを要求します。
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
 * 古いバージョンのキャッシュをパージし、クライアントの制御を開始します。
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
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
 * フェッチインターセプトイベント。
 * Cache-First（キャッシュ優先）戦略により、オフライン時でも高速起動・完全動作を提供します。
 */
self.addEventListener('fetch', (event) => {
  // HTTP/HTTPSリクエストのみ処理
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // キャッシュにない場合はネットワークから取得し、成功時にキャッシュへ追加
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
        .catch(() => {
          // オフラインかつキャッシュ見つからない場合は、index.html をフォールバック返却
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
