import axios from "axios";

const API_URL = "/api/reviews";

const reviewService = {
  // Get hotel reviews
  getHotelReviews: async (hotelId, filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`${API_URL}/hotel/${hotelId}?${params.toString()}`);
    return response.data;
  },

  // Create review
  createReview: async (reviewData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(API_URL, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/${reviewId}`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async (filters = {}) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`${API_URL}/user/my-reviews?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Mark review as helpful
  markReviewHelpful: async (reviewId) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/${reviewId}/helpful`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default reviewService;
