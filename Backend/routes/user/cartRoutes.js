const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/user/cartController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');

// Protect routes with authentication middleware
router.get('/', userAuthMiddleware(), cartController.getCart); // Use middleware to get user ID from the token
router.post('/add-to-cart', userAuthMiddleware(), cartController.addToCart);
router.delete('/:productId', userAuthMiddleware(), cartController.removeFromCart);
router.get('/details/:productId', userAuthMiddleware(''), cartController.getProductDetails);

module.exports = router;
