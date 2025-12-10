// Roguelike Reviews JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const reviewsContainer = document.getElementById('reviews');
    const errorMessage = document.getElementById('error-message');

    if (!reviewsContainer) {
        console.error('Reviews container not found in the document.');
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
        return;
    }

    // Sample reviews data (fallback if JSON file doesn't exist)
    const fallbackReviews = {
        "reviews": [
            {
                "name": "Hades",
                "text": "An absolutely phenomenal roguelike that combines tight gameplay with an incredible narrative. Every run feels meaningful, and the story progression keeps you coming back. The art style is gorgeous and the voice acting is top-notch.",
                "rating": 5,
                "genre": "Action RPG",
                "developer": "Supergiant Games"
            },
            {
                "name": "Dead Cells",
                "text": "A fast-paced metroidvania roguelike with incredibly satisfying combat. The movement feels fluid and the weapon variety keeps each run fresh. The difficulty curve is perfect - challenging but never unfair.",
                "rating": 4,
                "genre": "Metroidvania",
                "developer": "Motion Twin"
            },
            {
                "name": "The Binding of Isaac: Repentance",
                "text": "The ultimate version of a roguelike classic. Hundreds of items create countless synergies, making every run unique. The grotesque art style isn't for everyone, but the gameplay depth is unmatched.",
                "rating": 5,
                "genre": "Twin-stick Shooter",
                "developer": "Edmund McMillen"
            },
            {
                "name": "Risk of Rain 2",
                "text": "Takes the 2D original into 3D beautifully. Great for multiplayer sessions with friends. The scaling difficulty keeps you on your toes, and the item combinations can create some wild power fantasies.",
                "rating": 4,
                "genre": "Third-person Shooter",
                "developer": "Hopoo Games"
            }
        ]
    };

    // Function to display reviews
    function displayReviews(data) {
        reviewsContainer.innerHTML = ''; // Clear loading message
        
        data.reviews.forEach(review => {
            const reviewElement = document.createElement('article');
            reviewElement.className = 'review-card';
            
            // Create the image HTML if image field exists
            const imageHTML = review.image ? 
                `<div class="review-image">
                    <img src="${review.image}" alt="${review.name} screenshot" loading="lazy">
                </div>` : '';
            
            reviewElement.innerHTML = `
                <h3>${review.name}</h3>
                <div class="review-meta">
                    <span class="genre">${review.genre || 'Roguelike'}</span>
                    <span class="developer">${review.developer || 'Unknown Developer'}</span>
                </div>
                ${imageHTML}
                <p class="review-text">${review.text}</p>
                <div class="rating">
                    <span class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    <span class="rating-text">${review.rating}/5 stars</span>
                </div>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    }

    // Function to show error
    function showError() {
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
        reviewsContainer.innerHTML = '<p>Failed to load reviews. Using fallback data...</p>';
        displayReviews(fallbackReviews);
    }

    // Add loading message
    reviewsContainer.innerHTML = '<p>Loading reviews...</p>';

    // Try to fetch reviews from JSON file, fall back to sample data
    fetch('reviews.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayReviews(data);
        })
        .catch(error => {
            console.log('Could not load reviews.json, using fallback data:', error);
            displayReviews(fallbackReviews);
        });
});
