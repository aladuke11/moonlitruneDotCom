// ============================================
// CYBERPUNK STORE - ARG CREDIT SYSTEM
// ============================================
// Manages credit tracking, debt accumulation, purchases, and HoloVision Goggles unlock mechanics

// ============================================
// LOCALSTORAGE KEYS
// ============================================
const DEBT_KEY = 'cryptoCorp_debt';              // Total debt accumulated from borrowing
const CREDITS_KEY = 'cryptoCorp_credits';         // Available credits to spend
const PURCHASES_KEY = 'cryptoCorp_purchases';     // Purchase history array
const GOGGLES_UNLOCK_KEY = 'cryptoCorp_gogglesUnlocked'; // Whether HoloVision Goggles are unlocked for purchase

// ============================================
// CREDIT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get the user's current available credits
 * @returns {number} Current credit balance
 */
function getCredits() {
    return parseFloat(localStorage.getItem(CREDITS_KEY)) || 0;
}

/**
 * Set the user's credit amount
 * @param {number} amount - Amount to set
 */
function setCredits(amount) {
    localStorage.setItem(CREDITS_KEY, amount.toFixed(2));
}

/**
 * Add credits to the user's balance
 * @param {number} amount - Amount to add
 * @returns {number} New credit balance
 */
function addCredits(amount) {
    const current = getCredits();
    const newAmount = current + amount;
    setCredits(newAmount);
    return newAmount;
}

/**
 * Deduct credits from the user's balance
 * @param {number} amount - Amount to deduct
 * @returns {number} New credit balance
 */
function deductCredits(amount) {
    const current = getCredits();
    const newAmount = current - amount;
    setCredits(newAmount);
    return newAmount;
}

// ============================================
// DEBT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get the user's total accumulated debt
 * @returns {number} Current debt amount
 */
function getDebt() {
    return parseFloat(localStorage.getItem(DEBT_KEY)) || 0;
}

/**
 * Add to the user's debt (from borrowing credits)
 * @param {number} amount - Amount to add to debt
 * @returns {number} New total debt
 */
function addDebt(amount) {
    const currentDebt = getDebt();
    const newDebt = currentDebt + amount;
    localStorage.setItem(DEBT_KEY, newDebt.toFixed(2));
    return newDebt;
}

/**
 * Clear all debt and credits (reset function)
 */
function clearDebt() {
    localStorage.removeItem(DEBT_KEY);
    localStorage.removeItem(CREDITS_KEY);
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

/**
 * Update the balance display on the page
 * Shows current credits with color coding:
 * - Red: No credits (0 or less)
 * - Orange: Low credits (less than $100)
 * - Cyan: Healthy balance ($100+)
 */
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('creditAmount');
    if (balanceElement) {
        const credits = getCredits();
        balanceElement.textContent = '$' + credits.toFixed(2);
        
        // Color code based on credit level
        if (credits <= 0) {
            balanceElement.style.color = 'var(--cyber-alert-error-bg)'; // Red
        } else if (credits < 100) {
            balanceElement.style.color = '#ffa500'; // Orange
        } else {
            balanceElement.style.color = 'var(--cyber-accent)'; // Cyan
        }
    }
}

// ============================================
// PURCHASE TRACKING FUNCTIONS
// ============================================

/**
 * Save a purchase to the purchase history
 * @param {string} itemName - Name of purchased item
 * @param {number} price - Price of the item
 * @returns {number} Total number of purchases
 */
function savePurchase(itemName, price) {
    const purchases = JSON.parse(localStorage.getItem(PURCHASES_KEY)) || [];
    purchases.push({
        name: itemName,
        price: price,
        date: new Date().toLocaleString()
    });
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    return purchases.length;
}

/**
 * Get all purchase history
 * @returns {Array} Array of purchase objects
 */
function getPurchases() {
    return JSON.parse(localStorage.getItem(PURCHASES_KEY)) || [];
}

/**
 * Clear all purchase history
 */
function clearPurchases() {
    localStorage.removeItem(PURCHASES_KEY);
}

// ============================================
// POPUP SYSTEM
// ============================================

// DOM elements
const popup = document.querySelector('.full-screen-popup');
const closeBtn = document.querySelector('.close-popup');
const confirmBtn = document.querySelector('.confirm-button');
const cancelBtn = document.querySelector('.cancel-button');
const buyButtons = document.querySelectorAll('.buyButton:not(:disabled)');

