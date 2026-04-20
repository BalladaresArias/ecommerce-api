import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Agrega el token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expira, redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

// Products
//export const getProducts = () => api.get('/products');
export const getProducts = (params = {}) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my-orders');
export const getAllOrders = (params = {}) => api.get('/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
//export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Payments
export const createTransaction = (data) => api.post('/payments/transaction', data);

// Coupons
export const validateCoupon = (data) => api.post('/coupons/validate', data);
export const getCoupons = () => api.get('/coupons');
export const createCoupon = (data) => api.post('/coupons', data);
export const toggleCoupon = (id, active) => api.patch(`/coupons/${id}/toggle`, { active });
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);

// Analytics
export const getAnalytics = (period = 30) => api.get(`/analytics/dashboard?period=${period}`);
export const exportOrders = (period = 30) => api.get(`/analytics/export?period=${period}`, { responseType: 'blob' });

// Importacion de productos desde CSV
export const importProducts = (products) => api.post('/products/import', { products });

// Invoices
export const getInvoiceUrl = (orderId) => `${import.meta.env.VITE_API_URL}/invoices/${orderId}`;

// ── WISHLIST ──────────────────────────────────────────────
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const checkWishlist = (productId) => api.get(`/wishlist/check/${productId}`);
 
// ── RESEÑAS ───────────────────────────────────────────────
export const getReviews = (productId, params = {}) => api.get(`/reviews/${productId}`, { params });
export const createReview = (productId, data) => api.post(`/reviews/${productId}`, data);
export const updateReview = (productId, data) => api.put(`/reviews/${productId}`, data);
export const deleteReview = (productId) => api.delete(`/reviews/${productId}`);
 
// ── PUNTOS ────────────────────────────────────────────────
export const getMyPoints = () => api.get('/points');
export const getPointsHistory = (params = {}) => api.get('/points/history', { params });
export const redeemPoints = (points) => api.post('/points/redeem', { points });
 