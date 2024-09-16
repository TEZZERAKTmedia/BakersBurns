const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleStripeWebhook, getProducts, addToCart, removeFromCart } = require('../controllers/user/storeController');
const { getCart } = require('../controllers/user/cartController')

// Universal routes
router.get('/', getProducts);  // Get all products

// User routes
router.get('/:userId/', getCart);  // Get user's cart
router.post('/', addToCart);  // Add product to cart
router.delete('/:userId/:productId', removeFromCart);  // Remove product from cart
router.post('/create-checkout-session', createCheckoutSession);  // Create Stripe checkout session

// Route for handling Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
