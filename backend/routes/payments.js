const express = require('express');
const { body, validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', authenticateToken, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, amount } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('hotel', 'name');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate total with taxes and fees
    const totals = paymentService.calculateBookingTotal(amount);

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      totals.totalAmount,
      'usd',
      {
        bookingId: bookingId,
        userId: req.user._id.toString(),
        hotelName: booking.hotel.name
      }
    );

    // Update booking with payment intent ID and totals
    booking.paymentIntentId = paymentIntent.id;
    booking.totalAmount = totals.totalAmount;
    booking.taxAmount = totals.taxAmount;
    booking.serviceCharge = totals.serviceCharge;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totals
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error while creating payment intent' });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticateToken, [
  body('paymentIntentId').notEmpty().withMessage('Payment Intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId } = req.body;

    // Get payment intent from Stripe
    const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);

    // Find booking
    const booking = await Booking.findOne({ paymentIntentId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update booking status based on payment status
    if (paymentIntent.status === 'succeeded') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.amountPaid = paymentIntent.amount / 100; // Convert from cents
      await booking.save();

      // Send confirmation email
      const emailService = require('../services/emailService');
      await booking.populate('hotel', 'name address');
      await emailService.sendBookingConfirmation(
        booking.guestDetails.email,
        booking
      );
    }

    res.json({
      message: 'Payment confirmed successfully',
      booking,
      paymentStatus: paymentIntent.status
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error while confirming payment' });
  }
});

// Get payment status
router.get('/payment-status/:paymentIntentId', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);
    const booking = await Booking.findOne({ paymentIntentId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      paymentStatus: paymentIntent.status,
      bookingStatus: booking.status,
      amountPaid: booking.amountPaid
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Server error while getting payment status' });
  }
});

// Refund payment
router.post('/refund', authenticateToken, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, reason, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Booking is not paid' });
    }

    // Create refund
    const refund = await paymentService.createRefund(
      booking.paymentIntentId,
      amount
    );

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancellationDate = new Date();
    await booking.save();

    res.json({
      message: 'Refund processed successfully',
      refund,
      booking
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error while processing refund' });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = paymentService.verifyWebhookSignature(req.body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
        
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          booking.amountPaid = paymentIntent.amount / 100;
          await booking.save();
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedBooking = await Booking.findOne({ paymentIntentId: failedPayment.id });
        
        if (failedBooking) {
          failedBooking.paymentStatus = 'failed';
          await failedBooking.save();
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
});

module.exports = router;
