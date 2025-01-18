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


const socialIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../socialIcons')); // Save files to 'uploads/socialIcons'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Define file filter for social icons
const socialIconFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF files are allowed.'));
  }
};

// Create the socialIconUpload middleware
const socialIconUploadMiddleware = multer({
  storage: socialIconStorage,
  fileFilter: socialIconFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([{ name: 'image', maxCount: 1 }]);

const middlewareWrapper = (req, res, next) => {
  socialIconUploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Error in Multer middleware:', err.message);
      return res.status(400).json({ error: 'File upload failed', details: err.message });
    }

    console.log('Multer processed files:', req.files); // Should log the uploaded file
    next();
  });
};

module.exports = { socialIconUploadMiddleware: middlewareWrapper };



module.exports = {
  socialIconUploadMiddleware,// Use for single file uploads
  productUploadMiddleware, // Use for multiple file uploads
   // Use for gallery images
};
