const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const imageService = {
  // Multer middleware for single image upload
  uploadSingle: (fieldName) => upload.single(fieldName),
  
  // Multer middleware for multiple image uploads
  uploadMultiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),

  // Upload image to Cloudinary
  uploadToCloudinary: async (buffer, folder = 'hotel-booking') => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height
            });
          }
        }
      ).end(buffer);
    });
  },

  // Upload multiple images to Cloudinary
  uploadMultipleToCloudinary: async (files, folder = 'hotel-booking') => {
    try {
      const uploadPromises = files.map(file => 
        imageService.uploadToCloudinary(file.buffer, folder)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  },

  // Delete image from Cloudinary
  deleteFromCloudinary: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  },

  // Delete multiple images from Cloudinary
  deleteMultipleFromCloudinary: async (publicIds) => {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return result;
    } catch (error) {
      throw new Error(`Multiple image deletion failed: ${error.message}`);
    }
  },

  // Generate image URL with transformations
  generateImageUrl: (publicId, transformations = {}) => {
    const defaultTransformations = {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    };
    
    const finalTransformations = { ...defaultTransformations, ...transformations };
    
    return cloudinary.url(publicId, finalTransformations);
  },

  // Generate thumbnail URL
  generateThumbnail: (publicId, width = 150, height = 150) => {
    return cloudinary.url(publicId, {
      width: width,
      height: height,
      crop: 'thumb',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    });
  },

  // Process hotel images (create multiple sizes)
  processHotelImages: async (files, hotelId) => {
    try {
      const folder = `hotel-booking/hotels/${hotelId}`;
      const uploadedImages = await imageService.uploadMultipleToCloudinary(files, folder);
      
      // Generate different sizes for each image
      const processedImages = uploadedImages.map(image => ({
        url: image.url,
        public_id: image.public_id,
        thumbnail: imageService.generateThumbnail(image.public_id),
        medium: imageService.generateImageUrl(image.public_id, { width: 800, height: 600 }),
        large: imageService.generateImageUrl(image.public_id, { width: 1200, height: 900 })
      }));
      
      return processedImages;
    } catch (error) {
      throw new Error(`Hotel image processing failed: ${error.message}`);
    }
  },

  // Process user profile image
  processProfileImage: async (file, userId) => {
    try {
      const folder = `hotel-booking/users/${userId}`;
      const uploadedImage = await imageService.uploadToCloudinary(file.buffer, folder);
      
      return {
        url: uploadedImage.url,
        public_id: uploadedImage.public_id,
        thumbnail: imageService.generateThumbnail(uploadedImage.public_id, 100, 100)
      };
    } catch (error) {
      throw new Error(`Profile image processing failed: ${error.message}`);
    }
  }
};

module.exports = imageService;
