const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../../controllers/hybrid/stripeWebhookController');
const stripeController = require('../../controllers/hybrid/stripeController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');
const stripeWebhookMiddleware = require('../../middleware/stripeWebhookMiddleware');

// Route to handle Stripe webhooks
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookMiddleware,
  stripeWebhookController.handleWebhook
);

// Route to create a payment intent (frontend can call this to initiate a payment)
router.post('/create-checkout-session',userAuthMiddleware(), stripeController.createCheckoutSession);

// Route to retrieve all past Stripe events (for logging/debugging)
router.get('/events', stripeController.getStripeEvents);

// Route to refund a payment (frontend can call this to process a refund)
router.post('/refund', stripeController.refundPayment);

module.exports = router;
