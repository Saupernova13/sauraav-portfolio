// tech_stack_section.js
document.addEventListener('DOMContentLoaded', () => {
    const techIcons = document.querySelectorAll('.tech-icon-wrapper');

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered animation effect
                const delay = Array.from(techIcons).indexOf(entry.target) * 50;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '50px'
    });

    techIcons.forEach(icon => {
        observer.observe(icon);

        // Add hover effect for mouse movement
        icon.addEventListener('mousemove', (e) => {
            const rect = icon.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            icon.style.setProperty('--x', `${x}px`);
            icon.style.setProperty('--y', `${y}px`);
        });
    });

    // Touch device handling
    if ('ontouchstart' in window) {
        techIcons.forEach(icon => {
            icon.addEventListener('touchstart', () => {
                icon.classList.add('touch-active');
            });

            icon.addEventListener('touchend', () => {
                setTimeout(() => {
                    icon.classList.remove('touch-active');
                }, 300);
            });
        });
    }

    // Optional: Add floating animation
    techIcons.forEach((icon, index) => {
        icon.style.animation = `float 3s ease-in-out infinite`;
        icon.style.animationDelay = `${index * 0.1}s`;
    });

    // Cleanup function
    return () => {
        observer.disconnect();
        techIcons.forEach(icon => {
            icon.removeEventListener('mousemove', null);
        });
    };
});