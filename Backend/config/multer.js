const multer = require('multer');
const path = require('path');

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for product images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp and file extension
  }
});

const productUpload = multer({ storage: productStorage });

// Configure storage for gallery images
const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'gallery/'); // Destination folder for gallery images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp and file extension
  }
});

const galleryUpload = multer({ storage: galleryStorage });

// Export both configurations
module.exports = {
  productUpload,
  galleryUpload
};
