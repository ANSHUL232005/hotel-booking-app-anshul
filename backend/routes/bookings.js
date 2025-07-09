const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const paymentService = require('../services/paymentService');

const router = express.Router();

// Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('hotel', 'name address contact images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'name address contact images amenities')
      .populate('user', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error while fetching booking' });
  }
});

// Create a new booking
router.post('/', authenticateToken, [
  body('hotel').notEmpty().withMessage('Hotel ID is required'),
  body('roomType').notEmpty().withMessage('Room type is required'),
  body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOutDate').isISO8601().withMessage('Valid check-out date is required'),
  body('guests.adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
  body('guests.children').optional().isInt({ min: 0 }).withMessage('Children count must be non-negative'),
  body('guestDetails.firstName').notEmpty().withMessage('Guest first name is required'),
  body('guestDetails.lastName').notEmpty().withMessage('Guest last name is required'),
  body('guestDetails.email').isEmail().withMessage('Valid guest email is required'),
  body('guestDetails.phone').notEmpty().withMessage('Guest phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      hotel: hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      guests,
      guestDetails,
      specialRequests,
      paymentMethod
    } = req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();

    if (checkIn < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check if hotel exists and is active
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check if room type exists and is available
    const room = hotel.rooms.find(r => r.type === roomType && r.available);
    if (!room) {
      return res.status(400).json({ message: 'Room type not available' });
    }

    // Check if room is already booked for these dates
    const existingBooking = await Booking.findOne({
      hotel: hotelId,
      roomType,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Room is not available for selected dates' });
    }

    // Calculate total amount
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const baseAmount = room.price * nights;
    const totals = paymentService.calculateBookingTotal(baseAmount);

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      hotel: hotelId,
      roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalAmount: totals.totalAmount,
      taxAmount: totals.taxAmount,
      serviceCharge: totals.serviceCharge,
      guestDetails,
      specialRequests,
      paymentMethod: paymentMethod || 'credit_card'
    });

    await booking.save();

    // Populate hotel details for response
    await booking.populate('hotel', 'name address contact');

    // Send booking confirmation email
    try {
      await emailService.sendBookingConfirmation(guestDetails.email, booking);
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
      // Don't fail booking if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      totals
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['confirmed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow certain status transitions
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot modify completed or cancelled booking' });
    }

    // Users can only cancel their own bookings
    if (!isAdmin && status === 'confirmed') {
      return res.status(403).json({ message: 'Only admin can confirm bookings' });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason;
      booking.cancellationDate = new Date();
    }

    await booking.save();

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error while updating booking status' });
  }
});

// Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancellationDate = new Date();

    await booking.save();
    await booking.populate('hotel', 'name address');

    // Send cancellation email
    try {
      await emailService.sendBookingCancellation(booking.guestDetails.email, booking);
    } catch (emailError) {
      console.error('Booking cancellation email failed:', emailError);
      // Don't fail cancellation if email fails
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error while cancelling booking' });
  }
});

// Get all bookings (Admin only)
router.get('/admin/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, hotel } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (hotel) filter.hotel = hotel;

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('hotel', 'name address contact')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching all bookings' });
  }
});

module.exports = router;
