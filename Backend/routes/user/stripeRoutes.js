const express = require('express');
const router = express.Router();

const stripeController = require('../../controllers/hybrid/stripeController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');





// Route to create a payment intent (frontend can call this to initiate a payment)
router.post('/create-checkout-session',userAuthMiddleware(), stripeController.createCheckoutSession);

// Route to retrieve all past Stripe events (for logging/debugging)
router.get('/events', stripeController.getStripeEvents);

// Route to refund a payment (frontend can call this to process a refund)
router.post('/refund', stripeController.refundPayment);

module.exports = router;
