// API Configuration
const API_CONFIG = {
    BASE_URL: '/api',
    ENDPOINTS: {
        USERS: '/users',
        USER_LOGIN: '/user/login',
        ADMINS: '/admins',
        ADMIN_LOGIN: '/login/login',
        ADMIN_SIGNUP: '/admins',
        FLOWERS: '/flowers',
        ORDERS: '/orders',
        ORDER_ITEMS: '/order-items',
        CART: '/cart/',
        RATINGS: '/ratings',
        NOTIFICATIONS: '/notifications',
        REPORTS: '/reports',
        REPORTS: '/reports',
        RIDER_LOGIN: '/riders/login',
        RIDER_SIGNUP: '/riders/',
        SUPERADMIN_LOGIN: '/superadmin/login',
        SUPERADMIN_PENDING_ADMINS: '/superadmin/admins/pending',
        SUPERADMIN_PENDING_RIDERS: '/superadmin/riders/pending',
        SUPERADMIN_APPROVE_ADMIN: '/superadmin/admins',  // /{id}/approve
        SUPERADMIN_APPROVE_RIDER: '/superadmin/riders',   // /{id}/approve
        USER_FORGOT_PASSWORD: '/user/forgot-password',
        USER_RESET_PASSWORD: '/user/reset-password',
        ADMIN_FORGOT_PASSWORD: '/login/forgot-password',
        ADMIN_RESET_PASSWORD: '/login/reset-password',
        SUPPORT: '/support/'
    }
};

function buildUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}