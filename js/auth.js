// =========================================================
// AUTHENTICATION MANAGER
// Handles Login, Signup, and User Sessions
// =========================================================

import { api } from './api.js';

export class AuthManager {
    constructor() {
        // Load user from storage when the page opens
        this.currentUser = this.loadUser();
    }

    // Read user data from Local Storage
    loadUser() {
        // We check for all types of users
        const userStr = localStorage.getItem('florryUser') ||
            localStorage.getItem('florryAdmin') ||
            localStorage.getItem('florrySuperAdmin');

        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }

    // Save user data after login
    // key depends on role: 'florryUser', 'florryAdmin', 'florrySuperAdmin'
    saveUser(userData, role = 'user') {
        let key = 'florryUser';
        if (role === 'admin') key = 'florryAdmin';
        if (role === 'super_admin') key = 'florrySuperAdmin';

        localStorage.setItem(key, JSON.stringify(userData));
        this.currentUser = userData;
    }

    getUser() {
        return this.currentUser;
    }

    // Check if anyone is logged in
    isLoggedIn() {
        // Check if current user object exists and has an ID
        return this.currentUser !== null && (this.currentUser.user_id || this.currentUser.admin_id || this.currentUser.id);
    }

    // Get the ID of the current user
    getUserId() {
        if (!this.currentUser) return null;
        return this.currentUser.user_id || this.currentUser.admin_id || this.currentUser.id;
    }

    // Logout function - Clears everything
    logout() {
        localStorage.removeItem('florryUser');
        localStorage.removeItem('florryAdmin');
        localStorage.removeItem('florrySuperAdmin');
        localStorage.removeItem('florryCart');
        this.currentUser = null;

        // Redirect to Home
        window.location.href = '../index.html';
    }

    // Sync local cart with server cart after login
    async mergeCart() {
        const localCart = JSON.parse(localStorage.getItem('florryCart')) || [];
        if (localCart.length === 0) return;

        const userId = this.getUserId();
        if (!userId) return;

        // Add each local item to the server
        for (const item of localCart) {
            try {
                await api.addToCart({
                    user_id: userId,
                    flower_id: item.flower_id,
                    quantity: item.quantity
                });
            } catch (e) { console.warn("Merge error", e); }
        }

        // Clear local cart
        localStorage.removeItem('florryCart');
    }

    // Protect pages that require login
    requireAuth() {
        if (!this.isLoggedIn()) {
            const inPages = window.location.pathname.includes('/pages/');
            // Redirect to login page
            window.location.replace(
                inPages ? './login.html' : './pages/login.html'
            );
            return false;
        }
        return true;
    }
}

export const auth = new AuthManager();
window.auth = auth;
