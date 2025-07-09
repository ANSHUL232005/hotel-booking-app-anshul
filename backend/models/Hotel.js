const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'suite', 'deluxe']
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  amenities: [String],
  available: {
    type: Boolean,
    default: true
  },
  images: [String]
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  amenities: [String],
  images: [String],
  rooms: [roomSchema],
  contact: {
    phone: String,
    email: String,
    website: String
  },
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '11:00'
  },
  policies: {
    cancellation: String,
    pets: Boolean,
    smoking: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
hotelSchema.index({ location: '2dsphere' });

// Index for text search
hotelSchema.index({
  name: 'text',
  description: 'text',
  'address.city': 'text',
  'address.state': 'text'
});

module.exports = mongoose.model('Hotel', hotelSchema);
