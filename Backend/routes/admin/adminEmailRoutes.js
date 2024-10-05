const express = require('express');
const router = express.Router();
const emailController = require('../../controllers/admin/adminEmailController');

// Route to send a custom email
router.post('/send-custom', emailController.sendCustomEmail);

// Route to send a promotional email
router.post('/send-promotions', emailController.sendPromotionalEmail);

// Route to send an order update email
router.post('/send-order-update', emailController.sendOrderUpdateEmail);

// Route to send a newsletter email
router.post('/send-newsletter', emailController.sendNewsletterEmail);

// Route to search for users to email
router.get('/search-users', emailController.searchUsers);

module.exports = router;
