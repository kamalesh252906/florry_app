document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;
    loadOrders();
});

async function loadOrders() {
    const list = document.getElementById('orders-list');
    const noOrders = document.getElementById('no-orders');

    if (!list) return;

    list.innerHTML = '<div class="loading-spinner"> Fetching your orders...</div>';

    try {
        const myOrders = await api.getOrders();

        if (!myOrders || myOrders.length === 0) {
            list.style.display = 'none';
            if (noOrders) noOrders.style.display = 'block';
            return;
        }

        if (noOrders) noOrders.style.display = 'none';
        list.style.display = 'block';

        // Sort by date desc
        myOrders.sort((a, b) => new Date(b.ordered_at) - new Date(a.ordered_at));

        list.innerHTML = myOrders.map(order => `
            <div class="order-card-premium">
                <div class="order-card-header">
                    <div class="order-id-block">
                        <span class="order-label">Order</span>
                        <span class="order-id">#${order.order_id}</span>
                        <span class="order-date">${new Date(order.ordered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="order-status-block">
                        <span class="status-badge ${order.order_status || 'pending'}">
                            ${getOrderStatusText(order.order_status)}
                        </span>
                    </div>
                </div>
                
                <div class="order-card-body">
                    <div class="items-preview">
                        ${order.items.map(item => `
                            <div class="item-row">
                                <div class="item-info">
                                    <span class="item-name">${item.flower ? item.flower.name : 'Flower Item'}</span>
                                    <span class="item-qty">x ${item.quantity}</span>
                                </div>
                                <span class="item-price">₹${item.subtotal || (item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-delivery-info">
                        <p><strong>📍 Delivery Address:</strong> ${order.delivery_address || 'Address not specified'}</p>
                        <p><strong> Payment:</strong> ${order.payment_method || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="order-card-footer">
                    <div class="total-block">
                        <span class="total-label">Grand Total</span>
                        <span class="total-value">₹${parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
        list.innerHTML = `
            <div class="error-msg">
                <p> Oops! Failed to load orders.</p>
                <button onclick="loadOrders()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

function getOrderStatusText(status) {
    if (!status) return 'Processing';
    const s = status.toLowerCase();
    const map = {
        'created': 'Order Placed',
        'accepted': 'Confirmed by Shop',
        'packed': 'Ready for Pickup',
        'out_for_delivery': 'Out for Delivery ',
        'completed': 'Delivered ',
        'cancelled': 'Cancelled '
    };
    return map[s] || status.toUpperCase();
}
