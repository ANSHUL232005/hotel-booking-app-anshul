const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentService = {
  // Create payment intent
  createPaymentIntent: async (amount, currency = 'usd', metadata = {}) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  },

  // Confirm payment intent
  confirmPaymentIntent: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  },

  // Get payment intent
  getPaymentIntent: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Payment intent retrieval failed: ${error.message}`);
    }
  },

  // Refund payment
  createRefund: async (paymentIntentId, amount = null) => {
    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }
      
      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  },

  // Create customer
  createCustomer: async (email, name, phone) => {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
      });
      return customer;
    } catch (error) {
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  },

  // Verify webhook signature
  verifyWebhookSignature: (payload, signature) => {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  },

  // Calculate booking total with taxes and fees
  calculateBookingTotal: (baseAmount, taxRate = 0.1, serviceChargeRate = 0.05) => {
    const taxAmount = baseAmount * taxRate;
    const serviceCharge = baseAmount * serviceChargeRate;
    const totalAmount = baseAmount + taxAmount + serviceCharge;
    
    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }
};

module.exports = paymentService;
