// =========================================================
// FLORY MAIN SCRIPT
// This file handles the home page, shop listing, and products
// =========================================================

import { api } from './api.js';
import { auth } from './auth.js';

// Keep track of which shop receives the order
let currentShopId = localStorage.getItem('florryShopId');

/* ---------------------------------------------------------
   HELPER FUNCTIONS FOR BUTTON LOADING EFFECTS
--------------------------------------------------------- */
function showBtnLoading(btn) {
    if (!btn) return;
    btn.dataset.originalText = btn.innerHTML; // Save old text
    btn.classList.add('btn-loading'); // Add spinner style
}

function hideBtnLoading(btn) {
    if (!btn) return;
    btn.classList.remove('btn-loading'); // Remove spinner
    // Determine if we should restore text or show success
    // For now, just restore text to be safe
    // btn.innerHTML = btn.dataset.originalText;
}


/* ---------------------------------------------------------
   SHOP LOGIC (Boutiques)
--------------------------------------------------------- */

// Helper to switch views between shops and products
function showSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.classList.remove('hidden');
}

function hideSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.classList.add('hidden');
}

// 1. Find and show shops near the user
export async function loadShops() {
    const shopGrid = document.getElementById('shops-grid');
    if (!shopGrid) return;

    // Reset view to show shops list
    showSection('shops-section');
    hideSection('filters-section');
    hideSection('main-products-section');

    shopGrid.innerHTML = '<p class="loading">Locating you to find nearby shops...</p>';

    // Try to get user's location with a timeout
    if (navigator.geolocation) {
        let locationFound = false;

        // Set a 5-second timeout for GPS
        const gpsTimeout = setTimeout(() => {
            if (!locationFound) {
                console.warn("GPS request timed out. Falling back to all shops.");
                shopGrid.innerHTML = '<p class="loading">Location taking too long. Showing all shops...</p>';
                fetchShops();
            }
        }, 5000);

        navigator.geolocation.getCurrentPosition(async (position) => {
            locationFound = true;
            clearTimeout(gpsTimeout);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            await fetchShops(lat, lng);
        }, async (error) => {
            locationFound = true;
            clearTimeout(gpsTimeout);
            console.warn("Location check failed", error);
            shopGrid.innerHTML = '<p class="loading">Could not find location. Showing all shops...</p>';
            await fetchShops(); // Show all shops if location fails
        }, { timeout: 10000 }); // Hardware timeout 10s
    } else {
        await fetchShops();
    }
}



