// qualification_section.js
document.addEventListener('DOMContentLoaded', () => {
    const qualificationCards = document.querySelectorAll('.qualification-card');

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Add staggered animation effect
                const delay = Array.from(qualificationCards).indexOf(entry.target) * 100;
                entry.target.style.transitionDelay = `${delay}ms`;

                // Remove delay after animation
                setTimeout(() => {
                    entry.target.style.transitionDelay = '0ms';
                }, delay + 500);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '50px'
    });

    qualificationCards.forEach(card => {
        observer.observe(card);

        const content = card.querySelector('.qualification-content');
        const hoverEffect = card.querySelector('.qualification-hover-effect');

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

    // Cleanup function
    return () => {
        observer.disconnect();
        qualificationCards.forEach(card => {
            const content = card.querySelector('.qualification-content');
            if (content) {
                content.removeEventListener('mousemove', null);
                content.removeEventListener('mouseleave', null);
            }
        });
    };
});