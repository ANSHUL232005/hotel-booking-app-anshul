const express = require('express');
const { body, validationResult } = require('express-validator');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Admin middleware
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalHotels,
      totalBookings,
      totalRevenue,
      recentBookings,
      monthlyStats
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Hotel.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.find()
        .populate('user', 'firstName lastName email')
        .populate('hotel', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Booking.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalHotels,
        totalBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      },
      recentBookings,
      monthlyStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Update user status
router.put('/users/:userId/status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus, 
      hotel, 
      dateFrom, 
      dateTo 
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (hotel) filter.hotel = hotel;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('hotel', 'name address')
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

// Update booking status
router.put('/bookings/:bookingId/status', [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.params;
    const { status, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'cancelled' && reason) {
      booking.cancellationReason = reason;
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

// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10, hotel, rating, verified } = req.query;
    
    const filter = {};
    if (hotel) filter.hotel = hotel;
    if (rating) filter.rating = parseInt(rating);
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// Delete review
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
});

// Revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let groupBy;
    if (period === 'monthly') {
      groupBy = {
        _id: { month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 }
      };
    } else if (period === 'yearly') {
      groupBy = {
        _id: { year: { $year: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 }
      };
    }

    const revenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      { $group: groupBy },
      { $sort: { '_id.month': 1, '_id.year': 1 } }
    ]);

    res.json({ revenueData });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching revenue analytics' });
  }
});

// Hotel performance analytics
router.get('/analytics/hotels', async (req, res) => {
  try {
    const hotelPerformance = await Booking.aggregate([
      {
        $group: {
          _id: '$hotel',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          hotelName: '$hotel.name',
          totalBookings: 1,
          totalRevenue: 1,
          avgRating: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({ hotelPerformance });
  } catch (error) {
    console.error('Hotel analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching hotel analytics' });
  }
});

module.exports = router;
