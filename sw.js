const CACHE_NAME = 'objetiva-analytics-v1.0.1';
const ASSETS = [
    './',
    './index.html',
    './src/css/style.css',
    './src/js/script.js',
    './manifest.json',
    './public/subsystems/sistema-assiduidade/index.html'
];

// Instalação: Cacheia os arquivos essenciais
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força a atualização imediata
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Limpando Cache Antigo');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia Network First: Tenta internet, se falhar, usa cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a rede estiver ok, atualiza o cache e retorna
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request)) // Se falhar (offline), usa o que tem salvo
    );
});
