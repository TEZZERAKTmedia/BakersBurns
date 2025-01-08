const express = require('express');
const router = express.Router();
const { handleGuestWebhook } = require('../../controllers/hybrid/stripeGuestController');

// Route to handle Stripe webhook events for guest checkout
router.post('/', express.raw({ type: 'application/json' }), handleGuestWebhook);

module.exports = router;
