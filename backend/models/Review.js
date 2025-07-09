const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  pros: [String],
  cons: [String],
  recommendToFriend: {
    type: Boolean,
    default: true
  },
  stayDate: {
    type: Date,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  response: {
    text: String,
    date: Date,
    author: String
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ hotel: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
