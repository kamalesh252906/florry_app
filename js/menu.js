// =========================================================
// COMMON UI HANDLERS (Header, Sidebar, Navigation)
// =========================================================

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Logo Click -> Redirect to landing/home
    const logos = document.querySelectorAll('.logo-premium');
    logos.forEach(logo => {
        logo.addEventListener('click', () => {
            // Depending on where we are, the path might differ. 
            // But usually it's ./landing.html in pages/ and index.html in root.
            // For consistency in pages, let's look at the filename
            if (window.location.pathname.includes('/pages/')) {
                window.location.href = './landing.html';
            } else {
                window.location.href = './index.html';
            }
        });
    });

    // Toggle Menu Buttons
    const menuBtns = document.querySelectorAll('[onclick="toggleMenu()"], .menu-toggle-btn');
    menuBtns.forEach(btn => {
        // Remove the onclick attribute if we want to be fully external
        btn.removeAttribute('onclick');
        btn.addEventListener('click', toggleMenu);
    });

    // Close Menu Buttons
    const closeBtns = document.querySelectorAll('.close-btn, .overlay');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', toggleMenu);
    });

    // Cart Button Click
    const cartBtns = document.querySelectorAll('.header-actions .icon-btn:not(.menu-toggle-btn)');
    cartBtns.forEach(btn => {
        if (btn.textContent.includes('☰')) return; // handled by menu toggle
        btn.addEventListener('click', () => {
            window.location.href = './cart.html';
        });
    });

    // Generic "Continue Shopping" or "Back to Store" buttons
    const shopBtns = document.querySelectorAll('.shop-btn, .continue-btn');
    shopBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = './landing.html';
        });
    });

    // Logout Link in Sidebar
    const logoutBtn = document.querySelector('.sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Since we use ES Mobules for auth, we need to import it
            import('./auth.js').then(m => m.auth.logout());
        });
    }
});

// Keep toggleMenu global for any legacy onclicks I might miss, 
// but eventually they should all be removed.
window.toggleMenu = toggleMenu;
