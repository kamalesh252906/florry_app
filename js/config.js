// API Configuration
export const API_CONFIG = {
    BASE_URL: '/api',
    ENDPOINTS: {
        USERS: '/users/',
        USER_LOGIN: '/user/login',
        ADMINS: '/admins/',
        ADMIN_LOGIN: '/login/login',
        ADMIN_SIGNUP: '/admins/',
        FLOWERS: '/flowers/',
        ORDERS: '/orders/',
        ORDER_ITEMS: '/order-items/',
        CART: '/cart/',
        REPORTS: '/reports/',
        SUPERADMIN_LOGIN: '/superadmin/login',
        SUPERADMIN_PENDING_ADMINS: '/superadmin/admins/pending',
        SUPERADMIN_APPROVE_ADMIN: '/superadmin/admins',
        USER_FORGOT_PASSWORD: '/user/forgot-password',
        USER_RESET_PASSWORD: '/user/reset-password',
        ADMIN_FORGOT_PASSWORD: '/login/forgot-password',
        ADMIN_RESET_PASSWORD: '/login/reset-password',
        SUPPORT: '/support/'
    }
};

export function buildUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}