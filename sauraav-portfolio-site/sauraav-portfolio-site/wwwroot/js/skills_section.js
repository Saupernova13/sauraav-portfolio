// skills_section.js
document.addEventListener('DOMContentLoaded', () => {
    const skillCards = document.querySelectorAll('.skill-card');

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate skill progress bar
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    const level = progressBar.dataset.level;
                    const percentage = (level / 10) * 100;

                    // Add a small delay for visual effect
                    setTimeout(() => {
                        progressBar.style.width = `${percentage}%`;
                    }, 200);
                }
            }
        });
    }, {
        threshold: 0.2
    });

    skillCards.forEach(card => {
        observer.observe(card);

        const content = card.querySelector('.skill-content');
        const hoverEffect = card.querySelector('.skill-hover-effect');

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

    // Touch device handling
    if ('ontouchstart' in window) {
        skillCards.forEach(card => {
            card.addEventListener('touchstart', () => {
                card.classList.add('touch-active');
            });

            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.classList.remove('touch-active');
                }, 300);
            });
        });
    }

    // Cleanup function
    return () => {
        observer.disconnect();
        skillCards.forEach(card => {
            const content = card.querySelector('.skill-content');
            if (content) {
                content.removeEventListener('mousemove', null);
                content.removeEventListener('mouseleave', null);
            }
        });
    };
});