//The script.js file will contain the JavaScript code for dynamic content loading and interactivity.
//grabing reviews from the reviews.json file
fetch('reviews.json')
    .then(response => response.json())
    .then(data => {
        const reviewsContainer = document.getElementById('reviews');
        data.reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <h3>${review.name}</h3>
                <p>${review.text}</p>
                <span class="rating">${'★'.repeat(review.rating)}</span>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    })
    .catch(error => console.error('Error loading reviews:', error));\
// this script works like the projects.js file, it loads reviews from a JSON file and displays them on the page.
// The reviews.json file should be structured like this:
{
    "reviews": [
        {
            "name": "Rogue-like Game 1",
            "text": "This game offers a unique twist on the rogue-like genre.",
            "rating": 4
        },
        {
            "name": "Rogue-like Game 2",
            "text": "An innovative approach to permadeath and level design.",
            "rating": 5
        }
    ]
}
// The reviews will be displayed in a container with the ID 'reviews'.
// Ensure the reviews container exists in your HTML
document.addEventListener('DOMContentLoaded', function() {
    const reviewsContainer = document.getElementById('reviews');
    if (!reviewsContainer) {
        console.error('Reviews container not found in the document.');
        return;
    }

    // Fetch and display reviews
    fetch('reviews.json')
        .then(response => response.json())
        .then(data => {
            data.reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review';
                reviewElement.innerHTML = `
                    <h3>${review.name}</h3>
                    <p>${review.text}</p>
                    <span class="rating">${'★'.repeat(review.rating)}</span>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        })
        .catch(error => console.error('Error loading reviews:', error));
});
// This script fetches reviews from a JSON file and displays them in a designated container on the page.
// Ensure the reviews container exists in your HTML
// The reviews.json file should be structured like this:
{
    "reviews": [
        {
            "name": "Rogue-like Game 1",
            "text": "This game offers a unique twist on the rogue-like genre.",
            "rating": 4
        },
        {
            "name": "Rogue-like Game 2",
            "text": "An innovative approach to permadeath and level design.",
            "rating": 5
        }
    ]
}
// The reviews will be displayed in a container with the ID 'reviews'.
// Ensure the reviews container exists in your HTML