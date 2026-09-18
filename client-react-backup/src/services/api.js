import axios from 'axios';
import { mockApi } from './mockApi';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tez_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || null
    };
    return Promise.reject(customError);
  }
);

// Unified API Service
export const api = {
  // Mode flag
  isMock,

  // Health
  async getHealth() {
    if (isMock) {
      return {
        success: true,
        message: 'Tez Thaila Mock Engine active',
        data: {
          app: 'Tez Thaila Mock API',
          status: 'UP',
          uptimeSeconds: 9999,
          database: {
            status: 'LOCAL_MOCK_STORAGE',
            provider: 'LocalStorage Engine',
            version: 'Browser Mock V1',
            queryLatencyMs: 15
          },
          environment: 'mock_standalone'
        }
      };
    }
    return axiosInstance.get('/health');
  },

  // Authentication (Real MySQL Backend + Express REST API)
  auth: {
    login: (email, password) => axiosInstance.post('/auth/login', { email, password }),
    register: (data) => axiosInstance.post('/auth/register', data),
    logout: () => axiosInstance.post('/auth/logout'),
    getMe: () => axiosInstance.get('/auth/me'),
    updateProfile: (data) => axiosInstance.put('/auth/profile', data)
  },

  // Products
  products: {
    list: async (params) => {
      if (isMock) return mockApi.getProducts(params);
      try {
        return await axiosInstance.get('/products', { params });
      } catch {
        return mockApi.getProducts(params);
      }
    },
    getBySlug: async (slug) => {
      if (isMock) return mockApi.getProductBySlug(slug);
      try {
        return await axiosInstance.get(`/products/slug/${slug}`);
      } catch {
        return mockApi.getProductBySlug(slug);
      }
    },
    create: async (data) => {
      if (isMock) return mockApi.addProduct(data);
      try {
        return await axiosInstance.post('/products', data);
      } catch {
        return mockApi.addProduct(data);
      }
    },
    updateStock: async (id, stock) => {
      if (isMock) return mockApi.updateProductStock(id, stock);
      try {
        return await axiosInstance.put(`/products/${id}/stock`, { stock });
      } catch {
        return mockApi.updateProductStock(id, stock);
      }
    },
    delete: async (id) => {
      if (isMock) return mockApi.deleteProduct?.(id);
      return await axiosInstance.delete(`/products/${id}`);
    }
  },

  // Categories & Brands
  categories: {
    list: () => (isMock ? mockApi.getCategories() : axiosInstance.get('/categories'))
  },
  brands: {
    list: () => (isMock ? mockApi.getBrands() : axiosInstance.get('/brands'))
  },

  // Cart
  cart: {
    get: () => (isMock ? mockApi.getCart() : axiosInstance.get('/cart')),
    add: (item) => (isMock ? mockApi.addToCart(item) : axiosInstance.post('/cart', item)),
    update: (itemId, quantity) => (isMock ? mockApi.updateCartItem(itemId, quantity) : axiosInstance.put(`/cart/${itemId}`, { quantity })),
    remove: (itemId) => (isMock ? mockApi.removeFromCart(itemId) : axiosInstance.delete(`/cart/${itemId}`)),
    clear: () => (isMock ? mockApi.clearCart() : axiosInstance.delete('/cart/clear'))
  },

  // Wishlist
  wishlist: {
    get: () => (isMock ? mockApi.getWishlist() : axiosInstance.get('/wishlist')),
    toggle: (productId) => (isMock ? mockApi.toggleWishlist(productId) : axiosInstance.post(`/wishlist/${productId}`))
  },

  // Coupons
  coupons: {
    validate: (code, subtotal) => (isMock ? mockApi.validateCoupon(code, subtotal) : axiosInstance.post('/coupons/validate', { code, subtotal }))
  },

  // Addresses
  addresses: {
    list: () => (isMock ? mockApi.getAddresses() : axiosInstance.get('/addresses')),
    create: (data) => (isMock ? mockApi.addAddress(data) : axiosInstance.post('/addresses', data)),
    delete: (id) => (isMock ? mockApi.deleteAddress(id) : axiosInstance.delete(`/addresses/${id}`))
  },

  // Orders
  orders: {
    create: (data) => (isMock ? mockApi.createOrder(data) : axiosInstance.post('/orders', data)),
    list: () => (isMock ? mockApi.getOrders() : axiosInstance.get('/orders')),
    getById: (id) => (isMock ? mockApi.getOrderById(id) : axiosInstance.get(`/orders/${id}`)),
    cancel: (id, reason) => (isMock ? mockApi.cancelOrder(id, reason) : axiosInstance.put(`/orders/${id}/cancel`, { reason })),
    returnRequest: (id, reason) => (isMock ? mockApi.requestReturn(id, reason) : axiosInstance.post(`/orders/${id}/return`, { reason }))
  },

  // Payments (Razorpay Simulation)
  payments: {
    createOrder: (data) => (isMock ? mockApi.createRazorpayOrder(data) : axiosInstance.post('/payment/create-order', data)),
    verify: (data) => (isMock ? mockApi.verifyRazorpayPayment(data) : axiosInstance.post('/payment/verify', data))
  },

  // Reviews
  reviews: {
    list: (productId) => (isMock ? mockApi.getProductReviews(productId) : axiosInstance.get(`/reviews/product/${productId}`)),
    create: (data) => (isMock ? mockApi.addReview(data) : axiosInstance.post('/reviews', data))
  },

  // Admin
  admin: {
    getStats: async () => {
      if (isMock) return mockApi.getAdminStats();
      try {
        return await axiosInstance.get('/admin/analytics');
      } catch {
        return mockApi.getAdminStats();
      }
    },
    updateOrderStatus: async (id, status) => {
      if (isMock) return mockApi.updateOrderStatus(id, status);
      try {
        return await axiosInstance.put(`/admin/orders/${id}/status`, { status });
      } catch {
        return mockApi.updateOrderStatus(id, status);
      }
    }
  },

  // File & Camera Uploads
  upload: {
    image: async (fileOrData) => {
      if (fileOrData instanceof File || fileOrData instanceof Blob) {
        const formData = new FormData();
        formData.append('image', fileOrData);
        return await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Base64 string payload from webcam or canvas
        return await axiosInstance.post('/upload', { image: fileOrData });
      }
    }
  }
};

export default api;
