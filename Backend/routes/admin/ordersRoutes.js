// routes/ordersRoutes.js

const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/admin/adminOrdersController');

// Route to get all active orders
router.get('/', ordersController.getOrders);

// Route to get details of a specific order
router.get('/:id', ordersController.getOrderDetails);

// Route to contact the user who placed an order
router.post('/contact', ordersController.contactUser);

module.exports = router;
