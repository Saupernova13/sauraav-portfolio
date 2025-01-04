
const links = [
    { img: "/images/github.png", url: "https://github.com/Saupernova13" },
    { img: "/images/linkedin.png", url: "https://www.linkedin.com/in/sauraavjayrajh/" },
    { img: "/images/email.png", url: "mailto:sauraavjayrajh@gmail.com" },
    { img: "/images/phone.png", url: "https://wa.me/0719244175" }
];

let activeCircles = [];

document.querySelector('.background-img').addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const isMobile = window.innerWidth <= 768;

    // Remove any existing circles with animation
    if (activeCircles.length > 0) {
        closeCircles();
        return;
    }

    const circleSize = Math.max(50, 100 - (links.length * 8));

    if (isMobile) {
        // Create spacing for mobile circles
        const spacer = document.createElement('div');
        spacer.className = 'mobile-spacer';
        spacer.style.height = `${radius * 1.5}px`; // Adjust based on arc height
        spacer.style.transition = 'all 0.3s ease';
        document.querySelector('.profile-container').appendChild(spacer);
        activeCircles.push(spacer);
    }

    links.forEach((link, index) => {
        const circle = document.createElement('a');
        circle.href = link.url;
        circle.target = "_blank";
        circle.rel = "noopener noreferrer";
        circle.className = 'flying-circle';
        circle.style.width = `${circleSize}px`;
        circle.style.height = `${circleSize}px`;
        circle.style.position = 'fixed';

        const img = document.createElement('img');
        img.src = link.img;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.padding = '8px';
        circle.appendChild(img);

        if (isMobile) {
            // Initial position (underneath the profile picture)
            const initialX = centerX - (circleSize / 2);
            const initialY = centerY + radius - (circleSize / 2);

            // Calculate arc positions
            const totalAngleSpread = 90; // Degrees for the bottom arc
            const startAngle = -180 - (totalAngleSpread / 2); // Center at bottom
            const angleStep = totalAngleSpread / (links.length - 1 || 1);
            const angle = (startAngle + (index * angleStep)) * (Math.PI / 180);
            const finalRadius = radius * 1.2; // Adjust this multiplier to control how far the icons spread

            const finalX = centerX + Math.cos(angle) * finalRadius - (circleSize / 2);
            const finalY = centerY + radius + Math.abs(Math.sin(angle) * finalRadius) - (circleSize / 2);

            circle.style.left = `${initialX}px`;
            circle.style.top = `${initialY}px`;
            circle.style.zIndex = '0'; // Start behind profile picture
            circle.initialX = initialX;
            circle.initialY = initialY;
            circle.finalX = finalX;
            circle.finalY = finalY;
        } else {
            // Desktop positioning (original code)
            const totalAngleSpread = Math.min(120, links.length * 30);
            const startAngle = -totalAngleSpread / 2;
            const angleStep = totalAngleSpread / (links.length - 1 || 1);
            const angle = (startAngle + (index * angleStep)) * (Math.PI / 180);
            const finalRadius = radius + 100;

            const initialX = centerX + radius - (circleSize / 2);
            const initialY = centerY - (circleSize / 2);
            const finalX = centerX + Math.cos(angle) * finalRadius - (circleSize / 2);
            const finalY = centerY + Math.sin(angle) * finalRadius - (circleSize / 2);

            circle.style.left = `${initialX}px`;
            circle.style.top = `${initialY}px`;
            circle.initialX = initialX;
            circle.initialY = initialY;
            circle.finalX = finalX;
            circle.finalY = finalY;
        }

        circle.style.opacity = '0';
        document.body.appendChild(circle);
        activeCircles.push(circle);

        requestAnimationFrame(() => {
            circle.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            circle.style.left = `${circle.finalX}px`;
            circle.style.top = `${circle.finalY}px`;
            circle.style.opacity = '1';
            circle.style.zIndex = '1000'; // Bring to front during animation
        });
    });
});

function closeCircles() {
    activeCircles.forEach(circle => {
        if (circle.className === 'mobile-spacer') {
            circle.style.height = '0';
        } else {
            circle.style.left = `${circle.initialX}px`;
            circle.style.top = `${circle.initialY}px`;
            circle.style.opacity = '0';
            circle.style.zIndex = '0';
        }
    });

    setTimeout(() => {
        activeCircles.forEach(circle => circle.remove());
        activeCircles = [];
    }, 300);
}

// Clean up circles when clicking elsewhere
document.addEventListener('click', function (e) {
    if (!e.target.closest('.background-img') &&
        !e.target.closest('.flying-circle') &&
        activeCircles.length > 0) {
        closeCircles();
    }
});