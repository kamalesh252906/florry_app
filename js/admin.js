let flowerImageUploader, shopImageUploader;

document.addEventListener('DOMContentLoaded', () => {
    const admin = JSON.parse(localStorage.getItem('florryAdmin'));
    if (!admin || !admin.admin_id) {
        window.location.href = './admin_login.html';
        return;
    }

    loadAdminProducts();
    loadAdminOrders();

    // Show shop name
    const shopMsg = document.getElementById('shop-welcome-msg');
    if (shopMsg && admin.shop_name) {
        shopMsg.textContent = `Shop: ${admin.shop_name}`;
    }

    // Initialize Flower Image Uploader
    flowerImageUploader = new ImageUploader('flower-image-dropzone', null, 'flower-image-input');
    document.getElementById('flower-image-dropzone').addEventListener('imageUploaded', (e) => {
        document.getElementById('flower-image-url').value = e.detail.url;
    });

    // Initialize Shop Settings Image Uploader
    shopImageUploader = new ImageUploader('shop-image-dropzone', null, 'shop-image-input-file');
    document.getElementById('shop-image-dropzone').addEventListener('imageUploaded', (e) => {
        document.getElementById('shop-settings-image-url').value = e.detail.url;
    });
});

async function loadAdminOrders() {
    const grid = document.getElementById('admin-orders-grid');
    if (!grid) return;
    grid.innerHTML = '<p>Loading orders...</p>';

    try {
        const admin = JSON.parse(localStorage.getItem('florryAdmin'));
        if (!admin || !admin.admin_id) {
            grid.innerHTML = '<p>Please login first</p>';
            return;
        }

        const orders = await api.getAdminOrders();
        orders.sort((a, b) => b.order_id - a.order_id);

        if (orders.length === 0) {
            grid.innerHTML = '<p>No orders for your shop yet.</p>';
            return;
        }

        grid.innerHTML = orders.map(order => `
             <div class="admin-card" style="border: 1px solid #eee; margin-bottom: 15px;">
                <div class="admin-card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <h3 style="margin: 0;">Order #${order.order_id}</h3>
                            <p class="status" style="margin: 5px 0;">Status: <b style="text-transform:uppercase">${order.order_status || 'PLACED'}</b></p>
                        </div>
                        <p class="price" style="font-weight: bold; color: #2ecc71; font-size: 1.2em; margin: 0;">₹${order.total_amount}</p>
                    </div>

                    <div class="customer-info" style="background: #fdf2f2; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ff6b6b; position: relative; overflow: hidden;">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.9em; color: #ff6b6b; text-transform: uppercase; letter-spacing: 1px;">📍 Delivery Details</h4>
                        ${(order.order_status === 'accepted' || order.order_status === 'out_for_delivery' || order.order_status === 'completed') ? `
                            <p style="margin: 4px 0; font-weight: 600;">${order.user?.name || 'Customer'}</p>
                            <p style="margin: 4px 0; color: #555;">📞 ${order.user?.phone || 'No phone'}</p>
                            <p style="margin: 4px 0; font-size: 0.9em; color: #666;">🏠 ${order.delivery_address || 'No address'}</p>
                        ` : `
                            <div style="filter: blur(4px); opacity: 0.6; pointer-events: none;">
                                <p style="margin: 4px 0; font-weight: 600;">Customer Name</p>
                                <p style="margin: 4px 0; color: #555;">📞 +91 XXXXX XXXXX</p>
                                <p style="margin: 4px 0; font-size: 0.9em; color: #666;">🏠 Masked Address, Bloom City</p>
                            </div>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -10%); font-size: 0.75rem; color: #ff6b6b; font-weight: 800; text-align: center; width: 100%;">
                                ACCEPT ORDER TO VIEW DETAILS
                            </div>
                        `}
                    </div>

                    <div class="items-list" style="margin-bottom: 15px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.9em; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">🛒 Items Ordered</h4>
                        <div style="font-size: 0.95em;">
                            ${order.items.map(item => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span>${item.flower?.name || 'Item'} <b style="color: #666;">x ${item.quantity}</b></span>
                                    <span>₹${item.subtotal}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <p style="font-size: 0.8em; color: #999; margin-bottom: 15px;">Ordered at: ${new Date(order.ordered_at).toLocaleString()}</p>
                    
                    <div class="admin-actions" style="display: flex; gap: 8px;">
                        ${order.order_status === 'created' || order.order_status === 'pending' || !order.order_status ?
                `<button class="edit-btn" style="background:#27ae60; color:white; flex: 1;" onclick="shopAcceptOrder(${order.order_id})">✅ Accept Order</button>` : ''
            }
                        ${order.order_status === 'accepted' ?
                `<button class="edit-btn" style="background:#3498db; color:white; flex: 1;" onclick="shopOutForDelivery(${order.order_id})">🚚 Mark Out for Delivery</button>` : ''
            }
                        ${order.order_status === 'out_for_delivery' ?
                `<button class="edit-btn" style="background:#f39c12; color:white; flex: 1;" onclick="shopCompleteOrder(${order.order_id})">🎯 Mark Completed</button>` : ''
            }
                        ${order.order_status === 'completed' ?
                `<button class="edit-btn" style="background:#e74c3c; color:white; flex: 1;" onclick="deleteAdminOrder(${order.order_id})">🗑️ Delete Order Record</button>` : ''
            }
                    </div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p>Error loading orders</p>';
    }
}

async function shopAcceptOrder(orderId) {
    if (!confirm("Accept this order?")) return;
    try {
        await api.shopAcceptOrder(orderId);
        loadAdminOrders();
    } catch (e) {
        alert(e.message);
    }
}

async function shopOutForDelivery(orderId) {
    if (!confirm("Is this order ready for delivery?")) return;
    try {
        await api.outForDelivery(orderId);
        loadAdminOrders();
    } catch (e) {
        alert(e.message);
    }
}

async function shopCompleteOrder(orderId) {
    if (!confirm("Has this order been delivered successfully?")) return;
    try {
        await api.completeOrder(orderId);
        loadAdminOrders();
    } catch (e) {
        alert(e.message);
    }
}

async function deleteAdminOrder(orderId) {
    if (!confirm("Are you sure you want to delete this order record? This action cannot be undone.")) return;
    try {
        await api.deleteOrder(orderId);
        loadAdminOrders();
    } catch (e) {
        alert("Failed to delete order: " + e.message);
    }
}


async function loadAdminProducts() {
    const grid = document.getElementById('admin-grid');
    grid.innerHTML = '<p>Loading...</p>';

    try {
        const admin = JSON.parse(localStorage.getItem('florryAdmin'));
        if (!admin || !admin.admin_id) {
            grid.innerHTML = '<p>Please login first</p>';
            return;
        }

        // Get only THIS admin's flowers
        const allFlowers = await api.getFlowers();
        const flowers = allFlowers.filter(f => f.admin_id === admin.admin_id);

        if (flowers.length === 0) {
            grid.innerHTML = '<p>No products found. Click "Add New Flower" to start!</p>';
            return;
        }

        grid.innerHTML = flowers.map(flower => `
            <div class="admin-card">
                <img src="${flower.image_url || 'https://via.placeholder.com/400'}" alt="${flower.name}">
                <div class="admin-card-body">
                    <h3>${flower.name}</h3>
                    <p class="price">₹${flower.price}</p>
                    <p class="category" style="color: #666; font-size: 0.9em; text-transform: capitalize;">${flower.category}</p>
                    <div class="admin-actions">
                        <button class="edit-btn" onclick='openModal(${JSON.stringify(flower).replace(/'/g, "&#39;")})'>Edit</button>
                        <button class="delete-btn" onclick="deleteFlower(${flower.flower_id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading admin products:', error);
        grid.innerHTML = '<p style="color: red">Failed to load products.</p>';
    }
}

