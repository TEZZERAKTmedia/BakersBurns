const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleStripeWebhook } = require('../controllers/checkoutController');
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const {productUpload} = require('../config/multer'); // Add multer config
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');




//Admin routes
router.post('/', productUpload.single('image'), addProduct); // Handle single image upload
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

//Universal routes
router.get('/', getProducts);

//User routes
router.get('/:userId/', getCart);
router.post('/', addToCart);
router.delete('/:userId/:productId', removeFromCart);
router.post('/create-checkout-session', createCheckoutSession);


// Route for handling Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;