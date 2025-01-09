document.addEventListener('DOMContentLoaded', function () {
    const projectItems = document.querySelectorAll('.project-item');
    const projectGif = document.querySelector('.project-gif');
    const projectDescription = document.querySelector('.project-description');
    const projectOverlay = document.querySelector('.project-overlay');

    projectItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            const gifPath = this.dataset.gif;
            const description = this.dataset.description;

            // Reset opacity
            projectGif.style.opacity = '0';
            projectOverlay.style.opacity = '0';

            // Set new content
            setTimeout(() => {
                projectGif.src = gifPath;
                projectDescription.textContent = description;
                projectGif.style.opacity = '1';
                projectOverlay.style.opacity = '1';
            }, 300);
        });
    });

    if (window.innerWidth <= 768) {
        const projectsList = document.querySelector('.projects-list');
        const projects = document.querySelectorAll('.project-item');

        // Create scroll indicators
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';

        projects.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'scroll-dot';
            if (index === 0) dot.classList.add('active');
            scrollIndicator.appendChild(dot);
        });

        document.querySelector('.projects-container').appendChild(scrollIndicator);

        // Update active dot on scroll
        projectsList.addEventListener('scroll', () => {
            const scrollPosition = projectsList.scrollLeft;
            const itemWidth = projects[0].offsetWidth;
            const activeIndex = Math.round(scrollPosition / itemWidth);

            document.querySelectorAll('.scroll-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        });
    }
});