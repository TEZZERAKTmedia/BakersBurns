const express = require('express');
const router = express.Router();
const emailController = require('../../controllers/admin/adminEmailController');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');

// Route to send a custom email
router.post('/send-custom', adminAuthMiddleware('admin'), emailController.sendCustomEmail);

// Route to send a promotional email
router.post('/send-promotions', emailController.sendPromotionalEmail);

// Route to send an order update email
router.post('/send-order-update', adminAuthMiddleware('admin'), emailController.sendOrderUpdateEmail);

// Route to send a newsletter email
router.post('/send-newsletter', adminAuthMiddleware('admin'), emailController.sendNewsletterEmail);

router.post('/send-privacy-email', adminAuthMiddleware('admin'), emailController.sendPrivacyPolicyUpdateEmail);

router.post('/send-terms-of-service', adminAuthMiddleware('admin'), emailController.sendTermsOfServiceUpdateEmail);
// Route to search for users to email
router.get('/search-users', adminAuthMiddleware('admin'), emailController.searchUsers);


module.exports = router;
