const express = require('express');
const { getOrdersForUser, getOrderForUserById } = require('../../controllers/user/ordersCotroller');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');
const router = express.Router();

// Routes
router.get('/get-orders', userAuthMiddleware(), getOrdersForUser);        // Get all orders for authenticated user
router.get('/get-details/:orderId', userAuthMiddleware(), getOrderForUserById);  // Get specific order by ID

module.exports = router;
