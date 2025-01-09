// summary_section.js

// Configuration object for animation speeds
const ANIMATION_SETTINGS = {
    // Lower numbers = faster typing speed
    typingSpeed: 1, // Base typing speed (milliseconds)

    // Lower numbers = faster paragraph reveal delay
    paragraphDelay: 1, // Delay between paragraphs (milliseconds)

    // Lower numbers = faster initial reveal
    initialDelay: 1 // Initial animation delay (milliseconds)
};

document.addEventListener('DOMContentLoaded', () => {
    const summaryContent = document.querySelector('.summary-content');
    const paragraphs = document.querySelectorAll('.summary-text p');

    // Intersection Observer for main content
    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate paragraphs sequentially with configurable speed
                paragraphs.forEach((p, index) => {
                    setTimeout(() => {
                        p.classList.add('visible');
                    }, ANIMATION_SETTINGS.initialDelay * (index + 1));
                });
            }
        });
    }, {
        threshold: 0.2
    });

    if (summaryContent) {
        contentObserver.observe(summaryContent);

        const hoverEffect = summaryContent.querySelector('.summary-hover-effect');

        // Dynamic lighting effect on mouse move
        if (hoverEffect) {
            summaryContent.addEventListener('mousemove', (e) => {
                const rect = summaryContent.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                hoverEffect.style.background = `radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(82, 140, 223, 0.15) 0%,
                    transparent 70%
                )`;
            });

            // Reset lighting effect on mouse leave
            summaryContent.addEventListener('mouseleave', () => {
                hoverEffect.style.background = `radial-gradient(
                    circle at center,
                    rgba(82, 140, 223, 0.1) 0%,
                    transparent 70%
                )`;
            });
        }

        // Enhanced typing effect with configurable speed
        const addTypingEffect = (element) => {
            const text = element.textContent;
            element.textContent = '';
            let i = 0;

            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    // Use the configured typing speed
                    setTimeout(type, Math.random() * ANIMATION_SETTINGS.typingSpeed + ANIMATION_SETTINGS.typingSpeed);
                }
            };

            type();
        };

        // Apply typing effect with configurable paragraph delay
        paragraphs.forEach((p, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            addTypingEffect(p);
                        }, index * ANIMATION_SETTINGS.paragraphDelay);
                        observer.unobserve(p);
                    }
                });
            });

            observer.observe(p);
        });
    }

    // Cleanup function
    return () => {
        if (summaryContent) {
            contentObserver.disconnect();
            summaryContent.removeEventListener('mousemove', null);
            summaryContent.removeEventListener('mouseleave', null);
        }
    };
});