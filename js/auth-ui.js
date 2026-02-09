// =========================================================
// AUTHENTICATION UI HANDLERS
// Handles Login/Signup Forms and UI Interactions
// =========================================================

import { api } from './api.js';
import { auth } from './auth.js';
import ImageUploader from './image-uploader.js';

// LOGIN PAGE HANDLER
async function handleUnifiedLogin(event) {
    if (event) event.preventDefault();

    // Get input values
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Get selected role
    const roleInput = document.querySelector('input[name="role"]:checked');
    const role = roleInput ? roleInput.value : 'user';

    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Verifying...';
    btn.disabled = true;
    btn.classList.add('btn-loading');

    try {
        let response;

        // Call different API based on role
        if (role === 'user') {
            response = await api.loginUser(email, password);
            auth.saveUser({ ...response.user, access_token: response.access_token }, 'user');
            await auth.mergeCart();
            alert('✓ Welcome back!');
            window.location.href = './landing.html';

        } else if (role === 'admin') {
            response = await api.loginAdmin(email, password);
            auth.saveUser({ ...response.admin, access_token: response.access_token }, 'admin');
            alert('✓ Shop Partner Login Successful');
            window.location.href = './admin_dashboard.html';

        } else if (role === 'super_admin') {
            response = await api.superAdminLogin(email, password);
            auth.saveUser({ ...response.super_admin, access_token: response.access_token }, 'super_admin');
            alert('✓ Super Admin Access Granted');
            window.location.href = './super_admin_dashboard.html';
        }

    } catch (error) {
        alert('Login failed: ' + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove('btn-loading');
    }
}

// SIGNUP PAGE HANDLER
async function handleUnifiedSignup(event) {
    if (event) event.preventDefault();

    // Get selected role
    const roleInput = document.querySelector('input[name="role"]:checked');
    const role = roleInput ? roleInput.value : 'user';

    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Creating Account...';
    btn.disabled = true;
    btn.classList.add('btn-loading');

    try {
        if (role === 'user') {
            // CUSTOMER SIGNUP
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const password = document.getElementById('signup-password').value;

            await api.createUser({
                name: name,
                email: email,
                phone: phone,
                password: password
            });

            alert('✓ Account created! Please login.');
            window.location.href = './login.html';

        } else if (role === 'admin') {
            // SHOP PARTNER SIGNUP
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const password = document.getElementById('signup-password').value;

            // Shop specific
            const shopName = document.getElementById('signup-shop-name').value.trim();
            const shopImage = document.getElementById('shop-image-url').value;
            const aadhaarNum = document.getElementById('aadhaar-number').value.trim();
            const aadhaarImage = document.getElementById('aadhaar-image-url').value;
            const lat = document.getElementById('latitude').value;
            const lng = document.getElementById('longitude').value;

            // Validations
            if (!shopName) throw new Error("Shop Name is required");
            if (!lat || !lng) throw new Error("Please capture GPS location");
            if (!shopImage) throw new Error("Please upload a shop photo");

            // API Call
            await api.createAdmin({
                name: name,
                email: email,
                phone: phone,
                password: password,
                shop_name: shopName,
                shop_image_url: shopImage,
                aadhaar_number: aadhaarNum,
                aadhaar_image_url: aadhaarImage,
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            });

            alert('✓ Partnership request submitted! Pending approval.');
            window.location.href = './login.html';
        }

    } catch (error) {
        alert('Signup failed: ' + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove('btn-loading');
    }
}

// Role Selector Logic
function selectRole(event, role) {
    if (event) {
        // Update UI
        document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
        event.currentTarget.classList.add('active');

        // Check the hidden radio button
        const radio = event.currentTarget.querySelector('input');
        if (radio) radio.checked = true;

        // If signup page, toggle fields
        const shopFields = document.getElementById('shop-fields');
        if (shopFields) {
            if (role === 'admin') {
                shopFields.style.display = 'block';
                document.getElementById('signup-shop-name').required = true;
                document.getElementById('aadhaar-number').required = true;
            } else {
                shopFields.style.display = 'none';
                document.getElementById('signup-shop-name').required = false;
                document.getElementById('aadhaar-number').required = false;
            }
        }
    }
}

// GPS Location Logic
function getLocation(event) {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🛰️ Syncing...';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                document.getElementById('latitude').value = pos.coords.latitude.toFixed(6);
                document.getElementById('longitude').value = pos.coords.longitude.toFixed(6);
                btn.textContent = '✓ Synced';
            },
            (err) => {
                alert("Could not fetch location: " + err.message);
                btn.textContent = originalText;
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Geolocation is not supported.");
        btn.textContent = originalText;
    }
}


// Attach Event Listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {

    // Check if we are on Login Page
    const loginForm = document.querySelector('form[onsubmit*="handleUnifiedLogin"]'); // Or find by ID if I change HTML
    // Actually, I removed onsubmit from JS, so I will now rely on form ID or just form presence

    // I should modify HTML to just have specific IDs
    // Login Form: id="auth-login-form"
    // Signup Form: id="auth-signup-form"

    const loginFormEl = document.querySelector('form');
    if (loginFormEl && window.location.pathname.includes('login.html')) {
        loginFormEl.addEventListener('submit', handleUnifiedLogin);
        // Expose selectRole globally isn't good.
        // Instead, add listeners to role options
        document.querySelectorAll('.role-option').forEach(el => {
            el.addEventListener('click', (e) => {
                const input = el.querySelector('input');
                selectRole(e, input.value);
            });
        });
    }

    const signupFormEl = document.querySelector('form');
    if (signupFormEl && window.location.pathname.includes('signup.html')) {
        signupFormEl.addEventListener('submit', handleUnifiedSignup);
        document.querySelectorAll('.role-option').forEach(el => {
            el.addEventListener('click', (e) => {
                const input = el.querySelector('input');
                selectRole(e, input.value);
            });
        });

        // Location Btn
        const locBtn = document.getElementById('location-btn');
        if (locBtn) {
            locBtn.addEventListener('click', getLocation);
        }

        // Init Image Uploaders
        if (document.getElementById('shop-image-dropzone')) {
            new ImageUploader('shop-image-dropzone', null, 'shop-image-input');
            new ImageUploader('aadhaar-image-dropzone', null, 'aadhaar-image-input');

            document.getElementById('shop-image-dropzone').addEventListener('imageUploaded', (e) => {
                document.getElementById('shop-image-url').value = e.detail.url;
                e.target.innerHTML = '<span style="color:green; font-weight:bold">✓ Photo Ready</span>';
                e.target.style.borderColor = 'green';
                e.target.style.background = '#f0fdf4';
            });

            document.getElementById('aadhaar-image-dropzone').addEventListener('imageUploaded', (e) => {
                document.getElementById('aadhaar-image-url').value = e.detail.url;
                e.target.innerHTML = '<span style="color:green; font-weight:bold">✓ ID Ready</span>';
                e.target.style.borderColor = 'green';
                e.target.style.background = '#f0fdf4';
            });
        }
    }
});
