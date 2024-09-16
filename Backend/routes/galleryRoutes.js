const express = require('express');
const router = express.Router();
const { galleryUpload } = require('../config/multer');
const { getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem } = require('../controllers/admin/galleryController');
//Get all gallery items
router.get('/gallery', getGalleryItems);
//Add a new gallery item
router.post('/gallery', galleryUpload.single('image'), addGalleryItem);
//Update an exisiting gallery item
router.put('/gallery/:id', updateGalleryItem);
//Delete a gallery item
router.delete('/gallery/:id', deleteGalleryItem);

module.exports = router;