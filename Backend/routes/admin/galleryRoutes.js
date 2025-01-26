const express = require('express');
const { galleryUploadMiddleware } = require('../../config/multer');
const {
  addGalleryItem,
  getGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../../controllers/admin/galleryController');

const router = express.Router();

// Route to fetch all gallery items
router.get('/get-gallery-items', getGalleryItems);

// Route to add new gallery items with multer middleware
router.post('/add-gallery-items', galleryUploadMiddleware, addGalleryItem);


// Route to update a gallery item
router.put('/update-gallery-item/:id', updateGalleryItem);

// Route to delete a gallery item
router.delete('/delete-gallery-items/:id', deleteGalleryItem);

module.exports = router;
