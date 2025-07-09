import axios from "axios";

const API_URL = "/api/payments";

const paymentService = {
  // Create payment intent
  createPaymentIntent: async (bookingId, amount) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/create-payment-intent`, 
      { bookingId, amount }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/confirm-payment`, 
      { paymentIntentId }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentIntentId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/payment-status/${paymentIntentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Request refund
  requestRefund: async (bookingId, reason, amount = null) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/refund`, 
      { bookingId, reason, amount }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default paymentService;
