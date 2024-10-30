const express = require('express');
const multer = require('multer');
const { addGalleryItem, getGalleryItems, updateGalleryItem, deleteGalleryItem } = require('../../controllers/admin/galleryController');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'galleryuploads/'); // Specify your directory here
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use a timestamp to avoid naming conflicts
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Define your routes
router.get('/get-gallery-items', getGalleryItems);
router.post('/add-gallery-items', upload.single('image'), addGalleryItem); // Multer middleware added here
router.put('/update-gallery-item/:id', upload.single('image'), updateGalleryItem);
router.delete('/delete-gallery-items/:id', deleteGalleryItem);

module.exports = router;