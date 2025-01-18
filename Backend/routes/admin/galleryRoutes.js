const express = require('express');
const {galleryUpload} = require('../../config/multer');
const { addGalleryItem, getGalleryItems, updateGalleryItem, deleteGalleryItem } = require('../../controllers/admin/galleryController');

const router = express.Router();




router.get('/get-gallery-items', getGalleryItems);
router.post('/add-gallery-items',  addGalleryItem); // Multer middleware added here
router.put('/update-gallery-item/:id',  updateGalleryItem);
router.delete('/delete-gallery-items/:id', deleteGalleryItem);

module.exports = router;