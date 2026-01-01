// API Service Layer
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = buildUrl(endpoint);

        // Get token from storage based on context
        const isAdminPage = window.location.pathname.includes('admin') || window.location.pathname.includes('super_admin');

        const adminData = JSON.parse(localStorage.getItem('florryAdmin'));
        const userData = JSON.parse(localStorage.getItem('florryUser'));
        const superAdminData = JSON.parse(localStorage.getItem('florrySuperAdmin'));

        let token;
        if (window.location.pathname.includes('super_admin')) {
            token = superAdminData?.access_token;
        } else if (isAdminPage) {
            token = adminData?.access_token || userData?.access_token;
        } else {
            token = userData?.access_token || adminData?.access_token;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers
            },
            ...options
        };

        console.log(`[API] ${config.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                console.warn("Unauthorized request, clearing tokens...");
                // Note: Optional, maybe don't force redirect if it's a soft check
            }

            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                if (!text && response.ok) return null;
                if (!response.ok) throw new Error(text || `Server returned ${response.status}`);
                return text;
            }

            if (!response.ok) {
                let errorMessage = data?.detail || data?.message || `HTTP ${response.status}`;
                if (typeof errorMessage === 'object') errorMessage = JSON.stringify(errorMessage);
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('[API] Request Error:', error);
            throw error;
        }
    }

    // Admin APIs
    async getAdmins(params = {}) {
        let url = API_CONFIG.ENDPOINTS.ADMINS;
        const query = new URLSearchParams(params).toString();
        if (query) url += `?${query}`;
        return this.request(url);
    }

    async createAdmin(adminData) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_SIGNUP, {
            method: 'POST',
            body: JSON.stringify(adminData)
        });
    }

    async loginAdmin(email, password) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async updateAdmin(adminId, adminData) {
        return this.request(`${API_CONFIG.ENDPOINTS.ADMINS}/${adminId}`, {
            method: 'PUT',
            body: JSON.stringify(adminData)
        });
    }

    async getAdmin(adminId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ADMINS}/${adminId}`);
    }

    // User APIs
    async createUser(userData) {
        return this.request(API_CONFIG.ENDPOINTS.USERS, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async loginUser(email, password) {
        return this.request(API_CONFIG.ENDPOINTS.USER_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    // Aliases for better readability
    async customerSignup(userData) { return this.createUser(userData); }
    async customerLogin(email, password) { return this.loginUser(email, password); }

    async getUser(userId) {
        return this.request(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`);
    }

    // Flower APIs
    async getFlowers(adminId = null) {
        let url = API_CONFIG.ENDPOINTS.FLOWERS;
        if (adminId) url += `?admin_id=${adminId}`;
        return this.request(url);
    }

    async getFlower(flowerId) {
        return this.request(`${API_CONFIG.ENDPOINTS.FLOWERS}/${flowerId}`);
    }

    async createFlower(flowerData) {
        return this.request(API_CONFIG.ENDPOINTS.FLOWERS, {
            method: 'POST',
            body: JSON.stringify(flowerData)
        });
    }

    async updateFlower(flowerId, flowerData) {
        return this.request(`${API_CONFIG.ENDPOINTS.FLOWERS}/${flowerId}`, {
            method: 'PUT',
            body: JSON.stringify(flowerData)
        });
    }

    async deleteFlower(flowerId) {
        return this.request(`${API_CONFIG.ENDPOINTS.FLOWERS}/${flowerId}`, {
            method: 'DELETE'
        });
    }

    // Cart APIs
    async getCart() {
        return this.request(API_CONFIG.ENDPOINTS.CART);
    }

    async addToCart(cartData) {
        return this.request(API_CONFIG.ENDPOINTS.CART, {
            method: 'POST',
            body: JSON.stringify(cartData)
        });
    }

    async updateCartQuantity(cartId, quantity) {
        return this.request(`${API_CONFIG.ENDPOINTS.CART}${cartId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async deleteCartItem(cartId) {
        return this.request(`${API_CONFIG.ENDPOINTS.CART}${cartId}`, {
            method: 'DELETE'
        });
    }

    // Order APIs
    async createOrder(orderData) {
        return this.request(API_CONFIG.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return this.request(API_CONFIG.ENDPOINTS.ORDERS);
    }

    async getAdminOrders() {
        return this.request(`${API_CONFIG.ENDPOINTS.ORDERS}/admin`);
    }

    async getOrder(orderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
    }

    async shopAcceptOrder(orderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/shop_accept`, {
            method: 'PUT'
        });
    }

    async outForDelivery(orderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/out_for_delivery`, {
            method: 'PUT'
        });
    }

    async completeOrder(orderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/complete`, {
            method: 'PUT'
        });
    }

    async deleteOrder(orderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`, {
            method: 'DELETE'
        });
    }

    // Super Admin APIs
    async superAdminLogin(email, password) {
        return this.request(API_CONFIG.ENDPOINTS.SUPERADMIN_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getPendingAdmins() {
        return this.request(API_CONFIG.ENDPOINTS.SUPERADMIN_PENDING_ADMINS);
    }

    async getPendingRiders() {
        return this.request(API_CONFIG.ENDPOINTS.SUPERADMIN_PENDING_RIDERS);
    }

    async approveAdmin(adminId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUPERADMIN_APPROVE_ADMIN}/${adminId}/approve`, { method: 'PUT' });
    }

    async rejectAdmin(adminId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUPERADMIN_APPROVE_ADMIN}/${adminId}/reject`, { method: 'PUT' });
    }

    async approveRider(riderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUPERADMIN_APPROVE_RIDER}/${riderId}/approve`, { method: 'PUT' });
    }

    async rejectRider(riderId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUPERADMIN_APPROVE_RIDER}/${riderId}/reject`, { method: 'PUT' });
    }

    // Password Reset APIs
    async userForgotPassword(email) {
        return this.request(API_CONFIG.ENDPOINTS.USER_FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async userResetPassword(email, newPassword) {
        return this.request(API_CONFIG.ENDPOINTS.USER_RESET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email, new_password: newPassword })
        });
    }

    async adminForgotPassword(email) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async adminResetPassword(email, newPassword) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_RESET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email, new_password: newPassword })
        });
    }

    // Support APIs
    async sendSupportMessage(msgData) {
        return this.request(API_CONFIG.ENDPOINTS.SUPPORT, {
            method: 'POST',
            body: JSON.stringify(msgData)
        });
    }

    async getSupportMessages(userId = null) {
        let url = API_CONFIG.ENDPOINTS.SUPPORT;
        if (userId) url += `?user_id=${userId}`;
        return this.request(url);
    }

    async replyToSupportMessage(messageId, reply) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUPPORT}${messageId}/reply`, {
            method: 'PUT',
            body: JSON.stringify({ reply })
        });
    }

    async deleteSupportMessage(messageId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUPPORT}${messageId}`, {
            method: 'DELETE'
        });
    }
}

const api = new ApiService();