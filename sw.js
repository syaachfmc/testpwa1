const CACHE_NAME = 'pwa-cache-v3';

self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 1. Coba minta data dari internet terlebih dahulu
    fetch(event.request)
      .then((networkResponse) => {
        // Cek jika balasan dari internet valid
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          // 2. Simpan/perbarui salinan terbaru di cache untuk cadangan offline
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        // Kirim balasan segar dari internet ke browser
        return networkResponse;
      })
      .catch(() => {
        // 3. Jika koneksi INTERNET GAGAL (offline), ambil cadangan dari cache
        return caches.match(event.request);
      })
  );
});