import axios from 'axios';

// TODO: Uncomment and configure when backend is ready
/*
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leduo.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('leduo.token');
      localStorage.removeItem('leduo.isLoggedIn');
      window.location.href = '/app/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  getState: () => api.get('/customer/state'),
  updateState: (data) => api.put('/customer/state', data),
};

export const loyaltyAPI = {
  spinRoulette: () => api.post('/loyalty/roulette/spin'),
  getRouletteStatus: () => api.get('/loyalty/roulette/status'),
  addStamp: (data) => api.post('/loyalty/stamps', data),
  addCashback: (data) => api.post('/loyalty/cashback', data),
};

export default api;
*/

// Temporary mock API for development
export const mockAPI = {
  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    return {
      data: {
        success: true,
        message: 'Registro exitoso',
        customer: {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString(),
          source: 'qr'
        }
      }
    };
  },

  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: {
        success: true,
        token: 'mock-jwt-token',
        customer: {
          id: 1,
          name: 'Usuario Demo',
          email: credentials.email,
          phone: '+52 55 1234 5678'
        }
      }
    };
  },

  spinRoulette: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const rewards = [
      { type: 'points', value: 50, label: '50 puntos' },
      { type: 'points', value: 100, label: '100 puntos' },
      { type: 'stamp', value: 1, label: '1 sello' },
      { type: 'coupon', value: 'free-coffee', label: 'Café gratis' },
      { type: 'points', value: 25, label: '25 puntos' },
      { type: 'coupon', value: '20-off', label: '20% descuento' }
    ];
    
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    return {
      data: {
        success: true,
        reward: randomReward,
        spinAngle: Math.floor(Math.random() * 360) + 1800 // Multiple spins
      }
    };
  }
};

export default mockAPI;