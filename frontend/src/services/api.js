import axios from 'axios';

// Create base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (token expired)
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle other HTTP errors
    const errorMessage = error.response.data?.error || error.message || 'An error occurred';
    error.message = errorMessage;

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Hotels API calls
export const hotelsAPI = {
  getHotels: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/hotels?${queryString}`);
  },
  getHotelById: (id) => api.get(`/hotels/${id}`),
  searchHotels: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/hotels/search?${queryString}`);
  },
  checkAvailability: (data) => api.post('/hotels/availability', data),
  createHotel: (data) => api.post('/hotels', data),
  updateHotel: (id, data) => api.put(`/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
};

// Rooms API calls
export const roomsAPI = {
  getRoomsByHotel: (hotelId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/rooms/hotel/${hotelId}?${queryString}`);
  },
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Bookings API calls
export const bookingsAPI = {
  getBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/bookings?${queryString}`);
  },
  getAllBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/bookings/admin/all?${queryString}`);
  },
  getBookingById: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
};

// Export the main api instance and specific API modules
export { api };
export default api;