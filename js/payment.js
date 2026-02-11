import { api } from './api.js';
import { auth } from './auth.js';

async function loadOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;

    try {
        let cartItems = [];

        if (auth.isLoggedIn()) {
            cartItems = await api.getCart();
        } else {
            cartItems = JSON.parse(localStorage.getItem('florryCart')) || [];
            // For guest, we'd need to fetch flower details to show price
            for (let item of cartItems) {
                const flower = await api.getFlower(item.flower_id);
                item.name = flower.name;
                item.price = parseFloat(flower.price);
            }
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            window.location.href = './cart.html';
            return;
        }

        orderSummary.innerHTML = cartItems.map(item => {
            const flower = item.flower || item;
            return `
            <div class="order-item">
                <span>${flower.name} x ${item.quantity}</span>
                <span>₹${(parseFloat(flower.price) * item.quantity).toFixed(2)}</span>
            </div>
        `}).join('');

        const subtotal = cartItems.reduce((sum, item) => {
            const flower = item.flower || item;
            return sum + (parseFloat(flower.price) * item.quantity);
        }, 0);
        const delivery = 50;
        const total = subtotal + delivery;

        document.getElementById('payment-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('payment-total').textContent = `₹${total.toFixed(2)}`;

    } catch (error) {
        console.error('Error loading order summary:', error);
    }
}

export function detectLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    const btn = document.getElementById('btn-detect-location');
    if (!btn) return;
    const originalText = btn.textContent;
    btn.textContent = 'Locating...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();

            if (data && data.display_name) {
                document.getElementById('delivery-address').value = data.display_name;
                const addr = data.address;
                if (addr.city || addr.town || addr.village) {
                    document.getElementById('delivery-city').value = addr.city || addr.town || addr.village;
                }
                if (addr.postcode) {
                    document.getElementById('delivery-pincode').value = addr.postcode;
                }
                btn.textContent = '📍 Location Found!';
            } else {
                throw new Error('Address not found');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            document.getElementById('delivery-address').value = `Lat: ${latitude}, Long: ${longitude}`;
            alert('Could not fetch address text, but coordinates captured.');
            btn.textContent = '📍 Coords Captured';
        } finally {
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }, (error) => {
        alert('Error getting location: ' + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
    });
}

export async function placeOrder() {
    if (!auth.requireAuth()) return;

    const nameField = document.getElementById('delivery-name');
    const phoneField = document.getElementById('delivery-phone');
    const addressField = document.getElementById('delivery-address');
    const cityField = document.getElementById('delivery-city');
    const pincodeField = document.getElementById('delivery-pincode');

    if (!nameField || !phoneField || !addressField || !cityField || !pincodeField) return;

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const address = addressField.value.trim();
    const city = cityField.value.trim();
    const pincode = pincodeField.value.trim();

    if (!name || !phone || !address || !city || !pincode) {
        alert('Please fill in all delivery details');
        return;
    }

    const paymentMethodInput = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'cod';

    try {
        const cartItems = await api.getCart();

        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const orderItems = cartItems.map(item => ({
            flower_id: item.flower_id,
            quantity: item.quantity
        }));

        const adminId = parseInt(localStorage.getItem('florryShopId')) || null;

        // Sanitize user_id: if it's a string like "superadmin", send null so Pydantic doesn't crash.
        // The backend will use the logged-in user from the token anyway.
        let userId = auth.getUserId();
        if (isNaN(userId)) userId = null;

        const orderData = {
            user_id: userId,
            admin_id: adminId,
            payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay Later',
            order_status: 'created',
            delivery_address: `${address}, ${city}, ${pincode}`,
            delivery_time: new Date().toISOString(),
            items: orderItems
        };

        const response = await api.createOrder(orderData);

        // Clear cart in backend
        for (const item of cartItems) {
            await api.deleteCartItem(item.cart_id);
        }

        alert(`Order placed successfully! ID: ${response.order_id}`);
        window.location.href = './orders.html';

    } catch (error) {
        console.error('Error placing order:', error);
        let msg = error.message;
        if (msg.includes('Not authenticated') || msg.includes('Valid user session required')) {
            msg = "Only Customers can place orders. Please log in as a Customer to continue.";
        }
        alert('Failed to place order: ' + msg);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadOrderSummary();

    const detectBtn = document.getElementById('btn-detect-location');
    if (detectBtn) detectBtn.addEventListener('click', detectLocation);

    const placeBtn = document.getElementById('btn-place-order');
    if (placeBtn) placeBtn.addEventListener('click', placeOrder);

    const backBtn = document.getElementById('btn-return-cart');
    if (backBtn) backBtn.addEventListener('click', () => {
        window.location.href = './cart.html';
    });
});
