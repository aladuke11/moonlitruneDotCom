// Projects Page JavaScript - Carousel functionality

document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.carousel-item');
    let current = 0;

    // Function to show the current carousel item
    function showItem(index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    // Next button functionality
    const nextButton = document.querySelector('.carousel-button.next');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            current = (current + 1) % items.length;
            showItem(current);
        });
    }

    // Previous button functionality
    const prevButton = document.querySelector('.carousel-button.prev');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            current = (current - 1 + items.length) % items.length;
            showItem(current);
        });
    }

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' && document.activeElement.closest('.project-carousel')) {
            current = (current + 1) % items.length;
            showItem(current);
        } else if (e.key === 'ArrowLeft' && document.activeElement.closest('.project-carousel')) {
            current = (current - 1 + items.length) % items.length;
            showItem(current);
        }
    });

    // Initialize the carousel
    showItem(current);
});
