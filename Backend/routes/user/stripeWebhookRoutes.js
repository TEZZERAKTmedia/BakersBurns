const express = require('express');
const router = express.Router();  // This line creates the router object

const stripeWebhookController = require('../../controllers/hybrid/stripeWebhookController');
const stripeWebhookMiddleware = require('../../middleware/stripeWebhookMiddleware');

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),  // Raw body for Stripe webhook
  stripeWebhookMiddleware,
  stripeWebhookController.handleWebhook
);

module.exports = router;