function openModal(flower = null) {
    const modal = document.getElementById('flower-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('flower-form');

    // Reset form
    form.reset();

    if (flower) {
        title.textContent = 'Edit Flower';
        document.getElementById('flower-id').value = flower.flower_id;
        document.getElementById('flower-name').value = flower.name;
        document.getElementById('flower-category').value = flower.category; // Ensure value matches option values
        document.getElementById('flower-price').value = flower.price;
        document.getElementById('flower-image-url').value = flower.image_url;
        if (flower.image_url) {
            flowerImageUploader.showPreview(flower.image_url);
        } else {
            flowerImageUploader.resetDropZone();
        }
        document.getElementById('flower-description').value = flower.description || '';
    } else {
        title.textContent = 'Add New Flower';
        document.getElementById('flower-id').value = '';
        document.getElementById('flower-image-url').value = '';
        flowerImageUploader.resetDropZone();
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('flower-modal').classList.remove('active');
}

async function handleSaveFlower(event) {
    event.preventDefault();

    const admin = JSON.parse(localStorage.getItem('florryAdmin'));
    if (!admin || !admin.admin_id) {
        alert('Please login first');
        return;
    }

    const id = document.getElementById('flower-id').value;
    const imageUrl = document.getElementById('flower-image-url').value;

    if (!imageUrl) {
        alert('Please upload a flower image');
        return;
    }

    const flowerData = {
        name: document.getElementById('flower-name').value,
        category: document.getElementById('flower-category').value,
        price: parseFloat(document.getElementById('flower-price').value),
        image_url: imageUrl,
        description: document.getElementById('flower-description').value,
        admin_id: admin.admin_id, // Use logged-in admin's ID
        stock_quantity: 100 // Default
    };

    const btn = event.target.querySelector('.save-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        if (id) {
            await api.updateFlower(parseInt(id), flowerData);
            alert('Flower updated successfully!');
        } else {
            await api.createFlower(flowerData);
            alert('Flower created successfully!');
        }
        closeModal();
        loadAdminProducts();
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save flower: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function deleteFlower(id) {
    if (!confirm('Are you sure you want to delete this flower?')) return;

    try {
        await api.deleteFlower(id);
        loadAdminProducts(); // Refresh list
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete flower: ' + error.message);
    }
}

async function openShopModal() {
    const modal = document.getElementById('shop-modal');
    const admin = JSON.parse(localStorage.getItem('florryAdmin'));
    if (!admin) {
        alert("Please login first");
        return;
    }

    try {
        const freshAdmin = await api.getAdmin(admin.admin_id);
        document.getElementById('shop-name-input').value = freshAdmin.shop_name || '';
        document.getElementById('shop-settings-image-url').value = freshAdmin.shop_image_url || '';
        if (freshAdmin.shop_image_url) {
            shopImageUploader.showPreview(freshAdmin.shop_image_url);
        } else {
            shopImageUploader.resetDropZone();
        }
    } catch (e) {
        console.error("Failed to fetch admin details", e);
        document.getElementById('shop-name-input').value = admin.shop_name || '';
    }

    modal.classList.add('active');
}

function closeShopModal() {
    document.getElementById('shop-modal').classList.remove('active');
}

async function handleSaveShopSettings(event) {
    event.preventDefault();
    const btn = event.target.querySelector('.save-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const admin = JSON.parse(localStorage.getItem('florryAdmin'));
        const shopName = document.getElementById('shop-name-input').value;
        const shopImage = document.getElementById('shop-settings-image-url').value;

        const updateData = {
            shop_name: shopName,
            shop_image_url: shopImage
        };

        const updated = await api.updateAdmin(admin.admin_id, updateData);
        localStorage.setItem('florryAdmin', JSON.stringify(updated));

        alert("Shop settings updated successfully!");
        closeShopModal();
    } catch (e) {
        alert("Failed to update: " + e.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}


