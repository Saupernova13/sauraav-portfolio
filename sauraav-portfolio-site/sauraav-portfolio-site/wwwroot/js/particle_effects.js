// Click burst particles for .cyber-button elements.
// The canvas is created on first use and the animation loop stops when no
// particles are alive, so idle pages do no per-frame work.
(() => {
    'use strict';

    const PARTICLES_PER_BURST = 30;
    const COLORS = ['#46c8ff', '#ff9900'];
    const FADE_PER_FRAME = 0.02;

    let canvas = null;
    let ctx = null;
    let particles = [];
    let rafId = null;

    function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9998';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let alive = 0;
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= FADE_PER_FRAME;
            if (p.life <= 0) continue;

            particles[alive++] = p;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        particles.length = alive;
        ctx.globalAlpha = 1;

        if (alive > 0) {
            rafId = requestAnimationFrame(frame);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            rafId = null;
        }
    }

    function burst(x, y) {
        ensureCanvas();
        for (let i = 0; i < PARTICLES_PER_BURST; i++) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: COLORS[Math.random() < 0.5 ? 0 : 1],
                size: Math.random() * 3 + 1,
            });
        }
        if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('click', (e) => {
        if (e.target.closest('.cyber-button')) burst(e.clientX, e.clientY);
    });
})();
