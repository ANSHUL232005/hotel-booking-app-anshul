import axios from "axios";

const API_URL = "/api/admin";

const adminService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // User management
  getUsers: async (filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/users/${userId}/status`, 
      { isActive }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Booking management
  getBookings: async (filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`${API_URL}/bookings?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateBookingStatus: async (bookingId, status, reason = null) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/bookings/${bookingId}/status`, 
      { status, reason }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Review management
  getReviews: async (filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`${API_URL}/reviews?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Analytics
  getRevenueAnalytics: async (period = 'monthly', year = new Date().getFullYear()) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/analytics/revenue`, {
      params: { period, year },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getHotelAnalytics: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/analytics/hotels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default adminService;
