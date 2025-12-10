// HoloVision System - Debt Management Interface
// Handles debt tracking, purchasing, and clearance protocols

const DEBT_KEY = 'cryptoCorp_debt';
const PURCHASES_KEY = 'cryptoCorp_purchases';

// DOM Elements (will be initialized after page load)
let debtReminder;
let holovisionBox;
let accessHolovisionBtn;
let closeHolovisionBtn;
let clearDebtBtn;
let cancelDebtBtn;
let debtDisplay;

// Initialize DOM elements
function initDOMElements() {
    debtReminder = document.getElementById('debt-reminder');
    holovisionBox = document.getElementById('holovisionBox');
    accessHolovisionBtn = document.getElementById('accessHolovision');
    closeHolovisionBtn = document.querySelector('.close-holovision');
    clearDebtBtn = document.getElementById('clearDebtBtn');
    cancelDebtBtn = document.getElementById('cancelDebtBtn');
    debtDisplay = document.getElementById('debt-display');
}

// HoloVision box functions
function showHolovisionBox() {
    const debt = parseFloat(localStorage.getItem(DEBT_KEY)) || 0;
    debtDisplay.textContent = `$${debt.toFixed(2)}`;
    holovisionBox.style.display = 'flex';
}

function hideHolovisionBox() {
    holovisionBox.style.display = 'none';
}

function clearDebt() {
    if (confirm('Are you absolutely sure? This will permanently clear all debt and purchase records.')) {
        localStorage.removeItem(DEBT_KEY);
        localStorage.removeItem(PURCHASES_KEY);
        localStorage.removeItem('goggles_purchased');
        alert('All records wiped. CryptoCorp debt cleared.');
        hideHolovisionBox();
        debtReminder.style.display = 'none';
        location.reload(); // Refresh to update all pages
    }
}

// Event listeners
function initHolovisionSystem() {
    initDOMElements(); // Initialize DOM elements first
    
    if (accessHolovisionBtn) {
        accessHolovisionBtn.addEventListener('click', showHolovisionBox);
    }
    if (closeHolovisionBtn) {
        closeHolovisionBtn.addEventListener('click', hideHolovisionBox);
    }
    if (clearDebtBtn) {
        clearDebtBtn.addEventListener('click', clearDebt);
    }
    if (cancelDebtBtn) {
        cancelDebtBtn.addEventListener('click', hideHolovisionBox);
    }

    // Click outside to close
    if (holovisionBox) {
        holovisionBox.addEventListener('click', function(e) {
            if (e.target === holovisionBox) {
                hideHolovisionBox();
            }
        });
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && holovisionBox && holovisionBox.style.display === 'flex') {
            hideHolovisionBox();
        }
    });
}

// Initialize on page load
window.addEventListener('load', function() {
    initHolovisionSystem();
    
    const debt = parseFloat(localStorage.getItem(DEBT_KEY)) || 0;
    const purchases = JSON.parse(localStorage.getItem(PURCHASES_KEY)) || [];
    
    if (debt > 0) {
        let debtMessage = `<strong>⚠️ NOTICE:</strong> You have an outstanding debt of $${debt.toFixed(2)} with CryptoCorp.`;
        
        if (purchases.length > 0) {
            debtMessage += ` You have purchased ${purchases.length} item(s).`;
        }
        
        debtMessage += ` Visit the <a href="CyberpunkStore.html">Cyberpunk Store</a> to check your account status.`;
        
        debtReminder.style.display = 'block';
        debtReminder.innerHTML = debtMessage;
        if (accessHolovisionBtn) {
            accessHolovisionBtn.style.display = 'inline-block';
        }
    }
    
    // Log purchase history to console for debugging
    if (purchases.length > 0) {
        console.log(`📦 Purchase History (${purchases.length} items):`);
        purchases.forEach((purchase, index) => {
            console.log(`  ${index + 1}. ${purchase.name} - $${purchase.price} (${purchase.date})`);
        });
    }
});
