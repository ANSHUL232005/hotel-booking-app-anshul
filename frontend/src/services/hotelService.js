import axios from "axios";

const API_URL = "/api/hotels";

const hotelService = {
  // Get all hotels with advanced filtering
  getHotels: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          params.append(key, filters[key].join(','));
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  },

  // Get hotel by ID
  getHotelById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Check room availability
  checkAvailability: async (hotelId, checkIn, checkOut) => {
    const response = await axios.get(`${API_URL}/${hotelId}/availability`, {
      params: { checkIn, checkOut }
    });
    return response.data;
  },

  // Create hotel (Admin only)
  createHotel: async (hotelData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(API_URL, hotelData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update hotel (Admin only)
  updateHotel: async (id, hotelData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/${id}`, hotelData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Delete hotel (Admin only)
  deleteHotel: async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Upload hotel images (Admin only)
  uploadHotelImages: async (hotelId, images) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await axios.post(`${API_URL}/${hotelId}/images`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete hotel image (Admin only)
  deleteHotelImage: async (hotelId, imageId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/${hotelId}/images/${imageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get popular destinations
  getPopularDestinations: async () => {
    const response = await axios.get(`${API_URL}/popular-destinations`);
    return response.data;
  },

  // Search suggestions
  getSearchSuggestions: async (query) => {
    const response = await axios.get(`${API_URL}/search-suggestions`, {
      params: { q: query }
    });
    return response.data;
  }
};

export default hotelService;
