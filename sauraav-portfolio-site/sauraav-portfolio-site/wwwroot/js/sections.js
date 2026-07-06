// Scroll-reveal, pointer-glow, and per-section behaviors for the portfolio page.
(() => {
    'use strict';

    // Groups revealed by adding .visible when scrolled into view. Stagger is a
    // per-element delay in ms; onReveal runs section-specific extras.
    const REVEAL_GROUPS = [
        { selector: '.section-title' },
        { selector: '.summary-content', onReveal: revealSummaryParagraphs },
        { selector: '.education-card', stagger: 100 },
        { selector: '.experience-item', stagger: 100, onReveal: pulseMarker },
        { selector: '.qualification-card', stagger: 100 },
        { selector: '.skill-card', onReveal: fillSkillBar },
        { selector: '.tech-icon-wrapper', stagger: 50 },
    ];

    // Elements that render a pointer-following radial glow into a child overlay.
    const GLOW_OVERLAYS =
        '.summary-hover-effect, .education-hover-effect, .experience-hover-effect, ' +
        '.qualification-hover-effect, .skill-hover-effect';

    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-scroll-target]');
        if (!button) return;
        document.getElementById(button.dataset.scrollTarget)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.addEventListener('DOMContentLoaded', () => {
        initReveal();
        initPointerGlow();
        initTechIconTracking();
        initTouchFeedback();
        initProjectPreview();
    });

    function initReveal() {
        for (const group of REVEAL_GROUPS) {
            const elements = [...document.querySelectorAll(group.selector)];
            if (elements.length === 0) continue;

            const observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    observer.unobserve(entry.target);
                    const delay = (group.stagger ?? 0) * elements.indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        group.onReveal?.(entry.target);
                    }, delay);
                }
            }, { threshold: 0.2, rootMargin: '50px' });

            for (const el of elements) observer.observe(el);
        }
    }

    function revealSummaryParagraphs(content) {
        for (const p of content.querySelectorAll('.summary-text p')) {
            p.classList.add('visible');
        }
    }

    function pulseMarker(item) {
        const dot = item.querySelector('.marker-dot');
        if (dot) dot.style.animation = 'pulse 1s ease';
    }

    function fillSkillBar(card) {
        const bar = card.querySelector('.skill-progress');
        if (bar) setTimeout(() => { bar.style.width = `${bar.dataset.level * 10}%`; }, 200);
    }

    function initPointerGlow() {
        for (const glow of document.querySelectorAll(GLOW_OVERLAYS)) {
            const surface = glow.parentElement;

            surface.addEventListener('mousemove', (e) => {
                const rect = surface.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                glow.style.background =
                    `radial-gradient(circle at ${x}px ${y}px, rgba(82, 140, 223, 0.15) 0%, transparent 70%)`;
            });

            surface.addEventListener('mouseleave', () => {
                glow.style.background =
                    'radial-gradient(circle at center, rgba(82, 140, 223, 0.1) 0%, transparent 70%)';
            });
        }
    }

    function initTechIconTracking() {
        for (const icon of document.querySelectorAll('.tech-icon-wrapper')) {
            icon.addEventListener('mousemove', (e) => {
                const rect = icon.getBoundingClientRect();
                icon.style.setProperty('--x', `${e.clientX - rect.left}px`);
                icon.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        }
    }

    function initTouchFeedback() {
        if (!('ontouchstart' in window)) return;
        for (const el of document.querySelectorAll('.education-card, .experience-item')) {
            el.addEventListener('touchstart', () => el.classList.add('touch-active'), { passive: true });
            el.addEventListener('touchend', () => {
                setTimeout(() => el.classList.remove('touch-active'), 300);
            });
        }
    }

    function initProjectPreview() {
        const items = document.querySelectorAll('.project-item');
        const gif = document.querySelector('.project-gif');
        const description = document.querySelector('.project-description');
        const overlay = document.querySelector('.project-overlay');
        if (items.length === 0 || !gif || !description || !overlay) return;

        for (const item of items) {
            item.addEventListener('mouseenter', () => {
                gif.style.opacity = '0';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    gif.src = item.dataset.gif;
                    description.textContent = item.dataset.description;
                    gif.style.opacity = '1';
                    overlay.style.opacity = '1';
                }, 300);
            });
        }

        if (window.innerWidth <= 768) initProjectScrollDots(items);
    }

    function initProjectScrollDots(items) {
        const list = document.querySelector('.projects-list');
        const container = document.querySelector('.projects-container');
        if (!list || !container) return;

        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        const dots = [...items].map((_, i) => {
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'scroll-dot active' : 'scroll-dot';
            indicator.appendChild(dot);
            return dot;
        });
        container.appendChild(indicator);

        list.addEventListener('scroll', () => {
            const active = Math.round(list.scrollLeft / items[0].offsetWidth);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
        }, { passive: true });
    }
})();
