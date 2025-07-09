const express = require('express');
const { body, validationResult } = require('express-validator');
const Hotel = require('../models/Hotel');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const imageService = require('../services/imageService');

const router = express.Router();

// Get all hotels with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      country,
      state,
      minPrice,
      maxPrice,
      rating,
      search,
      amenities,
      checkIn,
      checkOut,
      guests,
      roomType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }
    
    if (country) {
      filter['address.country'] = new RegExp(country, 'i');
    }
    
    if (state) {
      filter['address.state'] = new RegExp(state, 'i');
    }
    
    if (rating) {
      filter.rating = { $gte: parseInt(rating) };
    }
    
    if (amenities) {
      const amenityList = amenities.split(',');
      filter.amenities = { $in: amenityList };
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.country': new RegExp(search, 'i') },
        { amenities: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (roomType) {
      filter['rooms.type'] = roomType;
    }
    
    if (guests) {
      filter['rooms.capacity'] = { $gte: parseInt(guests) };
    }

    // Build price filter for rooms
    let priceFilter = {};
    if (minPrice || maxPrice) {
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'hotel',
          as: 'bookings'
        }
      }
    ];

    // Add price filtering if needed
    if (Object.keys(priceFilter).length > 0) {
      pipeline.push({
        $match: {
          'rooms.price': priceFilter
        }
      });
    }

    // Add sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortOptions });

    // Add pagination
    pipeline.push(
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const hotels = await Hotel.aggregate(pipeline);
    const totalCount = await Hotel.countDocuments(filter);

    res.json({
      hotels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ message: 'Server error while fetching hotels' });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ hotel });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ message: 'Server error while fetching hotel' });
  }
});

// Create hotel (Admin only)
router.post('/', authenticateToken, authorizeRole('admin'), [
  body('name').notEmpty().trim().withMessage('Hotel name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('rooms').isArray().withMessage('Rooms must be an array'),
  body('rooms.*.type').notEmpty().withMessage('Room type is required'),
  body('rooms.*.price').isNumeric().withMessage('Room price must be numeric'),
  body('rooms.*.capacity').isNumeric().withMessage('Room capacity must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hotel = new Hotel(req.body);
    await hotel.save();

    res.status(201).json({
      message: 'Hotel created successfully',
      hotel
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ message: 'Server error while creating hotel' });
  }
});

// Update hotel (Admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    Object.assign(hotel, req.body);
    await hotel.save();

    res.json({
      message: 'Hotel updated successfully',
      hotel
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ message: 'Server error while updating hotel' });
  }
});

// Delete hotel (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Soft delete
    hotel.isActive = false;
    await hotel.save();

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ message: 'Server error while deleting hotel' });
  }
});

// Get available rooms for specific dates
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check room availability by querying existing bookings
    const Booking = require('../models/Booking');
    const bookedRooms = await Booking.find({
      hotel: req.params.id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkOut) },
          checkOutDate: { $gte: new Date(checkIn) }
        }
      ]
    }).select('roomType');

    const bookedRoomTypes = bookedRooms.map(booking => booking.roomType);
    const availableRooms = hotel.rooms.filter(room => 
      room.available && !bookedRoomTypes.includes(room.type)
    );

    res.json({
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        address: hotel.address
      },
      checkIn,
      checkOut,
      availableRooms
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error while checking availability' });
  }
});

// Upload images for hotel
router.post('/:id/images', authenticateToken, authorizeRole('admin'), imageService.uploadMultiple('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Process and upload images
    const processedImages = await imageService.processHotelImages(req.files, id);
    
    // Add new images to hotel
    hotel.images = [...hotel.images, ...processedImages.map(img => img.url)];
    await hotel.save();

    res.json({
      message: 'Images uploaded successfully',
      images: processedImages
    });
  } catch (error) {
    console.error('Hotel image upload error:', error);
    res.status(500).json({ message: 'Server error while uploading images' });
  }
});

// Delete hotel image
router.delete('/:id/images/:imageId', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Remove image from hotel
    hotel.images = hotel.images.filter(img => !img.includes(imageId));
    await hotel.save();

    // Delete from Cloudinary
    await imageService.deleteFromCloudinary(imageId);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Hotel image delete error:', error);
    res.status(500).json({ message: 'Server error while deleting image' });
  }
});

module.exports = router;
