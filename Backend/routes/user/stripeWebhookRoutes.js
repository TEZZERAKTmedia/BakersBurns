const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../../controllers/hybrid/stripeWebhookController');

// Route to handle Stripe webhook events
router.post('/', express.raw({ type: 'application/json' }), (req, res, next) => {
  console.log("Stripe webhook route accessed.");
  next(); // Move to the controller function
}, handleWebhook);

module.exports = router;
