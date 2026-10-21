// Pointer-driven effects for desktop: profile parallax, the fly-out social menu, click
// particles and the card lighting. Everything here is skipped on touch devices, where
// there is no hover, and when the user prefers reduced motion.
(function () {
  'use strict';

  const device = window.portfolioDevice || {};
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (device.reducedMotion) return;

  // ---- Profile picture parallax ---------------------------------------------
  const wrapper = document.querySelector('.parallax-wrapper');
  const backgroundImg = wrapper?.querySelector('.background-img');
  const foregroundImg = wrapper?.querySelector('.foreground-img');

  if (hoverCapable && wrapper && backgroundImg && foregroundImg) {
    let pending = null;
    wrapper.addEventListener('pointermove', (event) => {
      pending = event;
      if (pending.scheduled) return;
      pending.scheduled = true;
      window.requestAnimationFrame(() => {
        const rect = wrapper.getBoundingClientRect();
        const moveX = ((pending.clientX - rect.left - rect.width / 2) / rect.width) * 60;
        const moveY = ((pending.clientY - rect.top - rect.height / 2) / rect.height) * 20;
        backgroundImg.style.transform = `scale(1.1) translate(${-moveX * 0.5}px, ${-moveY * 0.5}px)`;
        foregroundImg.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        pending = null;
      });
    }, { passive: true });

    wrapper.addEventListener('pointerleave', () => {
      backgroundImg.style.transform = 'scale(1.1) translate(0, 0)';
      foregroundImg.style.transform = 'translate(0, 0)';
    });
  }

  // ---- Fly-out social menu ---------------------------------------------------
  const links = [
    { img: '/images/github.webp', url: 'https://github.com/Saupernova13', label: 'GitHub' },
    { img: '/images/linkedin.webp', url: 'https://www.linkedin.com/in/sauraavjayrajh/', label: 'LinkedIn' },
    { img: '/images/email.webp', url: 'mailto:sauraavjayrajh@gmail.com', label: 'Email' },
    { img: '/images/stardust.webp', url: 'https://stardustsoftware.carrd.co/', label: 'Stardust Software' },
    { img: '/images/cv.webp', url: 'https://drive.google.com/file/d/1duN5lgNshz1Bo1516R6vCmaBTVu5IonO/view?usp=sharing', label: 'CV' },
  ];
  let activeCircles = [];

  function closeCircles() {
    if (!activeCircles.length) return;
    const closing = activeCircles;
    activeCircles = [];
    closing.forEach((circle) => {
      circle.style.left = `${circle.dataset.initialX}px`;
      circle.style.top = `${circle.dataset.initialY}px`;
      circle.style.opacity = '0';
    });
    window.setTimeout(() => closing.forEach((circle) => circle.remove()), 300);
  }

  function openCircles() {
    const rect = backgroundImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const circleSize = Math.max(50, 100 - links.length * 8);
    const totalAngle = Math.min(120, links.length * 30);
    const angleStep = totalAngle / (links.length - 1 || 1);

    links.forEach((link, index) => {
      const angle = ((-totalAngle / 2 + index * angleStep) * Math.PI) / 180;
      const initialX = centerX + radius - circleSize / 2;
      const initialY = centerY - circleSize / 2;
      const finalX = centerX + Math.cos(angle) * (radius + 100) - circleSize / 2;
      const finalY = centerY + Math.sin(angle) * (radius + 100) - circleSize / 2;

      const circle = document.createElement('a');
      circle.href = link.url;
      circle.target = '_blank';
      circle.rel = 'noopener noreferrer';
      circle.className = 'flying-circle';
      circle.setAttribute('aria-label', link.label);
      circle.style.position = 'fixed';
      circle.style.width = `${circleSize}px`;
      circle.style.height = `${circleSize}px`;
      circle.style.left = `${initialX}px`;
      circle.style.top = `${initialY}px`;
      circle.style.opacity = '0';
      circle.dataset.initialX = String(initialX);
      circle.dataset.initialY = String(initialY);

      const img = document.createElement('img');
      img.src = link.img;
      img.alt = '';
      img.width = circleSize;
      img.height = circleSize;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.padding = '8px';
      circle.appendChild(img);

      document.body.appendChild(circle);
      activeCircles.push(circle);

      window.requestAnimationFrame(() => {
        circle.style.left = `${finalX}px`;
        circle.style.top = `${finalY}px`;
        circle.style.opacity = '1';
      });
    });
  }

  if (hoverCapable && backgroundImg) {
    backgroundImg.addEventListener('click', () => {
      if (activeCircles.length) closeCircles();
      else openCircles();
    });

    document.addEventListener('pointerdown', (event) => {
      if (!event.target.closest('.flying-circle, .background-img')) closeCircles();
    });
    document.addEventListener('scroll', closeCircles, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeCircles();
    });
  }

  // ---- Click particles (canvas created on first use, loop runs only while alive) ----
  let particleCanvas = null;
  let particleCtx = null;
  let particles = [];
  let particleFrame = 0;

  function ensureParticleCanvas() {
    if (particleCanvas) return;
    particleCanvas = document.createElement('canvas');
    particleCanvas.setAttribute('aria-hidden', 'true');
    particleCanvas.style.position = 'fixed';
    particleCanvas.style.inset = '0';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '9998';
    document.body.appendChild(particleCanvas);
    particleCtx = particleCanvas.getContext('2d');
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas, { passive: true });
  }

  function resizeParticleCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.round(window.innerWidth * dpr);
    particleCanvas.height = Math.round(window.innerHeight * dpr);
    particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function animateParticles() {
    particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      particleCtx.globalAlpha = p.life;
      particleCtx.fillStyle = p.color;
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
    particleFrame = particles.length ? window.requestAnimationFrame(animateParticles) : 0;
  }

  function explode(x, y) {
    if (device.lowEnd) return;
    ensureParticleCanvas();
    for (let i = 0; i < 30; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: Math.random() < 0.5 ? '#46c8ff' : '#ff9900',
        size: Math.random() * 3 + 1,
      });
    }
    if (!particleFrame) particleFrame = window.requestAnimationFrame(animateParticles);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.cyber-button')) explode(event.clientX, event.clientY);
  });

  // ---- Card lighting: one delegated, frame-throttled handler --------------------
  if (hoverCapable && !device.lowEnd) {
    let lightTarget = null;
    let lightEvent = null;
    let lightScheduled = false;

    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest('.card-lit');
      if (!card) return;
      lightTarget = card;
      lightEvent = event;
      if (lightScheduled) return;
      lightScheduled = true;
      window.requestAnimationFrame(() => {
        lightScheduled = false;
        const rect = lightTarget.getBoundingClientRect();
        lightTarget.style.setProperty('--mx', `${((lightEvent.clientX - rect.left) / rect.width) * 100}%`);
        lightTarget.style.setProperty('--my', `${((lightEvent.clientY - rect.top) / rect.height) * 100}%`);
      });
    }, { passive: true });
  }
})();
