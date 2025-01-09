// section_animations.js
document.addEventListener('DOMContentLoaded', () => {
    const sectionTitles = document.querySelectorAll('.section-title');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    sectionTitles.forEach(title => {
        observer.observe(title);
    });

    // Smooth scroll functionality
    document.querySelectorAll('.scroll-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effect to sections
    const sections = document.querySelectorAll('.portfolio-section');
    sections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'scale(1.002)';
            section.style.transition = 'transform 0.3s ease';
        });

        section.addEventListener('mouseleave', () => {
            section.style.transform = 'scale(1)';
        });
    });
});