let currentItem = null; // Stores item info when popup is open

/**
 * Close the credit popup and reset current item
 */
function closePopup() {
    popup.classList.remove('active');
    currentItem = null;
}

/**
 * Open the credit popup to borrow more credits
 * @param {string} itemName - Name of item to purchase
 * @param {number} price - Price of the item
 */
function openPopup(itemName, price) {
    currentItem = { name: itemName, price: price };
    
    // Update popup balance display
    const credits = getCredits();
    const debt = getDebt();
    const balanceDisplay = document.getElementById('currentBalance');
    if (balanceDisplay) {
        balanceDisplay.textContent = '$' + credits.toFixed(2) + ' (Debt: $' + debt.toFixed(2) + ')';
        balanceDisplay.style.color = credits <= 0 ? 'var(--cyber-alert-error-bg)' : 'var(--cyber-accent)';
    }
    
    popup.classList.add('active');
}

// Popup close button listeners
closeBtn.addEventListener('click', closePopup);
cancelBtn.addEventListener('click', closePopup);

/**
 * Handle credit borrowing and purchase confirmation
 * Triggered when user clicks "Agree" in the popup
 */
confirmBtn.addEventListener('click', function() {
    if (currentItem) {
        // User is purchasing an item
        const credits = getCredits();
        const price = parseFloat(currentItem.price);
        
        if (credits >= price) {
            // Has enough credits - direct purchase
            deductCredits(price);
            savePurchase(currentItem.name, currentItem.price);
            const newCredits = getCredits();
            alert(`Purchase successful!\nItem: ${currentItem.name}\nPrice: $${price.toFixed(2)}\n\nRemaining Credits: $${newCredits.toFixed(2)}`);
        } else {
            // Insufficient credits - borrow $500, then purchase
            const borrowed = 500;
            addCredits(borrowed);
            addDebt(borrowed);
            deductCredits(price);
            savePurchase(currentItem.name, currentItem.price);
            const newCredits = getCredits();
            const totalDebt = getDebt();
            alert(`Credits borrowed and purchase completed!\nBorrowed: $${borrowed.toFixed(2)}\nItem: ${currentItem.name}\nPrice: $${price.toFixed(2)}\n\nRemaining Credits: $${newCredits.toFixed(2)}\nTotal Debt: $${totalDebt.toFixed(2)}`);
        }
        
        // ARG: Trigger hidden box if HoloVision Goggles purchased
        if (currentItem.name.includes('HoloVision Goggles')) {
            setTimeout(() => {
                showHiddenBox();
            }, 500);
        }
    } else {
        // User is just borrowing credits without a purchase
        const borrowed = 500;
        addCredits(borrowed);
        addDebt(borrowed);
        const newCredits = getCredits();
        const totalDebt = getDebt();
        alert(`Credits borrowed successfully!\nAmount: $${borrowed.toFixed(2)}\n\nAvailable Credits: $${newCredits.toFixed(2)}\nTotal Debt: $${totalDebt.toFixed(2)}`);
    }
    
    updateBalanceDisplay();
    closePopup();
});

// ============================================
// BUY BUTTON LISTENERS
// ============================================

/**
 * Attach event listeners to all buy buttons
 * Only shows credit popup if user doesn't have enough credits
 */
buyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Extract product info from card
        const productCard = button.closest('.productCard');
        const itemName = productCard.querySelector('.productTitle').textContent;
        const itemPrice = parseFloat(productCard.querySelector('.productPrice').textContent.replace('$', ''));
        const credits = getCredits();
        
        // Check if user has enough credits
        if (credits < itemPrice) {
            // Insufficient credits - show popup to borrow
            openPopup(itemName, itemPrice);
        } else {
            // Has enough credits - purchase directly
            deductCredits(itemPrice);
            savePurchase(itemName, itemPrice);
            const newCredits = getCredits();
            alert(`Purchase successful!\nItem: ${itemName}\nPrice: $${itemPrice.toFixed(2)}\n\nRemaining Credits: $${newCredits.toFixed(2)}`);
            
            // ARG: Trigger hidden box if HoloVision Goggles purchased
            if (itemName.includes('HoloVision Goggles')) {
                setTimeout(() => {
                    showHiddenBox();
                }, 500);
            }
            
            updateBalanceDisplay();
        }
    });
});

