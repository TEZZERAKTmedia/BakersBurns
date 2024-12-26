const multer = require('multer');
const path = require('path');

// MIME type validation function for product media
const productFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'video/mp4',
      'video/quicktime', // MIME type for MOV files
      'video/x-msvideo'  // MIME type for AVI files
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
  } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and videos (MP4, MOV, AVI) are allowed!'), false);
  }
};


// Configure storage for product media
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for product media
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Append timestamp to prevent conflicts
  },
});

// Middleware for handling both thumbnail and media files dynamically
const productUploadMiddleware = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // File size limit (50 MB)
}).fields([
  { name: 'thumbnail', maxCount: 1 }, // Single thumbnail
  { name: 'media', maxCount: 10 },   // Up to 10 media files
]);

// Middleware for handling both `thumbnail` and `media` fields


// Middleware for gallery uploads
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'galleryuploads/'); // Destination folder for gallery images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Append timestamp and file extension
  },
});

const galleryUpload = multer({
  storage: galleryStorage,
  fileFilter: productFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // File size limit (50 MB)
});

module.exports = {
  // Use for single file uploads
  productUploadMiddleware, // Use for multiple file uploads
  galleryUpload, // Use for gallery images
};
