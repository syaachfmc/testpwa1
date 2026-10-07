/* =========================================================
   SERVICE WORKER VERSION
========================================================= */

/*
 * Setiap kali aplikasi di-update,
 * naikkan versi ini.
 *
 * v3 → v4
 * v4 → v5
 * v5 → v6
 */

const CACHE_NAME = 'pwa-cache-v1.5';


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    'install',
    (event) => {

        console.log(
            'Service Worker INSTALL:',
            CACHE_NAME
        );

        /*
         * Jangan menunggu SW lama selesai.
         */
        self.skipWaiting();

    }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    'activate',
    (event) => {

        console.log(
            'Service Worker ACTIVATE:',
            CACHE_NAME
        );

        event.waitUntil(

            caches.keys()
                .then((cacheNames) => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                (cacheName) =>
                                    cacheName !== CACHE_NAME
                            )
                            .map(
                                (cacheName) => {

                                    console.log(
                                        'Hapus cache lama:',
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }
                            )

                    );

                })

        );

        /*
         * Service Worker baru langsung
         * mengambil kontrol halaman.
         */
        self.clients.claim();

    }
);


/* =========================================================
   MESSAGE
========================================================= */

self.addEventListener(
    'message',
    (event) => {

        if (
            event.data &&
            event.data.action === 'skipWaiting'
        ) {

            console.log(
                'Menerima perintah skipWaiting.'
            );

            self.skipWaiting();

        }

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    'fetch',
    (event) => {

        event.respondWith(

            /*
             * NETWORK FIRST
             *
             * Prioritas:
             * 1. Internet
             * 2. Cache jika offline
             */

            fetch(event.request)

                .then((networkResponse) => {

                    /*
                     * Pastikan response valid.
                     */
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        (
                            networkResponse.type === 'basic' ||
                            networkResponse.type === 'cors'
                        )
                    ) {

                        /*
                         * Clone response karena
                         * response hanya dapat dibaca sekali.
                         */
                        const responseToCache =
                            networkResponse.clone();


                        /*
                         * Simpan versi terbaru.
                         */
                        caches.open(CACHE_NAME)
                            .then((cache) => {

                                cache.put(
                                    event.request,
                                    responseToCache
                                );

                            });

                    }


                    /*
                     * Kirim response terbaru
                     * ke browser.
                     */
                    return networkResponse;

                })


                /*
                 * Jika internet gagal,
                 * ambil dari cache.
                 */
                .catch(() => {

                    console.log(
                        'Offline:',
                        event.request.url
                    );

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);