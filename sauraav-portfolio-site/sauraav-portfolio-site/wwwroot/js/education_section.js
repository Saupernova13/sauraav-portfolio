document.addEventListener('DOMContentLoaded', () => {
    const educationCards = document.querySelectorAll('.education-card');

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Add staggered animation effect
                const delay = Array.from(educationCards).indexOf(entry.target) * 100;
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

    educationCards.forEach(card => {
        observer.observe(card);

        // Add hover effect for mouse movement
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const hoverEffect = card.querySelector('.education-hover-effect');
            if (hoverEffect) {
                hoverEffect.style.background = `radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(82, 140, 223, 0.15) 0%,
                    transparent 70%
                )`;
            }
        });
    });

    // Touch device handling
    if ('ontouchstart' in window) {
        educationCards.forEach(card => {
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

    // Optional: Add particle effects on card hover
    const createParticle = (x, y, card) => {
        const particle = document.createElement('div');
        particle.className = 'education-particle';
        card.appendChild(particle);

        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        const destinationX = (Math.random() - 0.5) * 100;
        const destinationY = (Math.random() - 0.5) * 100;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.transform = 'translate(-50%, -50%)';

        requestAnimationFrame(() => {
            particle.style.transform = `translate(${destinationX}px, ${destinationY}px)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 1000);
    };

    // Add particle effect on hover (desktop only)
    if (!('ontouchstart' in window)) {
        educationCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (Math.random() < 0.1) {
                    const rect = card.getBoundingClientRect();
                    createParticle(
                        e.clientX - rect.left,
                        e.clientY - rect.top,
                        card
                    );
                }
            });
        });
    }
});

// Add particle styles
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    .education-particle {
        position: absolute;
        background: rgba(82, 140, 223, 0.6);
        border-radius: 50%;
        pointer-events: none;
        transition: all 1s ease;
    }
`;
document.head.appendChild(particleStyles);