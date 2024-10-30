const express = require('express');
const router = express.Router();
const { getUserGallery } = require('../../controllers/user/userGalleryController');

// Define the route to get gallery items
router.get('/get-gallery', getUserGallery);

module.exports = router;