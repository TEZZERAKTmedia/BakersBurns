const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleStripeWebhook, getProducts, addToCart, removeFromCart, getFeaturedProducts, getProductMedia, getProductTypes } = require('../../controllers/user/storeController');
const { getCart } = require('../../controllers/user/cartController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');


//GET
router.get('/',userAuthMiddleware(), getProducts);  // Get all products
router.get('/get-cart',userAuthMiddleware(), getCart);  // Get user's cart
router.get('/get-featured-products', userAuthMiddleware(), getFeaturedProducts);
router.get('/:id/media', userAuthMiddleware('user'), getProductMedia);
router.get('/product-types', userAuthMiddleware(), getProductTypes); 

router.post('/add-to-cart',userAuthMiddleware(), addToCart);  // Add product to cart
router.delete('/remove-from-cart', userAuthMiddleware(),removeFromCart);  // Remove product from cart
router.post('/create-checkout-session',userAuthMiddleware(), createCheckoutSession);  // Create Stripe checkout session

// Route for handling Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
