const express = require('express');
const { getSocialLinks } = require('../../controllers/register/socialController');

const router = express.Router();

// Define the route
router.get('/social-links', getSocialLinks);

module.exports = router;