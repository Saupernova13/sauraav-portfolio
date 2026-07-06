// Social links that fan out from the profile picture (desktop only; mobile
// shows the static .social-icons-mobile row instead).
(() => {
    'use strict';

    const LINKS = [
        { img: '/images/github.png', url: 'https://github.com/Saupernova13', label: 'GitHub' },
        { img: '/images/linkedin.png', url: 'https://www.linkedin.com/in/sauraavjayrajh/', label: 'LinkedIn' },
        { img: '/images/email.png', url: 'mailto:sauraavjayrajh@gmail.com', label: 'Email' },
        { img: '/images/stardust.png', url: 'https://stardustsoftware.carrd.co/', label: 'Stardust Software' },
        { img: '/images/cv.png', url: 'https://drive.google.com/file/d/1duN5lgNshz1Bo1516R6vCmaBTVu5IonO/view?usp=sharing', label: 'CV' },
    ];

    const CIRCLE_SIZE = Math.max(50, 100 - LINKS.length * 8);
    const ANIMATION_MS = 300;

    let circles = [];

    function open(trigger) {
        const rect = trigger.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;

        const spread = Math.min(120, LINKS.length * 30);
        const angleStep = spread / (LINKS.length - 1 || 1);

        circles = LINKS.map((link, index) => {
            const angle = (-spread / 2 + index * angleStep) * (Math.PI / 180);
            const circle = document.createElement('a');
            circle.href = link.url;
            circle.target = '_blank';
            circle.rel = 'noopener noreferrer';
            circle.className = 'flying-circle';
            circle.style.cssText =
                `position:fixed;width:${CIRCLE_SIZE}px;height:${CIRCLE_SIZE}px;opacity:0;z-index:0;` +
                `left:${centerX + radius - CIRCLE_SIZE / 2}px;top:${centerY - CIRCLE_SIZE / 2}px`;

            const img = document.createElement('img');
            img.src = link.img;
            img.alt = link.label;
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:8px';
            circle.appendChild(img);

            circle.dataset.homeLeft = circle.style.left;
            circle.dataset.homeTop = circle.style.top;
            document.body.appendChild(circle);

            requestAnimationFrame(() => {
                circle.style.transition = `all ${ANIMATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                circle.style.left = `${centerX + Math.cos(angle) * (radius + 100) - CIRCLE_SIZE / 2}px`;
                circle.style.top = `${centerY + Math.sin(angle) * (radius + 100) - CIRCLE_SIZE / 2}px`;
                circle.style.opacity = '1';
                circle.style.zIndex = '1000';
            });

            return circle;
        });
    }

    function close() {
        const closing = circles;
        circles = [];
        for (const circle of closing) {
            circle.style.left = circle.dataset.homeLeft;
            circle.style.top = circle.dataset.homeTop;
            circle.style.opacity = '0';
            circle.style.zIndex = '0';
        }
        setTimeout(() => closing.forEach((c) => c.remove()), ANIMATION_MS);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const trigger = document.querySelector('.background-img');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            if (window.innerWidth <= 768) return;
            if (circles.length > 0) close();
            else open(trigger);
        });

        document.addEventListener('scroll', () => {
            if (circles.length > 0) close();
        }, { passive: true });

        document.addEventListener('pointerdown', (e) => {
            if (circles.length > 0 &&
                !e.target.closest('.flying-circle') &&
                !e.target.closest('.background-img')) {
                close();
            }
        });
    });
})();
