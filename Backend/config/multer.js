const multer = require('multer');
const path = require('path');

// MIME type validation function
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only images are allowed (JPEG, JPG, PNG)!');
  }
};

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for product images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp and file extension
  }
});

const productUpload = multer({ 
  storage: productStorage,
  fileFilter: imageFileFilter, // File type validation
  limits: { fileSize: 50 * 1024 * 1024 } // File size limit (2 MB example)
});

// Configure storage for gallery images
const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'gallery/'); // Destination folder for gallery images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp and file extension
  }
});

const galleryUpload = multer({ 
  storage: galleryStorage,
  fileFilter: imageFileFilter, // File type validation
  limits: { fileSize: 50 * 1024 * 1024 } // File size limit (2 MB example)
});

// Export both configurations
module.exports = {
  productUpload,
  galleryUpload
};
