class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
    }

    loadUser() {
        const userStr = localStorage.getItem('florryUser');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);
            if (!user || user.user_id === undefined) {
                console.warn("Invalid user data found in storage", user);
                return null;
            }
            return user;
        } catch (e) {
            return null;
        }
    }

    saveUser(userData) {
        localStorage.setItem('florryUser', JSON.stringify(userData));
        this.currentUser = userData;
    }

    getUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null && this.currentUser.user_id !== undefined;
    }

    getUserId() {
        if (!this.currentUser || this.currentUser.user_id === undefined) {
            console.warn("User ID missing");
            return null;
        }
        return parseInt(this.currentUser.user_id);
    }

    logout() {
        localStorage.removeItem('florryUser');
        localStorage.removeItem('florryCart');
        this.currentUser = null;
        window.location.href = '../index.html';
    }

    async login(email, password) {
        const response = await api.loginUser(email, password);

        // ✅ FIX: save ONLY user object
        this.saveUser(response.user);

        await this.mergeCart();
        return response;
    }

    async mergeCart() {
        const localCart = JSON.parse(localStorage.getItem('florryCart')) || [];
        if (localCart.length === 0) return;

        const userId = this.getUserId();
        if (!userId) return;

        for (const item of localCart) {
            await api.addToCart({
                user_id: userId,
                flower_id: item.flower_id,
                quantity: item.quantity
            });
        }

        localStorage.removeItem('florryCart');
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            const inPages = window.location.pathname.includes('/pages/');
            window.location.replace(
                inPages ? './customer_login.html' : './pages/customer_login.html'
            );
            return false;
        }
        return true;
    }
}

const auth = new AuthManager();

// ============================================
// CUSTOMER LOGIN
// ============================================

async function handleCustomerLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = event.target.querySelector('button');
    const originalText = btn.textContent;

    try {
        btn.textContent = 'Authenticating...';
        btn.disabled = true;

        const response = await api.customerLogin(email, password);

        // Save user data + token
        auth.saveUser({
            ...response.user,
            access_token: response.access_token
        });

        alert('✓ Welcome back to Florry!');
        window.location.href = './landing.html';
    } catch (error) {
        alert('Authentication failed: ' + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ============================================
// CUSTOMER SIGNUP
// ============================================

async function handleCustomerSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('signup-first-name').value.trim();
    const lastName = document.getElementById('signup-last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const btn = event.target.querySelector('button');
    const originalText = btn.textContent;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        btn.textContent = 'Creating Account...';
        btn.disabled = true;

        await api.customerSignup({
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            password
        });

        alert('✓ Account created successfully! Please login.');
        window.location.href = './customer_login.html';
    } catch (error) {
        alert('Signup failed: ' + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
