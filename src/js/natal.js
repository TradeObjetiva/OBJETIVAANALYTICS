/**
 * 🎄 Sistema de Natal Completo - Objetiva Analytics
 * 10 Funcionalidades Natalinas com Alta Performance
 *
 * Funcionalidades:
 *   BASE 1: Chuva de neve (canvas)
 *   BASE 2: Gorro de Papai Noel no logo
 *   BASE 3: Pisca-pisca natalino
 *   BASE 4: Badge "Boas Festas"
 *   BASE 5: Botão toggle neve
 *   IDEIA 1: Trenó do Papai Noel Easter Egg (clique no gorro)
 *   IDEIA 2: Contagem regressiva para o Natal
 *   IDEIA 3: Partículas douradas no cursor
 *   IDEIA 4: Som sutil de sinos ao trocar de aba
 *   IDEIA 5: Mensagem de Boas Festas na tela de login
 *   IDEIA 6: Velas decorativas nos separadores do menu
 *   IDEIA 7: Estrela de Natal giratória no topo da sidebar
 *   IDEIA 8: Tooltips natalinos nos itens do menu
 *   IDEIA 9: Guirlanda decorativa nos cards (CSS only)
 *   IDEIA 10: Árvore ASCII na tela sem dados
 */

(function initXmasComplete() {
    'use strict';

    // Feature flag sazonal: ativo em Novembro/Dezembro ou quando forçado via localStorage
    const currentMonth = new Date().getMonth(); // 10 = Novembro, 11 = Dezembro
    const forcedFlag = localStorage.getItem('xmas-force-enabled');
    const isXmasSeason = forcedFlag === 'true' || (forcedFlag !== 'false' && (currentMonth === 10 || currentMonth === 11));
    if (!isXmasSeason) {
        document.querySelectorAll('.xmas-lights, .santa-hat, .xmas-badge, #xmas-toggle').forEach((el) => {
            el.style.display = 'none';
        });
        return;
    }

    // ============ Estado global do Natal ============
    let isXmasActive = localStorage.getItem('xmas-snow-enabled') !== 'false';
    let animationFrameId = null;

    // ============================================
    //  BASE 1: CHUVA DE NEVE (CANVAS)
    // ============================================
    let canvas = document.getElementById('xmas-snow-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'xmas-snow-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const flakeCount = Math.min(50, Math.floor(window.innerWidth / 30));
    const flakes = [];

    function createFlake() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 0.8,
            density: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.55 + 0.25,
            speedY: Math.random() * 0.9 + 0.4,
            speedX: Math.random() * 0.6 - 0.3,
            step: 0,
            stepSize: Math.random() * 0.02 + 0.01,
        };
    }

    for (let i = 0; i < flakeCount; i++) {
        flakes.push(createFlake());
    }

    function onResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    function drawSnow() {
        if (!isXmasActive) return;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            f.step += f.stepSize;
            f.y += f.speedY;
            f.x += Math.sin(f.step) * 0.7 + f.speedX;

            if (f.y > height + 5) { f.y = -5; f.x = Math.random() * width; }
            if (f.x > width + 5) f.x = -5;
            if (f.x < -5) f.x = width + 5;

            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
            ctx.fill();
        }

        if (!document.hidden) {
            animationFrameId = requestAnimationFrame(drawSnow);
        }
    }

    function startSnow() {
        if (!animationFrameId && isXmasActive) {
            animationFrameId = requestAnimationFrame(drawSnow);
        }
    }

    function stopSnow() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        ctx.clearRect(0, 0, width, height);
    }

    // Economia de bateria
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else if (isXmasActive) {
            startSnow();
        }
    });

    // ============================================
    //  TOGGLE GLOBAL DE NATAL (neve + partículas + som)
    // ============================================
    window.toggleXmasSnow = function() {
        isXmasActive = !isXmasActive;
        localStorage.setItem('xmas-snow-enabled', isXmasActive ? 'true' : 'false');
        canvas.classList.toggle('hidden', !isXmasActive);

        const btn = document.getElementById('xmas-toggle');
        if (btn) {
            btn.classList.toggle('snow-off', !isXmasActive);
            btn.title = isXmasActive ? 'Pausar Efeitos de Natal ❄️' : 'Ativar Efeitos de Natal 🎄';
            btn.innerHTML = isXmasActive ? '❄️' : '🎄';
        }

        if (isXmasActive) {
            startSnow();
        } else {
            stopSnow();
        }
    };

    // Inicializa neve
    if (isXmasActive) {
        startSnow();
    } else {
        canvas.classList.add('hidden');
    }


    // ============================================
    //  IDEIA 1: TRENÓ DO PAPAI NOEL (Easter Egg)
    // ============================================
    function createSleighEasterEgg() {
        // Adiciona hitbox clicável sobre o gorro
        const logoIcon = document.querySelector('.sidebar-nav .logo-icon');
        if (!logoIcon) return;

        const hatButton = document.createElement('button');
        hatButton.className = 'santa-hat-clickable';
        hatButton.title = '🎅 Clique para uma surpresa!';
        hatButton.setAttribute('aria-label', 'Easter Egg de Natal');
        hatButton.addEventListener('click', launchSleigh);
        logoIcon.appendChild(hatButton);
    }

    let sleighCooldown = false;
    function launchSleigh() {
        if (sleighCooldown) return;
        sleighCooldown = true;

        let container = document.getElementById('xmas-sleigh-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'xmas-sleigh-container';
            document.body.appendChild(container);
        }

        const sleigh = document.createElement('div');
        sleigh.className = 'xmas-sleigh';
        sleigh.innerHTML = '🦌🦌🦌🛷🎅';
        container.appendChild(sleigh);

        // Remove após animação
        sleigh.addEventListener('animationend', () => {
            sleigh.remove();
            sleighCooldown = false;
        });

        // Fallback para remover
        setTimeout(() => {
            if (sleigh.parentNode) sleigh.remove();
            sleighCooldown = false;
        }, 7000);
    }


    // ============================================
    //  IDEIA 2: CONTAGEM REGRESSIVA PARA O NATAL
    // ============================================
    function createCountdownBanner() {
        const homeView = document.getElementById('react-home-root');
        if (!homeView) return;

        // Verifica se já foi fechado nesta sessão
        if (sessionStorage.getItem('xmas-countdown-closed') === 'true') return;

        function getRemaining() {
            const now = new Date();
            const year = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
            const xmasDate = new Date(year, 11, 25, 0, 0, 0); // 25 de dezembro
            const diffTime = Math.max(0, xmasDate - now);
            return {
                diffDays: Math.floor(diffTime / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diffTime / (1000 * 60 * 60)) % 24),
                mins: Math.floor((diffTime / (1000 * 60)) % 60),
                secs: Math.floor((diffTime / 1000) % 60),
            };
        }

        const initial = getRemaining();
        if (initial.diffDays > 60) return; // Só mostra se faltam menos de 60 dias

        const banner = document.createElement('div');
        banner.id = 'xmas-countdown-banner';

        const messages = [
            `Reta final para bater as metas de fechamento do ano!`,
            `Hora de dar aquele gás final no ano!`,
            `Equipe, bora fechar o ano com chave de ouro!`,
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        const headline = initial.diffDays === 0
            ? 'Feliz Natal! Hoje é o grande dia!'
            : 'Reta Final de Fim de Ano';

        banner.innerHTML = `
            <div class="xmas-countdown-left">
                <div class="xmas-countdown-icon">🎄</div>
                <div class="xmas-countdown-copy">
                    <div class="xmas-countdown-title" id="xmas-cd-title">${headline}</div>
                    <div class="xmas-countdown-sub">${msg}</div>
                </div>
            </div>
            <div class="xmas-countdown-right">
                <div class="xmas-countdown-pills">
                    <div class="xmas-pill highlight">
                        <span class="xmas-pill-val" id="xmas-cd-days">${String(initial.diffDays).padStart(2, '0')}</span>
                        <span class="xmas-pill-lbl" id="xmas-cd-days-lbl">${initial.diffDays === 1 ? 'DIA' : 'DIAS'}</span>
                    </div>
                    <div class="xmas-pill">
                        <span class="xmas-pill-val" id="xmas-cd-hours">${String(initial.hours).padStart(2, '0')}</span>
                        <span class="xmas-pill-lbl">HRS</span>
                    </div>
                    <div class="xmas-pill">
                        <span class="xmas-pill-val" id="xmas-cd-mins">${String(initial.mins).padStart(2, '0')}</span>
                        <span class="xmas-pill-lbl">MIN</span>
                    </div>
                    <div class="xmas-pill">
                        <span class="xmas-pill-val" id="xmas-cd-secs">${String(initial.secs).padStart(2, '0')}</span>
                        <span class="xmas-pill-lbl">SEG</span>
                    </div>
                </div>
                <button class="xmas-countdown-close" onclick="this.closest('#xmas-countdown-banner').remove(); sessionStorage.setItem('xmas-countdown-closed', 'true');" title="Dispensar aviso" aria-label="Fechar">✕</button>
            </div>
        `;

        // Insere antes do conteúdo do dashboard
        homeView.parentNode.insertBefore(banner, homeView);

        // Atualiza automaticamente a cada segundo conforme o relógio da máquina
        const timerId = setInterval(() => {
            if (!banner.isConnected) {
                clearInterval(timerId);
                return;
            }
            const t = getRemaining();
            const elDays = banner.querySelector('#xmas-cd-days');
            const elDaysLbl = banner.querySelector('#xmas-cd-days-lbl');
            const elHours = banner.querySelector('#xmas-cd-hours');
            const elMins = banner.querySelector('#xmas-cd-mins');
            const elSecs = banner.querySelector('#xmas-cd-secs');
            const elTitle = banner.querySelector('#xmas-cd-title');

            if (elDays) elDays.textContent = String(t.diffDays).padStart(2, '0');
            if (elDaysLbl) elDaysLbl.textContent = t.diffDays === 1 ? 'DIA' : 'DIAS';
            if (elHours) elHours.textContent = String(t.hours).padStart(2, '0');
            if (elMins) elMins.textContent = String(t.mins).padStart(2, '0');
            if (elSecs) elSecs.textContent = String(t.secs).padStart(2, '0');
            if (elTitle && t.diffDays === 0) {
                elTitle.textContent = 'Feliz Natal! Hoje é o grande dia!';
            }
        }, 1000);
    }


    // ============================================
    //  IDEIA 3: PARTÍCULAS DOURADAS NO CURSOR
    // ============================================
    let particleThrottle = 0;
    const particles = ['✨', '⭐', '✦', '·'];

    function handleCursorParticles(e) {
        if (!isXmasActive) return;

        const now = Date.now();
        if (now - particleThrottle < 60) return; // Max ~16 partículas/seg
        particleThrottle = now;

        const particle = document.createElement('span');
        particle.className = 'xmas-cursor-particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        particle.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
        particle.style.color = Math.random() > 0.5 ? '#fbbf24' : '#ffffff';
        document.body.appendChild(particle);

        particle.addEventListener('animationend', () => particle.remove());
        setTimeout(() => { if (particle.parentNode) particle.remove(); }, 1000);
    }

    document.addEventListener('mousemove', handleCursorParticles);


    // ============================================
    //  IDEIA 5: MENSAGEM DE BOAS FESTAS NA TELA DE LOGIN
    // ============================================
    function addLoginXmasMessage() {
        const loginHeader = document.querySelector('.login-card .login-header');
        if (!loginHeader) return;

        // Verifica se já existe
        if (loginHeader.querySelector('.xmas-login-message')) return;

        const msg = document.createElement('div');
        msg.className = 'xmas-login-message';
        msg.innerHTML = '🎄 Feliz Natal e um 2027 de muito sucesso! ⭐';
        loginHeader.appendChild(msg);
    }


    // ============================================
    //  IDEIA 6: VELAS DECORATIVAS NOS SEPARADORES DO MENU
    // ============================================
    function addCandlesToMenu() {
        const accordions = document.querySelectorAll('.sidebar-nav .nav-accordion');
        accordions.forEach(acc => {
            if (acc.querySelector('.xmas-candle')) return;

            const candle = document.createElement('div');
            candle.className = 'xmas-candle';
            candle.innerHTML = `
                <div class="xmas-candle-flame"></div>
                <div class="xmas-candle-body">
                    <div class="xmas-candle-glow"></div>
                </div>
            `;
            acc.appendChild(candle);
        });
    }


    // ============================================
    //  IDEIA 7: ESTRELA DE NATAL GIRATÓRIA NO TOPO
    // ============================================
    function addStarToSidebar() {
        const sidebarHeader = document.querySelector('.sidebar-nav .sidebar-header');
        if (!sidebarHeader || sidebarHeader.querySelector('.xmas-star')) return;

        const starGlow = document.createElement('div');
        starGlow.className = 'xmas-star-glow';
        sidebarHeader.appendChild(starGlow);

        const star = document.createElement('div');
        star.className = 'xmas-star';
        star.textContent = '⭐';
        sidebarHeader.appendChild(star);
    }


    // ============================================
    //  IDEIA 8: TOOLTIPS NATALINOS NOS ITENS DO MENU
    // ============================================
    const xmasTooltips = [
        "🎅 Que sua meta seja como a rena — sempre à frente!",
        "⭐ Fim de ano chegando, bora fechar com chave de ouro!",
        "🎁 Cada relatório bem feito é um presente para o time!",
        "🔔 O sucesso é a soma de pequenos esforços diários!",
        "🎄 Neste Natal, celebre cada conquista do ano!",
        "✨ Um novo ano vem aí cheio de oportunidades!",
        "🦌 Voe alto como as renas neste fim de ano!",
        "🌟 Sua dedicação faz toda a diferença!",
        "❄️ O melhor presente é ver os resultados do nosso trabalho!",
        "🎅 Ho ho ho! Hora de bater as metas finais!"
    ];

    function addXmasTooltips() {
        const menuItems = document.querySelectorAll('.sidebar-nav .tab-btn:not(.accordion-toggle):not(.sub-item), .sidebar-nav .accordion-toggle');
        menuItems.forEach(item => {
            if (item.querySelector('.xmas-tooltip')) return;

            const tooltip = document.createElement('span');
            tooltip.className = 'xmas-tooltip';
            tooltip.textContent = xmasTooltips[Math.floor(Math.random() * xmasTooltips.length)];
            item.style.position = 'relative';
            item.appendChild(tooltip);
        });
    }


    // ============================================
    //  IDEIA 10: ÁRVORE ASCII NA TELA "SEM DADOS"
    // ============================================
    window.getXmasNoDataHTML = function() {
        return `
            <div class="xmas-no-data">
                <span class="tree-star">⭐</span>
<span class="tree-line">        /  \\</span>
<span class="tree-line">       / <span class="ornament-red">🔴</span> \\</span>
<span class="tree-line">      /  <span class="ornament-gold">🟡</span>  \\</span>
<span class="tree-line">     / <span class="ornament-blue">🔵</span>  <span class="ornament-red">🔴</span> \\</span>
<span class="tree-line">    / <span class="ornament-gold">🟡</span>  <span class="ornament-blue">🔵</span>  \\</span>
<span class="tree-line">   /___________\\</span>
<span class="tree-trunk">        ||</span>
                <div class="tree-message">
                    🎁 Sem dados por aqui...<br>
                    Aproveite para curtir o Natal! 🎄
                </div>
            </div>
        `;
    };

    // Sobrescreve mensagens "Nenhum dado" existentes, quando disponíveis
    function decorateEmptyStates() {
        // Busca por elementos comuns de "sem dados" e substitui
        const emptyMessages = document.querySelectorAll('[data-empty-state], .empty-state-message');
        emptyMessages.forEach(el => {
            if (!el.classList.contains('xmas-decorated')) {
                el.innerHTML = window.getXmasNoDataHTML();
                el.classList.add('xmas-decorated');
            }
        });
    }


    // ============================================
    //  INICIALIZAÇÃO GERAL
    // ============================================
    function initAllXmasFeatures() {
        createSleighEasterEgg();
        createCountdownBanner();
        addLoginXmasMessage();
        addCandlesToMenu();
        addStarToSidebar();
        addXmasTooltips();
        decorateEmptyStates();
    }

    // Espera o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllXmasFeatures);
    } else {
        // DOM já carregou — pequeno delay para garantir que React montou
        setTimeout(initAllXmasFeatures, 500);
    }

    // Re-decora após navegação (caso React re-renderize)
    const observer = new MutationObserver(() => {
        decorateEmptyStates();
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
