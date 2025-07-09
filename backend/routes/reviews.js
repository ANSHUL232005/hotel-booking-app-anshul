const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a hotel
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { hotel: hotelId };
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments(filter);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { hotel: hotelId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Count ratings by star
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingCounts.forEach(rating => {
        ratingBreakdown[rating]++;
      });
    }

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      statistics: {
        averageRating: ratingStats.length > 0 ? parseFloat(ratingStats[0].averageRating.toFixed(1)) : 0,
        totalReviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0,
        ratingBreakdown
      }
    });
  } catch (error) {
    console.error('Get hotel reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// Create a new review
router.post('/', authenticateToken, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').notEmpty().trim().withMessage('Review title is required'),
  body('comment').notEmpty().trim().withMessage('Review comment is required'),
  body('pros').optional().isArray().withMessage('Pros must be an array'),
  body('cons').optional().isArray().withMessage('Cons must be an array'),
  body('recommendToFriend').optional().isBoolean().withMessage('Recommendation must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, rating, title, comment, pros, cons, recommendToFriend } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('hotel', 'name');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ user: req.user._id, booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      hotel: booking.hotel._id,
      booking: bookingId,
      rating,
      title,
      comment,
      pros: pros || [],
      cons: cons || [],
      recommendToFriend: recommendToFriend !== undefined ? recommendToFriend : true,
      stayDate: booking.checkInDate,
      roomType: booking.roomType,
      isVerified: true // Since it's linked to a booking
    });

    await review.save();
    await review.populate('user', 'firstName lastName');

    // Update hotel's average rating
    await updateHotelRating(booking.hotel._id);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

// Update a review
router.put('/:reviewId', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim(),
  body('comment').optional().trim(),
  body('pros').optional().isArray(),
  body('cons').optional().isArray(),
  body('recommendToFriend').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const updateData = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update review
    Object.assign(review, updateData);
    await review.save();
    await review.populate('user', 'firstName lastName');

    // Update hotel's average rating
    await updateHotelRating(review.hotel);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
});

// Delete a review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update hotel's average rating
    await updateHotelRating(review.hotel);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
});

// Get user's reviews
router.get('/user/my-reviews', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user._id })
      .populate('hotel', 'name images address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments({ user: req.user._id });

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
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching user reviews' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.helpfulVotes += 1;
    await review.save();

    res.json({
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ message: 'Server error while marking review as helpful' });
  }
});

// Admin: Add response to review
router.post('/:reviewId/response', authenticateToken, authorizeRole('admin'), [
  body('text').notEmpty().trim().withMessage('Response text is required'),
  body('author').notEmpty().trim().withMessage('Response author is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const { text, author } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.response = {
      text,
      author,
      date: new Date()
    };

    await review.save();

    res.json({
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    console.error('Add review response error:', error);
    res.status(500).json({ message: 'Server error while adding response' });
  }
});

// Helper function to update hotel rating
async function updateHotelRating(hotelId) {
  try {
    const ratingStats = await Review.aggregate([
      { $match: { hotel: hotelId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const hotel = await Hotel.findById(hotelId);
    if (hotel && ratingStats.length > 0) {
      hotel.rating = parseFloat(ratingStats[0].averageRating.toFixed(1));
      await hotel.save();
    }
  } catch (error) {
    console.error('Update hotel rating error:', error);
  }
}

module.exports = router;
