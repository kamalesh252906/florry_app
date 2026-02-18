import { api } from './api.js';

// Adjust back links based on where they came from
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

document.addEventListener('DOMContentLoaded', () => {
    const userTypeSelect = document.getElementById('user-type');
    const backToLogin = document.getElementById('back-to-login');
    const loginLink = document.getElementById('login-link');
    const resetForm = document.querySelector('form');

    if (type === 'admin') {
        if (userTypeSelect) userTypeSelect.value = 'admin';
        if (backToLogin) backToLogin.href = './login.html';
        if (loginLink) loginLink.href = './login.html';
    } else {
        if (backToLogin) backToLogin.href = './login.html';
    }

    if (resetForm) {
        resetForm.addEventListener('submit', handleForgotPassword);
    }

    const loginBtn = document.getElementById('btn-return-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', redirectToLogin);
    }
});



async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('reset-email').value;
    const newPassword = document.getElementById('new-password').value;
    const userType = document.getElementById('user-type').value;
    const btn = document.getElementById('reset-btn');

    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        if (userType === 'customer') {
            await api.userForgotPassword(email);
            await api.userResetPassword(email, newPassword);
        } else {
            await api.adminForgotPassword(email);
            await api.adminResetPassword(email, newPassword);
        }

        document.getElementById('reset-form-container').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        document.getElementById('form-subtitle').classList.add('hidden');

    } catch (error) {
        florryNotify.error('Error: ' + error.message);
        btn.disabled = false;
        btn.textContent = 'Save New Password';
    }
}

function redirectToLogin() {
    window.location.href = './login.html';
}

