const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  roomType: {
    type: String,
    required: true,
    enum: ['single', 'double', 'suite', 'deluxe']
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  guests: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
    default: 'credit_card'
  },
  paymentIntentId: {
    type: String
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  serviceCharge: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  guestDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  cancellationReason: String,
  cancellationDate: Date
}, {
  timestamps: true
});

// Validate check-in date is before check-out date
bookingSchema.pre('save', function(next) {
  if (this.checkInDate >= this.checkOutDate) {
    const error = new Error('Check-in date must be before check-out date');
    return next(error);
  }
  
  if (this.checkInDate < new Date()) {
    const error = new Error('Check-in date cannot be in the past');
    return next(error);
  }
  
  next();
});

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
