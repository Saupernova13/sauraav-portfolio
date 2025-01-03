document.addEventListener('DOMContentLoaded', function () {
    const wrapper = document.querySelector('.parallax-wrapper');
    const backgroundImg = wrapper.querySelector('.background-img');
    const foregroundImg = wrapper.querySelector('.foreground-img');

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const maxMove = 60;

        const moveX = (mouseX / rect.width) * maxMove;
        const moveY = (mouseY / rect.height) * 20;

        // Include the scale(1.1) in the transform
        backgroundImg.style.transform = `scale(1.1) translate(${-moveX * 0.5}px, ${-moveY * 0.5}px)`;
        foregroundImg.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
    });

    wrapper.addEventListener('mouseleave', () => {
        // Keep the scale(1.1) when resetting
        backgroundImg.style.transform = 'scale(1.1) translate(0, 0)';
        foregroundImg.style.transform = 'translate(0, 0)';
    });
});