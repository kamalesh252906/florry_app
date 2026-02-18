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
            florryNotify.success('✓ Welcome back!');
            window.location.href = './landing.html';

        } else {
            // Handle both Admin and Super Admin tags
            if (role === 'super_admin') {
                response = await api.superAdminLogin(email, password);
            } else {
                response = await api.loginAdmin(email, password);
            }

            // Check what the server actually returned (Super Admin can log in via Admin route too)
            if (response.role === 'superadmin') {
                const superAdminData = {
                    id: 'superadmin',
                    email: email,
                    role: 'superadmin',
                    access_token: response.access_token
                };
                auth.saveUser(superAdminData, 'super_admin');
                florryNotify.success('✓ Super Admin Access Granted');
                window.location.href = './super_admin_dashboard.html';
            } else {
                // Regular Shop Admin
                auth.saveUser({ ...response.admin, access_token: response.access_token }, 'admin');
                florryNotify.success('✓ Shop Partner Login Successful');
                window.location.href = './admin_dashboard.html';
            }
        }

    } catch (error) {
        florryNotify.error('Login failed: ' + error.message);
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

            florryNotify.success('✓ Account created! Please login.');
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

            florryNotify.success('✓ Partnership request submitted! Pending approval.');
            window.location.href = './login.html';
        }

    } catch (error) {
        florryNotify.error('Signup failed: ' + error.message);
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

        // Update Forgot Password link if it exists
        const forgotLink = document.getElementById('forgot-password-link');
        if (forgotLink) {
            forgotLink.href = `./forgot_password.html?type=${role === 'admin' ? 'admin' : 'customer'}`;
            forgotLink.textContent = 'Forgot Password?';
        }

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
                florryNotify.error("Could not fetch location: " + err.message);
                btn.textContent = originalText;
            },
            { enableHighAccuracy: true }
        );
    } else {
        florryNotify.warning("Geolocation is not supported.");
        btn.textContent = originalText;
    }
}


// Attach Event Listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {

    const currentPath = window.location.pathname;

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm && (currentPath.includes('login.html') || currentPath.includes('admin_login.html'))) {
        loginForm.addEventListener('submit', handleUnifiedLogin);

        // Setup Role Selector interactions
        document.querySelectorAll('.role-option').forEach(el => {
            el.addEventListener('click', (e) => {
                const input = el.querySelector('input');
                if (input) selectRole(e, input.value);
            });
        });
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm && (currentPath.includes('signup.html') || currentPath.includes('admin_signup.html'))) {
        signupForm.addEventListener('submit', handleUnifiedSignup);

        document.querySelectorAll('.role-option').forEach(el => {
            el.addEventListener('click', (e) => {
                const input = el.querySelector('input');
                if (input) selectRole(e, input.value);
            });
        });

        // Location Detection Button
        const locBtn = document.getElementById('location-btn');
        if (locBtn) locBtn.addEventListener('click', getLocation);

        // Initialize Specialized Media Uploaders
        if (document.getElementById('shop-image-dropzone')) {
            new ImageUploader('shop-image-dropzone', null, 'shop-image-input');
            new ImageUploader('aadhaar-image-dropzone', null, 'aadhaar-image-input');

            document.getElementById('shop-image-dropzone').addEventListener('imageUploaded', (e) => {
                document.getElementById('shop-image-url').value = e.detail.url;
                e.target.innerHTML = '<span style="color:#10b981; font-weight:700">✓ Photo Verified</span>';
                e.target.style.borderColor = '#10b981';
                e.target.style.background = '#f0fdf4';
            });

            document.getElementById('aadhaar-image-dropzone').addEventListener('imageUploaded', (e) => {
                document.getElementById('aadhaar-image-url').value = e.detail.url;
                e.target.innerHTML = '<span style="color:#10b981; font-weight:700">✓ Identity Sync Ready</span>';
                e.target.style.borderColor = '#10b981';
                e.target.style.background = '#f0fdf4';
            });
        }
    }
});
