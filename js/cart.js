import { api } from './api.js';
import { auth } from './auth.js';

// This function loads the cart items when the page opens
export async function loadCartItems() {
    const cartContainer = document.getElementById('cart-items');
    // If we are not on the cart page, stop here
    if (!cartContainer) return;

    let myCart = [];

    // Show a loading message
    cartContainer.innerHTML = '<div class="loading">📦 Loading your basket...</div>';

    try {
        // Check if user is logged in
        if (auth.isLoggedIn()) {
            // Get cart from the server (Backend)
            myCart = await api.getCart();
        } else {
            // Get cart from the browser storage (Local Storage)
            // JSON.parse converts the text back into a list
            myCart = JSON.parse(localStorage.getItem('florryCart')) || [];
        }

        // If cart is empty
        if (myCart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-container">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything yet.</p>
                    <button class="shop-now-btn">
                        Start Shopping
                    </button>
                </div>
            `;
            // Set totals to 0
            if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = '₹0';
            if (document.getElementById('total')) document.getElementById('total').textContent = '₹0';

            // Update the red badge number
            updateCartCount();
            return;
        }

        // If cart has items, create HTML for each item
        cartContainer.innerHTML = myCart.map(item => {
            // Sometimes the flower details are inside a 'flower' object, sometimes direct
            const flower = item.flower || item;
            const price = parseFloat(flower.price);
            const id = item.cart_id || flower.flower_id;
            // Use flower_id for local cart operations if cart_id is missing

            return `
            <div class="cart-item-card">
                <div class="item-image">
                    <img src="${flower.image_url || 'https://via.placeholder.com/100'}" alt="${flower.name}">
                </div>
                <div class="item-details">
                    <div class="item-name-row">
                        <h3>${flower.name}</h3>
                        <button class="remove-btn" data-id="${id}">✕</button>
                    </div>
                    <p class="item-price-unit">₹${price} / unit</p>
                    <div class="item-action-row">
                        <div class="quantity-controls">
                            <!-- Decrease Quantity Button -->
                            <button class="qty-btn minus" data-id="${id}">−</button>
                            
                            <!-- Quantity Number -->
                            <span class="qty-val">${item.quantity}</span>
                            
                            <!-- Increase Quantity Button -->
                            <button class="qty-btn plus" data-id="${id}">+</button>
                        </div>
                        <p class="item-subtotal">₹${(price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            `;
        }).join(''); // Join all item strings together

        // Update the total price summary
        updateCartSummary(myCart);

        // Update the red badge number
        updateCartCount();

    } catch (error) {
        console.error('Error loading cart:', error);
        cartContainer.innerHTML = '<p class="error">Failed to load cart items. Please login again.</p>';
        // If error, force logout to fix stale token
        if (error.message.includes('401')) auth.logout();
    }
}

// Calculate and show the total price
function updateCartSummary(cartItems) {
    // Calculate subtotal
    let subtotal = 0;

    // Loop through each item to add to subtotal
    for (let item of cartItems) {
        const flower = item.flower || item;
        const price = parseFloat(flower.price);
        subtotal += price * item.quantity;
    }

    // Delivery fee is 50 if cart is not empty
    const deliveryFee = subtotal > 0 ? 50 : 0;

    // Update the HTML text
    if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    if (document.getElementById('total')) document.getElementById('total').textContent = `₹${(subtotal + deliveryFee).toFixed(2)}`;
}

// Update the red number badge on the cart icon
export async function updateCartCount() {
    const badgeElement = document.getElementById('cart-count');
    if (!badgeElement) return;

    let totalCount = 0;

    try {
        if (auth.isLoggedIn()) {
            const items = await api.getCart();
            // Add up quantities of all items
            totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        } else {
            const cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        // Logic for showing/hiding the red badge
        if (totalCount > 0) {
            badgeElement.textContent = totalCount;
            badgeElement.classList.remove('hidden'); // Show it
        } else {
            badgeElement.classList.add('hidden'); // Hide it
        }

    } catch (e) {
        console.warn("Could not update cart count");
    }
}

// Change quantity when + or - is clicked
export async function updateQuantity(id, newQuantity) {
    // If quantity becomes 0, remove the item
    if (newQuantity <= 0) {
        return removeFromCart(id);
    }

    try {
        if (auth.isLoggedIn()) {
            // Update on server
            await api.updateCartQuantity(id, newQuantity);
        } else {
            // Update in local storage
            let cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            // If logged in we use cart_id (id), if local we use flower_id. 
            // The loading logic passes appropriate ID.
            // But wait, getCart returns items with cart_id. local returns items with flower_id.
            // Let's check finding logic.
            const item = cart.find(i => i.flower_id == id || i.cart_id == id);

            if (item) {
                item.quantity = newQuantity;
                localStorage.setItem('florryCart', JSON.stringify(cart));
            }
        }
        // Reload the list to show changes
        loadCartItems();
    } catch (error) {
        alert('Could not update quantity. Please try again.');
    }
}

// Remove an item entirely
export async function removeFromCart(id) {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
        if (auth.isLoggedIn()) {
            await api.deleteCartItem(id);
        } else {
            let cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            // Keep items that do NOT match the ID
            cart = cart.filter(item => item.flower_id != id && item.cart_id != id);
            localStorage.setItem('florryCart', JSON.stringify(cart));
        }
        loadCartItems();
    } catch (error) {
        alert('Could not remove item. Please try again.');
    }
}

// Make functions available globally for HTML onclick attributes
window.loadCartItems = loadCartItems;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.updateCartCount = updateCartCount;

// Run this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();

    // Event Delegation for dynamically added cart items
    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
        cartContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;
            if (btn.classList.contains('remove-btn')) {
                removeFromCart(id);
            } else if (btn.classList.contains('minus')) {
                const currentQty = parseInt(btn.nextElementSibling.textContent);
                updateQuantity(id, currentQty - 1);
            } else if (btn.classList.contains('plus')) {
                const currentQty = parseInt(btn.previousElementSibling.textContent);
                updateQuantity(id, currentQty + 1);
            } else if (btn.classList.contains('shop-now-btn')) {
                window.location.href = './landing.html';
            }
        });
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = './payment.html';
        });
    }
});

