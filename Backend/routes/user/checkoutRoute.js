const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleStripeWebhook } = require('../controllers/checkoutController');

// Route for creating a Stripe checkout session
router.post('/create-checkout-session', createCheckoutSession);

// Route for handling Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
