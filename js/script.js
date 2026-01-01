// Main application logic
let currentShopId = localStorage.getItem('florryShopId'); // Persist shop selection

async function loadShops() {
    const grid = document.getElementById('shops-grid');
    if (!grid) return;

    // Ensure correct view state
    const shopsSec = document.getElementById('shops-section');
    const filtersSec = document.getElementById('filters-section');
    const productsSec = document.getElementById('main-products-section');

    if (shopsSec) shopsSec.style.display = 'block';
    if (filtersSec) filtersSec.style.display = 'none';
    if (productsSec) productsSec.style.display = 'none';

    grid.innerHTML = '<p class="loading">Locating you to find nearby shops...</p>';

    // Get Location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            await fetchShops(lat, lng);
        }, async (error) => {
            console.warn("Location access denied or failed", error);
            grid.innerHTML = '<p class="loading">Location denied. Showing all shops...</p>';
            await fetchShops(); // Fallback to all
        });
    } else {
        await fetchShops();
    }
}

async function fetchShops(lat = null, lng = null) {
    const grid = document.getElementById('shops-grid');
    try {
        const params = {};
        if (lat && lng) {
            params.lat = lat;
            params.lng = lng;
            params.radius = 20; // 20km radius default
        }

        const shops = await api.getAdmins(params);

        // Filter only those with shop_name or assume all admins are shops
        const validShops = shops;

        if (validShops.length === 0) {
            grid.innerHTML = '<p>No shops found nearby.</p>';
            return;
        }

        grid.innerHTML = validShops.map(shop => `
           <div class="product-card shop-card fade-in" onclick="selectShop(${shop.admin_id}, '${shop.shop_name}')">
                ${shop.shop_image_url
                ? `<img src="${shop.shop_image_url}" class="product-image" alt="${shop.shop_name}">`
                : `<div class="shop-icon" style="height:260px; display:flex; align-items:center; justify-content:center; background:#f8faf9; font-size:4rem;">🏪</div>`
            }
                <div class="product-info">
                     <h3>${shop.shop_name || 'Florry Partner'}</h3>
                     <p>${shop.name || 'Artisan Florist'}</p>
                     ${(lat && shop.latitude) ? `
                        <div style="display:inline-block; background:#f0fdf4; color:#1e5128; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700; margin-top:10px;">
                            📍 ${calculateDistance(lat, lng, shop.latitude, shop.longitude).toFixed(1)} km away
                        </div>` : ''}
                     <button class="visit-btn">Visit Boutique</button>
                </div>
           </div>
        `).join('');
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p>Error loading shops.</p>';
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function selectShop(id, name) {
    currentShopId = id;
    localStorage.setItem('florryShopId', id);
    if (name) localStorage.setItem('florryShopName', name);

    // Update UI
    const shopHeading = document.querySelector('#main-products-section h2');
    if (shopHeading) shopHeading.textContent = (name || 'Shop') + "'s Collection";

    const shopsSec = document.getElementById('shops-section');
    const filtersSec = document.getElementById('filters-section');
    const productsSec = document.getElementById('main-products-section');

    if (shopsSec) shopsSec.style.display = 'none';
    if (filtersSec) filtersSec.style.display = 'block';
    if (productsSec) productsSec.style.display = 'block';

    loadProducts('all');
}

function backToShops() {
    currentShopId = null;
    localStorage.removeItem('florryShopId');
    loadShops();
}

async function loadProducts(category = 'all') {
    if (!currentShopId) {
        // If no shop selected, try to load shops
        loadShops();
        return;
    }

    const grid = document.getElementById('products-grid');
    if (!grid) return;

    try {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">Loading flowers...</p>';

        const flowers = await api.getFlowers(currentShopId);

        const filteredFlowers = category === 'all'
            ? flowers
            : flowers.filter(f => f.category === category);

        if (filteredFlowers.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No flowers available in this shop.</p>';
            return;
        }

        grid.innerHTML = filteredFlowers.map(flower => `
            <div class="product-card fade-in">
                <img src="${flower.image_url || 'https://images.unsplash.com/photo-1596073413225-300fa13ec6f1?auto=format&fit=crop&q=80'}" 
                     alt="${flower.name}" 
                     class="product-image"
                     onerror="this.src='https://images.unsplash.com/photo-1596073413225-300fa13ec6f1?auto=format&fit=crop&q=80'">
                <div class="product-info">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 class="product-name">${flower.name}</h3>
                        <span style="font-size: 0.8rem; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; color: #64748b; font-weight: 600;">${flower.weight_grams}g</span>
                    </div>
                    <p class="product-description">${flower.description || 'A beautiful, hand-picked selection of fresh seasonal blooms.'}</p>
                    <div class="product-footer">
                        <span class="product-price">₹${flower.price}</span>
                        <button class="add-to-cart-btn" onclick="addToCart(${flower.flower_id}, '${flower.name}', ${flower.price})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading flowers:', error);
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: red;">Failed to load flowers. Please try again.</p>';
    }
}

function filterFlowers(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadProducts(category);
}

async function addToCart(flowerId, flowerName, price) {
    if (auth.isLoggedIn()) {
        const userId = auth.getUserId();
        if (userId) {
            try {
                await api.addToCart({
                    user_id: userId,
                    flower_id: flowerId,
                    quantity: 1
                });
                alert(`${flowerName} added to cart!`);
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Failed to add to cart. Please try again.');
            }
        } else {
            // Should not happen with new strict isLoggedIn check, but safe fallback
            console.error("Logged in but no user ID found. Redirecting to login.");
            auth.logout();
        }
    } else {
        let cart = JSON.parse(localStorage.getItem('florryCart')) || [];
        const existingItem = cart.find(item => item.flower_id === flowerId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                flower_id: flowerId,
                name: flowerName,
                price: price,
                quantity: 1
            });
        }

        localStorage.setItem('florryCart', JSON.stringify(cart));
        alert(`${flowerName} added to cart!`);
    }

    updateCartCount();
}

async function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    if (auth.isLoggedIn()) {
        try {
            const cartItems = await api.getCart();
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        } catch (error) {
            console.error('Error updating cart count:', error);
            // Fallback to local storage or 0 on error
            const cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    } else {
        const cart = JSON.parse(localStorage.getItem('florryCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const grid = document.getElementById('products-grid');

            try {
                const flowers = await api.getFlowers();
                const filtered = flowers.filter(flower =>
                    flower.name.toLowerCase().includes(searchTerm) ||
                    (flower.description && flower.description.toLowerCase().includes(searchTerm)) ||
                    (flower.category && flower.category.toLowerCase().includes(searchTerm))
                );

                if (filtered.length > 0) {
                    grid.innerHTML = filtered.map(flower => `
                        <div class="product-card">
                            <img src="${flower.image_url || 'https://via.placeholder.com/400x250?text=' + flower.name}" 
                                 alt="${flower.name}" 
                                 class="product-image">
                            <div class="product-info">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <h3 class="product-name">${flower.name}</h3>
                                    <span style="font-size: 0.8rem; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; color: #64748b; font-weight: 600;">${flower.weight_grams}g</span>
                                </div>
                                <p class="product-description">${flower.description || ''}</p>
                                <div class="product-footer">
                                    <span class="product-price">₹${flower.price}</span>
                                    <button class="add-to-cart-btn" onclick="addToCart(${flower.flower_id}, '${flower.name}', ${flower.price})">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No flowers found.</p>';
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        });
    }


    // Initial Load Logic - ONLY if on a page that supports shops (like landing.html)
    if (document.getElementById('shops-grid')) {
        if (localStorage.getItem('florryShopId')) {
            const id = localStorage.getItem('florryShopId');
            const name = localStorage.getItem('florryShopName');
            selectShop(id, name);
        } else {
            loadShops();
        }
    }
    updateCartCount();
});
