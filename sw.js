const CACHE_NAME = 'objetiva-analytics-v1.1.0';
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
                        console.log('SW: Limpando Cache Antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia Network First: Tenta internet, se falhar, usa cache
// IMPORTANTE: Só cacheia GETs de assets estáticos, ignora POSTs e chamadas ao Supabase
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Não intercepta: métodos não-GET, chamadas ao Supabase, CDNs dinâmicas
    if (
        event.request.method !== 'GET' ||
        url.hostname.includes('supabase') ||
        url.hostname.includes('googleapis.com') ||
        url.pathname.startsWith('/rest/') ||
        url.pathname.startsWith('/auth/') ||
        url.pathname.startsWith('/realtime/')
    ) {
        return; // Deixa o browser fazer o fetch normalmente
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Só cacheia respostas válidas (status 200)
                if (response.ok) {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, resClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request)) // Se falhar (offline), usa o que tem salvo
    );
});
