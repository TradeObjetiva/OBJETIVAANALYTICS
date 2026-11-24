/**
 * Efeito de Neve Natalina Leve e de Alta Performance
 * Desenvolvido especialmente para o Objetiva Analytics
 */
(function initXmasSnow() {
    let canvas = document.getElementById('xmas-snow-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'xmas-snow-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId = null;
    let isSnowing = localStorage.getItem('xmas-snow-enabled') !== 'false';

    // Lista de flocos
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

    function draw() {
        if (!isSnowing) return;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            f.step += f.stepSize;
            f.y += f.speedY;
            f.x += Math.sin(f.step) * 0.7 + f.speedX;

            // Reinicia floco ao sair da tela
            if (f.y > height + 5) {
                f.y = -5;
                f.x = Math.random() * width;
            }
            if (f.x > width + 5) f.x = -5;
            if (f.x < -5) f.x = width + 5;

            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
            ctx.fill();
        }

        if (!document.hidden) {
            animationFrameId = requestAnimationFrame(draw);
        }
    }

    function startSnow() {
        if (!animationFrameId && isSnowing) {
            animationFrameId = requestAnimationFrame(draw);
        }
    }

    function stopSnow() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        ctx.clearRect(0, 0, width, height);
    }

    // Economia de energia quando aba estiver oculta
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else if (isSnowing) {
            startSnow();
        }
    });

    // Função pública de alternar neve
    window.toggleXmasSnow = function() {
        isSnowing = !isSnowing;
        localStorage.setItem('xmas-snow-enabled', isSnowing ? 'true' : 'false');
        canvas.classList.toggle('hidden', !isSnowing);

        const btn = document.getElementById('xmas-toggle');
        if (btn) {
            btn.classList.toggle('snow-off', !isSnowing);
            btn.title = isSnowing ? 'Pausar Neve de Natal ❄️' : 'Ativar Neve de Natal 🎄';
            btn.innerHTML = isSnowing ? '❄️' : '🎄';
        }

        if (isSnowing) {
            startSnow();
        } else {
            stopSnow();
        }
    };

    // Inicializa se estiver ativo
    if (isSnowing) {
        startSnow();
    } else {
        canvas.classList.add('hidden');
    }
})();
