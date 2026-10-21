// Animated starfield on a single canvas.
//
// Replaces 200 absolutely-positioned DOM nodes that were each re-transformed every frame.
// The star count and frame rate scale with the device, the loop pauses when the tab is hidden,
// and users who prefer reduced motion get a static field.
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  // ---- Device tier -----------------------------------------------------------
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const connection = navigator.connection || {};
  const lowEnd =
    (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) ||
    connection.saveData === true ||
    /(^|-)2g$/.test(connection.effectiveType || '');

  if (lowEnd) root.classList.add('lite');
  window.portfolioDevice = { reducedMotion, coarsePointer, lowEnd };

  // ---- Canvas setup ----------------------------------------------------------
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const options = {
    starCount: lowEnd ? 60 : coarsePointer ? 90 : 160,
    fps: lowEnd ? 24 : 60,
    baseSpeed: 0.6,
    mouseRadius: 150,
    mouseStrength: 0.1,
    background: '#121212',
  };

  const dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5);
  let width = 0;
  let height = 0;
  let stars = [];
  let mouseX = -1e4;
  let mouseY = -1e4;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    draw();
  }

  function seed() {
    stars = Array.from({ length: options.starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * options.baseSpeed,
      vy: (Math.random() - 0.5) * options.baseSpeed,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.3,
    }));
  }

  function step() {
    const radius = options.mouseRadius;
    for (const star of stars) {
      star.x += star.vx;
      star.y += star.vy;

      if (star.x < 0) star.x = width;
      else if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      else if (star.y > height) star.y = 0;

      if (!coarsePointer) {
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius && distance > 0) {
          const force = ((radius - distance) * options.mouseStrength) / distance;
          star.x -= dx * force;
          star.y -= dy * force;
        }
      }
    }
  }

  function draw() {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    for (const star of stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
  }

  // ---- Animation loop --------------------------------------------------------
  const frameInterval = 1000 / options.fps;
  let lastTime = 0;
  let running = false;
  let frameId = 0;

  function tick(now) {
    if (!running) return;
    frameId = window.requestAnimationFrame(tick);
    if (now - lastTime < frameInterval) return;
    lastTime = now;
    step();
    draw();
  }

  function start() {
    if (running || reducedMotion) return;
    running = true;
    lastTime = 0;
    frameId = window.requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(frameId);
  }

  // ---- Events ----------------------------------------------------------------
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  }, { passive: true });

  if (!coarsePointer) {
    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      mouseX = -1e4;
      mouseY = -1e4;
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();
