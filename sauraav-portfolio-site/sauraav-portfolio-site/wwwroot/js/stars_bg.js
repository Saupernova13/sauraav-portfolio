// Drifting starfield background rendered on a single canvas.
// Stars wrap around the edges and are gently pushed away from the pointer.
(() => {
    'use strict';

    const STAR_DENSITY = 1 / 10000;   // stars per CSS pixel of viewport area
    const MAX_STARS = 250;
    const BASE_SPEED = 1;             // px per frame at 60fps
    const MOUSE_RADIUS = 150;
    const MOUSE_PUSH = 0.1;           // fraction of (radius - distance) applied per frame

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('myStarfield');
        if (!container) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        container.appendChild(canvas);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let stars = [];
        let width = 0;
        let height = 0;
        let mouseX = Number.NEGATIVE_INFINITY;
        let mouseY = Number.NEGATIVE_INFINITY;

        function createStar() {
            const speed = BASE_SPEED;
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
            };
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = container.offsetWidth;
            height = container.offsetHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(MAX_STARS, Math.round(width * height * STAR_DENSITY));
            stars = Array.from({ length: count }, createStar);

            if (reducedMotion.matches) draw();
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#fff';
            for (const star of stars) {
                ctx.globalAlpha = star.alpha;
                ctx.fillRect(star.x, star.y, star.size, star.size);
            }
            ctx.globalAlpha = 1;
        }

        function update() {
            for (const star of stars) {
                star.x += star.vx;
                star.y += star.vy;

                if (star.x < 0) star.x += width;
                else if (star.x > width) star.x -= width;
                if (star.y < 0) star.y += height;
                else if (star.y > height) star.y -= height;

                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                const dist = Math.hypot(dx, dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const push = (MOUSE_RADIUS - dist) * MOUSE_PUSH;
                    star.x -= (dx / dist) * push;
                    star.y -= (dy / dist) * push;
                }
            }
        }

        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        document.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }, { passive: true });

        window.addEventListener('resize', resize);

        resize();
        if (!reducedMotion.matches) requestAnimationFrame(loop);
    });
})();
