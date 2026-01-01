async function loadCartItems() {
    const cartItemsDiv = document.getElementById('cart-items');
    if (!cartItemsDiv) return;
    let cartItems = [];

    cartItemsDiv.innerHTML = '<div class="loading">📦 Loading your basket...</div>';

    try {
        if (auth.isLoggedIn()) {
            cartItems = await api.getCart();
        } else {
            cartItems = JSON.parse(localStorage.getItem('florryCart')) || [];
        }

        if (cartItems.length === 0) {
            cartItemsDiv.innerHTML = `
                <div class="empty-cart-container">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything yet.</p>
                    <button class="shop-now-btn" onclick="window.location.href='./landing.html'">
                        Start Shopping
                    </button>
                </div>
            `;
            document.getElementById('subtotal').textContent = '₹0';
            document.getElementById('total').textContent = '₹0';
            updateCartCount();
            return;
        }

        cartItemsDiv.innerHTML = cartItems.map(item => {
            const flower = item.flower || item; // Handle both backend and local formats
            const price = parseFloat(flower.price);
            const id = item.cart_id || flower.flower_id;

            return `
            <div class="cart-item-card">
                <div class="item-image">
                    <img src="${flower.image_url || 'https://via.placeholder.com/100'}" alt="${flower.name}">
                </div>
                <div class="item-details">
                    <div class="item-name-row">
                        <h3>${flower.name}</h3>
                        <button class="remove-btn" onclick="removeFromCart(${id})">✕</button>
                    </div>
                    <p class="item-price-unit">₹${price} / unit</p>
                    <div class="item-action-row">
                        <div class="quantity-controls">
                            <button class="qty-btn minus" onclick="updateQuantity(${id}, ${item.quantity - 1})">−</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus" onclick="updateQuantity(${id}, ${item.quantity + 1})">+</button>
                        </div>
                        <p class="item-subtotal">₹${(price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        updateCartSummary(cartItems);
        updateCartCount();
    } catch (error) {
        console.error('Error loading cart:', error);
        cartItemsDiv.innerHTML = '<p class="error">Failed to load cart items. Please login again.</p>';
    }
}

function updateCartSummary(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => {
        const flower = item.flower || item;
        return sum + (parseFloat(flower.price) * item.quantity);
    }, 0);

    const delivery = subtotal > 0 ? 50 : 0;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${(subtotal + delivery).toFixed(2)}`;
}

async function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    let count = 0;
    try {
        if (auth.isLoggedIn()) {
            const items = await api.getCart();
            count = items.reduce((sum, item) => sum + item.quantity, 0);
        } else {
            const cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            count = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        cartCount.textContent = count;
    } catch (e) {
        console.warn("Could not update cart count");
    }
}

async function updateQuantity(id, newQuantity) {
    if (newQuantity <= 0) {
        return removeFromCart(id);
    }

    try {
        if (auth.isLoggedIn()) {
            await api.updateCartQuantity(id, newQuantity);
        } else {
            let cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            const item = cart.find(i => i.flower_id === id);
            if (item) item.quantity = newQuantity;
            localStorage.setItem('florryCart', JSON.stringify(cart));
        }
        loadCartItems();
    } catch (error) {
        alert('Could not update quantity: ' + error.message);
    }
}

async function removeFromCart(id) {
    if (!confirm("Remove this item from cart?")) return;

    try {
        if (auth.isLoggedIn()) {
            await api.deleteCartItem(id);
        } else {
            let cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            cart = cart.filter(item => item.flower_id !== id);
            localStorage.setItem('florryCart', JSON.stringify(cart));
        }
        loadCartItems();
    } catch (error) {
        alert('Could not remove item: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
});
