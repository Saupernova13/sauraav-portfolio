// Wait for document ready
$(document).ready(function () {
    // Initialize header behavior
    initializeHeader();

    // Handle resize events
    $(window).on('resize', handleResize);
});

// Function to initialize header behavior
function initializeHeader() {
    // Only apply hover effects on desktop
    if (window.innerWidth >= 768) {
        const $body = $('body');
        const $header = $('header');
        const $hoverArea = $('.hover-area');
        const $neonLine = $('.neon-line');

        // Show header on hover over top area, header, or neon line
        $hoverArea.add($header).add($neonLine).hover(
            // Mouse enter
            function () {
                $body.removeClass('hide-header');
            },
            // Mouse leave
            function (e) {
                if (!$(e.relatedTarget).closest('header, .hover-area, .neon-line').length) {
                    $body.addClass('hide-header');
                }
            }
        );
    } else {
        // Remove hide-header class on mobile
        $('body').removeClass('hide-header');
    }
}

// Function to handle resize events
function handleResize() {
    if (window.innerWidth < 768) {
        $('body').removeClass('hide-header');
    } else {
        // Reinitialize header behavior for desktop
        initializeHeader();
    }
}

// Optional: Add debounce to resize handler for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Use debounced resize handler
$(window).on('resize', debounce(handleResize, 250));