// 2. Get the list of shops from the server
async function fetchShops(lat = null, lng = null) {
    const shopGrid = document.getElementById('shops-grid');
    try {
        const params = {};
        // If we have location, ask server to filter by radius
        if (lat && lng) {
            params.lat = lat;
            params.lng = lng;
            params.radius = 20; // Search within 20km
        }

        const shops = await api.getAdmins(params);

        if (shops.length === 0) {
            shopGrid.innerHTML = '<p>No shops found nearby.</p>';
            return;
        }

        shopGrid.innerHTML = shops.map(shop => `
           <div class="product-card shop-card fade-in" data-id="${shop.admin_id}" data-name="${shop.shop_name}">
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

        // Event Delegation for Shops
        shopGrid.onclick = (e) => {
            const card = e.target.closest('.shop-card');
            if (card) {
                selectShop(card, card.dataset.id, card.dataset.name);
            }
        };

    } catch (e) {
        console.error(e);
        shopGrid.innerHTML = '<p>Error loading shops.</p>';
    }
}

// Helper: Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// 3. Select a shop and show its products
export function selectShop(cardElement, id, name) {
    // Note: cardElement is the clicked div
    // We don't really need a spinner here because it's instant client-side switch
    // unless we await loadProducts. 
    // But since it's a div click, we can't easily put a spinner on the whole card.

    currentShopId = id;
    localStorage.setItem('florryShopId', id);
    if (name) localStorage.setItem('florryShopName', name);

    // Update Header
    const shopHeading = document.querySelector('#main-products-section h2');
    if (shopHeading) shopHeading.textContent = (name || 'Shop') + "'s Collection";

    // Switch Views
    hideSection('shops-section');
    showSection('filters-section');
    showSection('main-products-section');


    // Load flowers for this shop
    loadProducts('all');
}

export function backToShops() {
    currentShopId = null;
    localStorage.removeItem('florryShopId');
    loadShops();
}

/* ---------------------------------------------------------
   PRODUCT LOGIC (Flowers)
--------------------------------------------------------- */

export async function loadProducts(category = 'all') {
    if (!currentShopId) {
        loadShops();
        return;
    }

    const grid = document.getElementById('products-grid');
    if (!grid) return;

    try {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">Loading flowers...</p>';

        // Fetch flowers from API
        const flowers = await api.getFlowers(currentShopId);

        // Filter by category
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
                        <button class="add-to-cart-btn" 
                                data-id="${flower.flower_id}" 
                                data-name="${flower.name}" 
                                data-price="${flower.price}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Event Delegation for Products
        grid.onclick = (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (btn) {
                addToCart(btn, btn.dataset.id, btn.dataset.name, btn.dataset.price);
            }
        };

    } catch (error) {
        console.error('Error loading flowers:', error);
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: red;">Failed to load flowers. Please try again.</p>';
    }
}

export function filterFlowers(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (btnElement) btnElement.classList.add('active');
    loadProducts(category);
}

/* ---------------------------------------------------------
   CART LOGIC
--------------------------------------------------------- */

export async function addToCart(btnElement, flowerId, flowerName, price) {
    // Show spinner on button
    if (!flowerId) {
        console.error("No flower ID provided");
        return;
    }
    showBtnLoading(btnElement);

    try {
        if (auth.isLoggedIn()) {
            const userId = auth.getUserId();
            if (userId) {
                // Add to server cart
                await api.addToCart({
                    user_id: userId,
                    flower_id: flowerId,
                    quantity: 1
                });
                alert(`${flowerName} added to cart!`);
            } else {
                auth.logout();
            }
        } else {
            // Add to local storage cart
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

        // Update badge
        await updateCartCount();

    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart. Please try again.');
    } finally {
        // Stop spinner
        hideBtnLoading(btnElement);
    }
}

// Update the red badge count
async function updateCartCount() {
    const badgeElement = document.getElementById('cart-count');
    if (!badgeElement) return;

    let totalCount = 0;

    try {
        if (auth.isLoggedIn()) {
            const items = await api.getCart();
            totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        } else {
            const cart = JSON.parse(localStorage.getItem('florryCart')) || [];
            totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        // Logic for red badge visibility
        if (totalCount > 0) {
            badgeElement.textContent = totalCount;
            badgeElement.classList.remove('hidden');
        } else {
            badgeElement.classList.add('hidden');
        }
    } catch (e) {
        console.warn("Could not update cart count");
    }
}



// Expose key functions to window for onclick handlers in HTML
window.loadShops = loadShops;
window.selectShop = selectShop;
window.backToShops = backToShops;
window.loadProducts = loadProducts;
window.filterFlowers = filterFlowers;
window.addToCart = addToCart;
window.auth = auth; // Expose auth for logout

/* ---------------------------------------------------------
   INITIALIZATION & SEARCH
--------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');

    async function handleSearch() {
        if (!searchInput) return;
        const term = searchInput.value.toLowerCase().trim();

        // Show loading on search button
        showBtnLoading(searchBtn);

        try {
            if (!term) {
                if (currentShopId) loadProducts('all');
                else loadShops();
                return;
            }

            if (currentShopId) {
                // Search Flowers inside a shop
                const grid = document.getElementById('products-grid');
                if (grid) {
                    grid.innerHTML = '<p class="loading" style="grid-column: 1/-1; text-align: center;">Searching flowers...</p>';
                    const flowers = await api.getFlowers(currentShopId);
                    const filtered = flowers.filter(flower =>
                        flower.name.toLowerCase().includes(term) ||
                        (flower.description && flower.description.toLowerCase().includes(term))
                    );

                    if (filtered.length > 0) {
                        grid.innerHTML = filtered.map(flower => `
                            <!-- Same card structure as loadProducts -->
                            <div class="product-card fade-in">
                                <img src="${flower.image_url || 'https://images.unsplash.com/photo-1596073413225-300fa13ec6f1?auto=format&fit=crop&q=80'}" alt="${flower.name}" class="product-image">
                                <div class="product-info">
                                    <h3 class="product-name">${flower.name}</h3>
                                    <div class="product-footer">
                                        <span class="product-price">₹${flower.price}</span>
                                        <button class="add-to-cart-btn" 
                                                data-id="${flower.flower_id}" 
                                                data-name="${flower.name}" 
                                                data-price="${flower.price}">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No matching flowers found.</p>';
                    }
                }
            } else {
                // Search Shops
                const grid = document.getElementById('shops-grid');
                if (grid) {
                    grid.innerHTML = '<p class="loading" style="grid-column: 1/-1; text-align: center;">Searching boutiques...</p>';
                    const shops = await api.getAdmins();
                    const filtered = shops.filter(shop =>
                        (shop.shop_name && shop.shop_name.toLowerCase().includes(term)) ||
                        (shop.name && shop.name.toLowerCase().includes(term))
                    );

                    if (filtered.length > 0) {
                        grid.innerHTML = filtered.map(shop => `
                           <div class="product-card shop-card fade-in" data-id="${shop.admin_id}" data-name="${shop.shop_name}">
                                <div class="product-info">
                                     <h3>${shop.shop_name}</h3>
                                     <button class="visit-btn">Visit Boutique</button>
                                </div>
                           </div>
                        `).join('');
                    } else {
                        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No boutiques found.</p>';
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            hideBtnLoading(searchBtn);
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // Event Listeners
    const backBtn = document.getElementById('btn-back-to-shops');
    if (backBtn) backBtn.addEventListener('click', backToShops);

    const filterGroup = document.getElementById('filter-group');
    if (filterGroup) {
        filterGroup.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                filterFlowers(btn.dataset.category, btn);
            }
        });
    }

    // Load initial state
    if (document.getElementById('shops-grid')) {
        if (localStorage.getItem('florryShopId')) {
            const id = localStorage.getItem('florryShopId');
            const name = localStorage.getItem('florryShopName');
            selectShop(null, id, name);
        } else {
            loadShops();
        }
    }
    updateCartCount();
});
