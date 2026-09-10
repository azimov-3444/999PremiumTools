// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://nine99premiumtools.onrender.com/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== USER API ====================

export const userAPI = {
    register: async (userData) => {
        return apiCall('/users/register', {
            method: 'POST',
            body: JSON.stringify({
                email: userData.email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                password: userData.password,
            }),
        });
    },

    login: async (email, password) => {
        return apiCall('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    getAll: async () => {
        return apiCall('/users');
    },

    updateRole: async (email, role) => {
        return apiCall(`/users/${email}/role?role=${role}`, {
            method: 'PATCH',
        });
    },
};

// ==================== CATEGORY API ====================

export const categoryAPI = {
    getAll: async () => {
        return apiCall('/categories');
    },

    create: async (name) => {
        return apiCall('/categories', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    delete: async (id) => {
        return apiCall(`/categories/${id}`, {
            method: 'DELETE',
        });
    },
};

// ==================== PRODUCT API ====================

export const productAPI = {
    getAll: async () => {
        return apiCall('/products');
    },

    create: async (productData) => {
        return apiCall('/products', {
            method: 'POST',
            body: JSON.stringify({
                name: productData.name,
                price: productData.price,
                category_id: productData.categoryId,
                image: productData.image,
                stock: productData.stock,
            }),
        });
    },

    updateStock: async (id, stock) => {
        return apiCall(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ stock }),
        });
    },

    updateCategory: async (id, categoryId) => {
        return apiCall(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ category_id: categoryId }),
        });
    },

    delete: async (id) => {
        return apiCall(`/products/${id}`, {
            method: 'DELETE',
        });
    },
};

// ==================== CAROUSEL API ====================

export const carouselAPI = {
    getAll: async () => {
        return apiCall('/carousel');
    },

    create: async (itemData) => {
        return apiCall('/carousel', {
            method: 'POST',
            body: JSON.stringify({
                title: itemData.title,
                description: itemData.description,
                image: itemData.image,
                button_text: itemData.buttonText,
                link: itemData.link,
            }),
        });
    },

    delete: async (id) => {
        return apiCall(`/carousel/${id}`, {
            method: 'DELETE',
        });
    },
};

// ==================== STATISTICS API ====================

export const statsAPI = {
    trackVisit: async (sessionId, path) => {
        return apiCall('/stats/visit', {
            method: 'POST',
            body: JSON.stringify({
                session_id: sessionId,
                path: path,
            }),
        });
    },

    getStats: async () => {
        return apiCall('/stats');
    },
};

export default {
    user: userAPI,
    category: categoryAPI,
    product: productAPI,
    carousel: carouselAPI,
    stats: statsAPI,
};