// Close popup when clicking outside content area
popup.addEventListener('click', function(e) {
    if (e.target === popup) {
        closePopup();
    }
});

// ============================================
// HIDDEN BOX (ARG FEATURE)
// ============================================

const hiddenBox = document.getElementById('hiddenBox');
const closeHiddenBtn = document.getElementById('closeHidden');

/**
 * Show the hidden box (triggered after goggles purchase)
 */
function showHiddenBox() {
    hiddenBox.style.display = 'flex';
    localStorage.setItem('goggles_purchased', 'true');
}

/**
 * Hide the hidden box
 */
function hideHiddenBox() {
    hiddenBox.style.display = 'none';
}

// Hidden box event listeners
closeHiddenBtn.addEventListener('click', hideHiddenBox);
hiddenBox.addEventListener('click', function(e) {
    if (e.target === hiddenBox) {
        hideHiddenBox();
    }
});

// ESC key closes hidden box
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && hiddenBox.style.display === 'flex') {
        hideHiddenBox();
    }
});

// ============================================
// PAGE LOAD INITIALIZATION
// ============================================

/**
 * Initialize store on page load:
 * - Log existing debt/purchases to console
 * - Check if HoloVision Goggles are unlocked
 * - Show hidden content banner if goggles purchased
 */
window.addEventListener('load', function() {
    // Log debt status
    const debt = getDebt();
    if (debt > 0) {
        console.log(`⚠️ Existing debt detected: $${debt.toFixed(2)}`);
    }
    
    // Log purchase history
    const purchases = getPurchases();
    if (purchases.length > 0) {
        console.log(`📦 Purchase History (${purchases.length} items):`);
        purchases.forEach((purchase, index) => {
            console.log(`  ${index + 1}. ${purchase.name} - $${purchase.price} (${purchase.date})`);
        });
    }

    // ARG: Check if HoloVision Goggles are unlocked for purchase
    const isUnlocked = localStorage.getItem(GOGGLES_UNLOCK_KEY) === 'true';
    if (isUnlocked) {
        const gogglesCard = document.querySelector('.productCard.soldOut');
        if (gogglesCard) {
            // Remove sold-out status
            gogglesCard.classList.remove('soldOut');
            const badge = gogglesCard.querySelector('.soldOutBadge');
            if (badge) badge.remove();
            
            // Enable buy button
            const button = gogglesCard.querySelector('.buyButton');
            if (button) {
                button.disabled = false;
                button.textContent = 'Buy Now';
                
                // Attach event listener to newly enabled button
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productCard = button.closest('.productCard');
                    const itemName = productCard.querySelector('.productTitle').textContent;
                    const itemPrice = parseFloat(productCard.querySelector('.productPrice').textContent.replace('$', ''));
                    const credits = getCredits();
                    
                    // Check if user has enough credits
                    if (credits < itemPrice) {
                        openPopup(itemName, itemPrice);
                    } else {
                        // Purchase directly
                        deductCredits(itemPrice);
                        savePurchase(itemName, itemPrice);
                        const newCredits = getCredits();
                        alert(`Purchase successful!\nItem: ${itemName}\nPrice: $${itemPrice.toFixed(2)}\n\nRemaining Credits: $${newCredits.toFixed(2)}`);
                        
                        // Trigger hidden box
                        if (itemName.includes('HoloVision Goggles')) {
                            setTimeout(() => {
                                showHiddenBox();
                            }, 500);
                        }
                        
                        updateBalanceDisplay();
                    }
                });
            }
            console.log('🔓 HoloVision Goggles unlocked!');
        }
    }

    // ARG: Show banner if goggles were previously purchased
    const gogglesPurchased = localStorage.getItem('goggles_purchased') === 'true';
    if (gogglesPurchased && purchases.some(p => p.name.includes('HoloVision Goggles'))) {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-neon-green);
            color: var(--color-background);
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 999;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 0 10px var(--color-neon-green);
        `;
        banner.textContent = '👁️ Click to access hidden content';
        banner.addEventListener('click', showHiddenBox);
        document.body.appendChild(banner);
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

// ESC closes credit popup
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
        closePopup();
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Update balance display on page load
updateBalanceDisplay();
