// experience_section.js
document.addEventListener('DOMContentLoaded', () => {
    const experienceItems = document.querySelectorAll('.experience-item');

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Add staggered animation effect
                const delay = Array.from(experienceItems).indexOf(entry.target) * 100;
                entry.target.style.transitionDelay = `${delay}ms`;

                // Animate marker dot
                const dot = entry.target.querySelector('.marker-dot');
                dot.style.animation = 'pulse 1s ease';

                // Remove animation and delay after completion
                setTimeout(() => {
                    entry.target.style.transitionDelay = '0ms';
                    if (dot) dot.style.animation = '';
                }, delay + 1000);
            }
        });
    }, observerOptions);

    experienceItems.forEach(item => {
        observer.observe(item);

        const content = item.querySelector('.experience-content');
        const hoverEffect = item.querySelector('.experience-hover-effect');

        // Dynamic lighting effect on mouse move
        if (content && hoverEffect) {
            content.addEventListener('mousemove', (e) => {
                const rect = content.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                hoverEffect.style.background = `radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(82, 140, 223, 0.15) 0%,
                    transparent 70%
                )`;

                // Optional: Create particles on mouse move
                if (Math.random() < 0.1) {
                    createParticle(x, y, content);
                }
            });

            // Reset lighting effect on mouse leave
            content.addEventListener('mouseleave', () => {
                hoverEffect.style.background = `radial-gradient(
                    circle at center,
                    rgba(82, 140, 223, 0.1) 0%,
                    transparent 70%
                )`;
            });
        }
    });

    // Particle effect function
    const createParticle = (x, y, element) => {
        const particle = document.createElement('div');
        particle.className = 'experience-particle';
        element.appendChild(particle);

        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        const destinationX = (Math.random() - 0.5) * 100;
        const destinationY = (Math.random() - 0.5) * 100;
        const rotation = Math.random() * 520;
        const delay = Math.random() * 200;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.transform = 'translate(-50%, -50%)';

        // Trigger particle animation
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`;
            particle.style.opacity = '0';
            particle.style.transition = `all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;
        });

        // Remove particle after animation
        setTimeout(() => particle.remove(), 1000 + delay);
    };

    // Touch device handling
    if ('ontouchstart' in window) {
        experienceItems.forEach(item => {
            let touchTimeout;

            item.addEventListener('touchstart', () => {
                item.classList.add('touch-active');

                // Add ripple effect on touch
                const content = item.querySelector('.experience-content');
                if (content) {
                    const ripple = document.createElement('div');
                    ripple.className = 'touch-ripple';
                    content.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 1000);
                }
            });

            item.addEventListener('touchend', () => {
                clearTimeout(touchTimeout);
                touchTimeout = setTimeout(() => {
                    item.classList.remove('touch-active');
                }, 300);
            });
        });
    }

    // Performance optimization: Debounce scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            experienceItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = 1 - (rect.top + rect.height) / (window.innerHeight + rect.height);
                    const marker = item.querySelector('.marker-dot');
                    if (marker) {
                        marker.style.transform = `scale(${1 + progress * 0.2})`;
                    }
                }
            });
        });
    });

    // Add ripple effect styles
    const style = document.createElement('style');
    style.textContent = `
        .touch-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(82, 140, 223, 0.2);
            transform: scale(0);
            animation: ripple 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
        }

        @keyframes ripple {
            from {
                transform: scale(0);
                opacity: 1;
            }
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Cleanup function for memory management
    return () => {
        observer.disconnect();
        experienceItems.forEach(item => {
            const content = item.querySelector('.experience-content');
            if (content) {
                content.removeEventListener('mousemove', null);
                content.removeEventListener('mouseleave', null);
            }
        });
        window.removeEventListener('scroll', null);
    };
});